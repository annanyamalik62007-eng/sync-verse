import { Router, type IRouter } from "express";
import { eq, ne } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  GetMatchesForUserParams,
  GetMatchesForUserResponse,
} from "@workspace/api-zod";
import { rowToUser, scoreMatch, userZones } from "../lib/matching";

const router: IRouter = Router();

router.get("/users/:userId/matches", async (req, res): Promise<void> => {
  const parsed = GetMatchesForUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [me] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.userId));
  if (!me) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  // Pull every other user. Strategy: same college + same zone first (real
  // local cohort), then same zone from anywhere RELABELED to user's college
  // (demo same-intent peers), then same college other zones (still a campus
  // fit), then anyone relabeled as last resort. This guarantees a "social"
  // user mostly sees other social-zone people, etc.
  const allOthers = await db
    .select()
    .from(usersTable)
    .where(ne(usersTable.id, me.id));

  const seen = new Set<string>();
  const deck: ReturnType<typeof scoreMatch>[] = [];
  const pushScored = (rows: typeof allOthers): void => {
    const scored = rows
      .filter((o) => !seen.has(o.id))
      .map((o) => {
        seen.add(o.id);
        return scoreMatch(me, o);
      })
      .sort((a, b) => b.alignmentScore - a.alignmentScore);
    deck.push(...scored);
  };

  // Match using the union of every zone the user picked (primary + extras).
  // Anyone who shares ANY zone counts as a zone-overlap match.
  const myZones = userZones(me);
  const overlaps = (o: (typeof allOthers)[number]): boolean => {
    for (const z of userZones(o)) if (myZones.has(z)) return true;
    return false;
  };

  // 1. same college + zone overlap — strongest real signal
  pushScored(allOthers.filter((o) => o.college === me.college && overlaps(o)));

  // 2. zone overlap, any college, RELABELED to user's college (demo fill)
  const remoteSameZone = allOthers
    .filter((o) => o.college !== me.college && overlaps(o))
    .map((o) => ({ ...o, college: me.college }));
  pushScored(remoteSameZone);

  // 3. same college, no zone overlap — still local, different vibe
  pushScored(allOthers.filter((o) => o.college === me.college && !overlaps(o)));

  const MIN_DECK = 12;
  // 4. last-resort demo fill: anyone, relabeled to user's college
  if (deck.length < MIN_DECK) {
    const filler = allOthers
      .filter((o) => !seen.has(o.id))
      .map((o) => ({ ...o, college: me.college }));
    pushScored(filler);
  }

  const scored = deck.slice(0, 50).map((m) => ({
    ...m,
    user: rowToUser(m.user),
  }));

  res.json(GetMatchesForUserResponse.parse(scored));
});

export default router;
