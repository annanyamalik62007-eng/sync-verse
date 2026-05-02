import { Router, type IRouter } from "express";
import { and, eq, gte } from "drizzle-orm";
import { db, usersTable, squadsTable } from "@workspace/db";
import {
  ListLiveSignalsQueryParams,
  ListLiveSignalsResponse,
  GetCommunityInsightsQueryParams,
  GetCommunityInsightsResponse,
  GetFomoTriggersQueryParams,
  GetFomoTriggersResponse,
  GetZoneActivityResponse,
} from "@workspace/api-zod";
import { tokens, timeAgoFrom } from "../lib/matching";

const ZONES = [
  "career",
  "startup",
  "study",
  "social",
  "creative",
  "fitness",
  "research",
] as const;

const ZONE_ACTIVITY_VERBS: Record<string, string> = {
  career: "polishing resumes and chasing offers",
  startup: "forming startup teams right now",
  study: "looking for study partners",
  social: "making plans tonight",
  creative: "shipping creative work",
  fitness: "training together",
  research: "diving into papers",
};

const router: IRouter = Router();

router.get("/signals", async (req, res): Promise<void> => {
  const parsed = ListLiveSignalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { college } = parsed.data;
  const rows = college
    ? await db.select().from(usersTable).where(eq(usersTable.college, college))
    : await db.select().from(usersTable);

  const signals = [] as Array<{
    id: string;
    message: string;
    zone: string;
    intensity: "low" | "medium" | "high";
    count: number;
    timeAgo: string;
  }>;

  // Per-zone activity signals
  for (const zone of ZONES) {
    const inZone = rows.filter((r) => r.zone === zone);
    const livingNow = inZone.filter((r) => r.timeframe === "now").length;
    const building = inZone.filter((r) => r.energyLevel === "building").length;
    if (inZone.length === 0) continue;
    const verb = ZONE_ACTIVITY_VERBS[zone] ?? "active in this zone";
    if (livingNow > 0) {
      signals.push({
        id: `sig-${zone}-now`,
        message: `${livingNow} ${verb} — right now`,
        zone,
        intensity: livingNow >= 3 ? "high" : livingNow >= 2 ? "medium" : "low",
        count: livingNow,
        timeAgo: "live",
      });
    }
    if (building > 0) {
      signals.push({
        id: `sig-${zone}-building`,
        message: `${building} in build mode in ${zone}`,
        zone,
        intensity: building >= 3 ? "high" : "medium",
        count: building,
        timeAgo: "this hour",
      });
    }
  }

  // Recent drop-ins
  const recent = [...rows]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  for (const r of recent) {
    signals.push({
      id: `sig-drop-${r.id}`,
      message: `${r.name.split(" ")[0]} dropped in: "${r.intent.slice(0, 60)}${r.intent.length > 60 ? "..." : ""}"`,
      zone: r.zone,
      intensity: r.timeframe === "now" ? "high" : "medium",
      count: 1,
      timeAgo: timeAgoFrom(r.createdAt),
    });
  }

  res.json(ListLiveSignalsResponse.parse(signals.slice(0, 20)));
});

