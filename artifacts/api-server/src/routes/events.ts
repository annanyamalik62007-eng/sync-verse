import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import {
  db,
  usersTable,
  eventsTable,
  eventRsvpsTable,
  type EventRow,
  type UserRow,
} from "@workspace/db";
import {
  ListEventsQueryParams,
  CreateEventBody,
  ToggleEventRsvpParams,
  ToggleEventRsvpBody,
  ToggleEventRsvpResponse,
  ListEventsResponse,
} from "@workspace/api-zod";
import { rowToUser } from "../lib/matching";

const router: IRouter = Router();

async function hydrateEvents(rows: EventRow[], viewerId: string | undefined) {
  if (rows.length === 0) return [];
  const eventIds = rows.map((e) => e.id);
  const rsvps = await db
    .select()
    .from(eventRsvpsTable)
    .where(inArray(eventRsvpsTable.eventId, eventIds));
  const userIds = new Set<string>();
  for (const r of rsvps) userIds.add(r.userId);
  for (const e of rows) if (e.hostUserId) userIds.add(e.hostUserId);
  const users: UserRow[] = userIds.size
    ? await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.id, Array.from(userIds)))
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));
  return rows.map((e) => {
    const eRsvps = rsvps.filter((r) => r.eventId === e.id);
    const attendees = eRsvps
      .map((r) => userById.get(r.userId))
      .filter((u): u is UserRow => Boolean(u))
      .map(rowToUser);
    const host = e.hostUserId ? userById.get(e.hostUserId) : undefined;
    return {
      id: e.id,
      college: e.college,
      title: e.title,
      description: e.description,
      zone: e.zone,
      location: e.location,
      startsAt: e.startsAt.toISOString(),
      host: host ? rowToUser(host) : undefined,
      attendees,
      attendeeCount: attendees.length,
      isAttending: viewerId
        ? eRsvps.some((r) => r.userId === viewerId)
        : false,
      createdAt: e.createdAt.toISOString(),
    };
  });
}

router.get("/events", async (req, res): Promise<void> => {
  const parsed = ListEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { college, userId } = parsed.data;
  const now = new Date();
  const upcomingOnly = gte(eventsTable.startsAt, now);
  // Always return all upcoming events, with same-college first so the user's
  // own campus is highlighted — but cross-college events are always present
  // so the feed never feels empty regardless of which college the user picked.
  const allRows = await db
    .select()
    .from(eventsTable)
    .where(upcomingOnly)
    .orderBy(asc(eventsTable.startsAt));
  const rows = college
    ? [
        ...allRows.filter((r) => r.college === college),
        ...allRows.filter((r) => r.college !== college),
      ]
    : allRows;
  const hydrated = await hydrateEvents(rows, userId);
  res.json(ListEventsResponse.parse(hydrated));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [host] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.hostUserId));
  if (!host) {
    res.status(404).json({ error: "Host not found" });
    return;
  }
  const startsAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    res.status(400).json({ error: "Invalid startsAt" });
    return;
  }
  const [created] = await db
    .insert(eventsTable)
    .values({
      college: host.college,
      title: parsed.data.title,
      description: parsed.data.description,
      zone: parsed.data.zone,
      location: parsed.data.location,
      startsAt,
      hostUserId: host.id,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create" });
    return;
  }
  // host auto-RSVPs
  await db
    .insert(eventRsvpsTable)
    .values({ eventId: created.id, userId: host.id });
  const [hydrated] = await hydrateEvents([created], host.id);
  res.status(201).json(hydrated);
});

router.post("/events/:eventId/rsvp", async (req, res): Promise<void> => {
  const params = ToggleEventRsvpParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = ToggleEventRsvpBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.eventId));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const existing = await db
    .select()
    .from(eventRsvpsTable)
    .where(
      and(
        eq(eventRsvpsTable.eventId, params.data.eventId),
        eq(eventRsvpsTable.userId, body.data.userId),
      ),
    );
  if (existing.length > 0) {
    await db
      .delete(eventRsvpsTable)
      .where(
        and(
          eq(eventRsvpsTable.eventId, params.data.eventId),
          eq(eventRsvpsTable.userId, body.data.userId),
        ),
      );
  } else {
    await db
      .insert(eventRsvpsTable)
      .values({ eventId: params.data.eventId, userId: body.data.userId });
  }
  const [hydrated] = await hydrateEvents([event], body.data.userId);
  res.json(ToggleEventRsvpResponse.parse(hydrated));
});

// Suppress unused import warning for desc - imported for future use
void desc;

export default router;
