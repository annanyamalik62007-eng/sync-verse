import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
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
  // Matches are scoped to the same college — campus connection is the whole point.
  const others = await db
    .select()
    .from(usersTable)
    .where(and(ne(usersTable.id, me.id), eq(usersTable.college, me.college)));

  const scored = others
    .map((o) => scoreMatch(me, o))
    .sort((a, b) => b.alignmentScore - a.alignmentScore)
    .slice(0, 8)
    .map((m) => ({
      ...m,
      user: rowToUser(m.user),
    }));

  res.json(GetMatchesForUserResponse.parse(scored));
});

export default router;