router.get("/insights/community", async (req, res): Promise<void> => {
  const parsed = GetCommunityInsightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { college } = parsed.data;
  const rows = college
    ? await db.select().from(usersTable).where(eq(usersTable.college, college))
    : await db.select().from(usersTable);

  // Trending activities — extract top tokens
  const tokenCounts = new Map<string, { count: number; zone: string }>();
  for (const r of rows) {
    for (const t of tokens(r.intent)) {
      const cur = tokenCounts.get(t) ?? { count: 0, zone: r.zone };
      cur.count += 1;
      tokenCounts.set(t, cur);
    }
  }
  const trendingActivities = [...tokenCounts.entries()]
    .filter(([, v]) => v.count >= 1)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([label, v]) => ({ label, count: v.count, zone: v.zone }));

  const squadCounts = await db.select().from(squadsTable);
  const mostActiveZones = ZONES.map((zone) => {
    const inZone = rows.filter((r) => r.zone === zone);
    const livingNow = inZone.filter((r) => r.timeframe === "now").length;
    const sqCount = squadCounts.filter((s) => s.zone === zone).length;
    const trendDirection: "up" | "steady" | "down" =
      livingNow >= 2 ? "up" : inZone.length >= 1 ? "steady" : "down";
    return {
      zone,
      activeUsers: inZone.length,
      livingNow,
      squads: sqCount,
      trendDirection,
    };
  })
    .filter((z) => z.activeUsers > 0)
    .sort((a, b) => b.activeUsers - a.activeUsers);

  const commonNeeds: string[] = [];
  const buildingCount = rows.filter((r) => r.energyLevel === "building").length;
  const exploringCount = rows.filter((r) => r.energyLevel === "exploring").length;
  const nowCount = rows.filter((r) => r.timeframe === "now").length;
  if (buildingCount >= 2)
    commonNeeds.push(`${buildingCount} students ready to build — looking for collaborators`);
  if (exploringCount >= 2)
    commonNeeds.push(`${exploringCount} exploring next steps — open to ideas`);
  if (nowCount >= 2)
    commonNeeds.push(`${nowCount} want action right now — momentum is forming`);
  if (commonNeeds.length === 0) commonNeeds.push("The ecosystem is warming up — drop your intent to spark it");

  res.json(
    GetCommunityInsightsResponse.parse({
      trendingActivities,
      mostActiveZones,
      commonNeeds,
      totalActiveNow: nowCount,
    }),
  );
});

router.get("/insights/fomo", async (req, res): Promise<void> => {
  const parsed = GetFomoTriggersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { college } = parsed.data;
  const rows = college
    ? await db.select().from(usersTable).where(eq(usersTable.college, college))
    : await db.select().from(usersTable);

  const triggers: Array<{
    id: string;
    message: string;
    urgency: "subtle" | "medium" | "high";
    relatedZone: string;
  }> = [];

  for (const zone of ZONES) {
    const live = rows.filter((r) => r.zone === zone && r.timeframe === "now");
    if (live.length >= 3) {
      triggers.push({
        id: `fomo-${zone}-cluster`,
        message: `${live.length} people are already moving on this in ${zone}`,
        urgency: "high",
        relatedZone: zone,
      });
    } else if (live.length >= 1) {
      triggers.push({
        id: `fomo-${zone}-active`,
        message: `This opportunity is active right now in ${zone}`,
        urgency: "medium",
        relatedZone: zone,
      });
    }
  }

  // Recently formed squads
  const fifteenMin = new Date(Date.now() - 15 * 60 * 1000);
  const recentSquads = await db
    .select()
    .from(squadsTable)
    .where(gte(squadsTable.createdAt, fifteenMin));
  for (const sq of recentSquads.slice(0, 3)) {
    triggers.push({
      id: `fomo-squad-${sq.id}`,
      message: `A new squad just formed in ${sq.zone} — momentum is real`,
      urgency: "medium",
      relatedZone: sq.zone,
    });
  }

  if (triggers.length === 0) {
    triggers.push({
      id: "fomo-empty",
      message: "Be the first signal — your intent will pull others in",
      urgency: "subtle",
      relatedZone: "social",
    });
  }

  res.json(GetFomoTriggersResponse.parse(triggers.slice(0, 8)));
});

router.get("/insights/zones", async (_req, res): Promise<void> => {
  const rows = await db.select().from(usersTable);
  const squads = await db.select().from(squadsTable);
  const out = ZONES.map((zone) => {
    const inZone = rows.filter((r) => r.zone === zone);
    const livingNow = inZone.filter((r) => r.timeframe === "now").length;
    const sqCount = squads.filter((s) => s.zone === zone).length;
    const trendDirection: "up" | "steady" | "down" =
      livingNow >= 2 ? "up" : inZone.length >= 1 ? "steady" : "down";
    return {
      zone,
      activeUsers: inZone.length,
      livingNow,
      squads: sqCount,
      trendDirection,
    };
  });
  res.json(GetZoneActivityResponse.parse(out));
});

// Touch unused import to satisfy linters in some setups
void and;

export default router;
