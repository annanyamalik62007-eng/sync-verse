import { Router, type IRouter } from "express";
import { and, asc, eq, gte, inArray, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  squadMembersTable,
  eventsTable,
  eventRsvpsTable,
  type UserRow,
  type EventRow,
} from "@workspace/db";
import {
  GetMajorHubQueryParams,
  GetCollegeSnapshotParams,
  GetMajorHubResponse,
  GetCollegeSnapshotResponse,
} from "@workspace/api-zod";
import { rowToUser } from "../lib/matching";

const router: IRouter = Router();

const ZONES = ["career", "startup", "study", "social", "creative", "fitness", "research"] as const;

function trendForZone(zone: string): "up" | "steady" | "down" {
  const hot = ["startup", "career", "study"];
  return hot.includes(zone) ? "up" : "steady";
}

router.get("/majors/hub", async (req, res): Promise<void> => {
  const parsed = GetMajorHubQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { major, college } = parsed.data;
  const conditions = [eq(usersTable.major, major)];
  if (college) conditions.push(eq(usersTable.college, college));
  const peers: UserRow[] = await db
    .select()
    .from(usersTable)
    .where(conditions.length === 1 ? conditions[0] : and(...conditions));

  const zoneBreakdown = ZONES.map((z) => {
    const inZone = peers.filter((p) => p.zone === z);
    return {
      zone: z,
      activeUsers: inZone.length,
      livingNow: inZone.filter((p) => p.timeframe === "now").length,
      squads: 0,
      trendDirection: trendForZone(z),
    };
  }).filter((z) => z.activeUsers > 0);

  const intentCounts = new Map<string, number>();
  for (const p of peers) {
    const tokens = p.intent
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 4);
    const phrase = tokens.slice(0, 4).join(" ");
    if (phrase) intentCounts.set(phrase, (intentCounts.get(phrase) ?? 0) + 1);
  }
  const topIntents = Array.from(intentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);

  res.json(
    GetMajorHubResponse.parse({
      major,
      college,
      peers: peers.map(rowToUser),
      zoneBreakdown,
      topIntents,
    }),
  );
});

router.get("/college/:college/snapshot", async (req, res): Promise<void> => {
  const parsed = GetCollegeSnapshotParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const college = parsed.data.college;

  const collegeUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.college, college));

  const totalActive = collegeUsers.length;
  const livingNow = collegeUsers.filter((u) => u.timeframe === "now").length;

  // Squads at this college = distinct squads with at least one member from this college
  const collegeUserIds = collegeUsers.map((u) => u.id);
  let collegeSquadCount = 0;
  if (collegeUserIds.length > 0) {
    const [row] = await db
      .select({
        count: sql<number>`count(distinct ${squadMembersTable.squadId})::int`,
      })
      .from(squadMembersTable)
      .where(inArray(squadMembersTable.userId, collegeUserIds));
    collegeSquadCount = row?.count ?? 0;
  }

  const upcoming: EventRow[] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.college, college), gte(eventsTable.startsAt, new Date())))
    .orderBy(asc(eventsTable.startsAt))
    .limit(5);

  // Hydrate attendee counts for upcoming events
  const eventIds = upcoming.map((e) => e.id);
  const rsvps = eventIds.length
    ? await db
        .select()
        .from(eventRsvpsTable)
        .where(inArray(eventRsvpsTable.eventId, eventIds))
    : [];
  const userById = new Map<string, UserRow>(collegeUsers.map((u) => [u.id, u]));
  // Some attendees may be from other colleges; fetch them too
  const missingUserIds = Array.from(
    new Set(rsvps.map((r) => r.userId).filter((id) => !userById.has(id))),
  );
  if (missingUserIds.length > 0) {
    const extra = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, missingUserIds));
    for (const u of extra) userById.set(u.id, u);
  }

  const upcomingDtos = upcoming.map((e) => {
    const eRsvps = rsvps.filter((r) => r.eventId === e.id);
    const attendees = eRsvps
      .map((r) => userById.get(r.userId))
      .filter((u): u is UserRow => Boolean(u))
      .map(rowToUser);
    return {
      id: e.id,
      college: e.college,
      title: e.title,
      description: e.description,
      zone: e.zone,
      location: e.location,
      startsAt: e.startsAt.toISOString(),
      attendees,
      attendeeCount: attendees.length,
      isAttending: false,
      createdAt: e.createdAt.toISOString(),
    };
  });

  const majorCounts = new Map<string, number>();
  for (const u of collegeUsers) {
    majorCounts.set(u.major, (majorCounts.get(u.major) ?? 0) + 1);
  }
  const topMajors = Array.from(majorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([major, count]) => ({ major, count }));

  res.json(
    GetCollegeSnapshotResponse.parse({
      college,
      totalActive,
      livingNow,
      squads: collegeSquadCount,
      upcomingEvents: upcomingDtos,
      topMajors,
    }),
  );
});

export default router;
