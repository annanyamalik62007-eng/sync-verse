import { Router, type IRouter } from "express";
import { eq, ne } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  GetMatchesForUserParams,
  GetMatchesForUserResponse,
} from "@workspace/api-zod";
import { rowToUser, scoreMatch } from "../lib/matching";

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
  // Pull every other user, then prefer same-college but ALWAYS fill the deck
  // so a fresh-onboarded student never sees an empty matches page.
  const allOthers = await db
    .select()
    .from(usersTable)
    .where(ne(usersTable.id, me.id));

  const sameCollege = allOthers.filter((o) => o.college === me.college);
  const offCampus = allOthers.filter((o) => o.college !== me.college);

  const sameScored = sameCollege
    .map((o) => scoreMatch(me, o))
    .sort((a, b) => b.alignmentScore - a.alignmentScore);

  // If on-campus deck is thin, fill with the strongest cross-campus matches.
  const MIN_DECK = 12;
  const deck = sameScored.slice();
  if (deck.length < MIN_DECK) {
    const offScored = offCampus
      .map((o) => scoreMatch(me, o))
      .sort((a, b) => b.alignmentScore - a.alignmentScore)
      .slice(0, MIN_DECK - deck.length);
    deck.push(...offScored);
  }

  const scored = deck.slice(0, 50).map((m) => ({
    ...m,
    user: rowToUser(m.user),
  }));

  res.json(GetMatchesForUserResponse.parse(scored));
});

export default router;
