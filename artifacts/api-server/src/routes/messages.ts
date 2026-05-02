import { Router, type IRouter } from "express";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import {
  db,
  usersTable,
  messagesTable,
  type MessageRow,
  type UserRow,
} from "@workspace/db";
import {
  SendMessageBody,
  ListThreadsForUserParams,
  ListThreadsForUserResponse,
  ListMessagesBetweenParams,
  ListMessagesBetweenResponse,
} from "@workspace/api-zod";
import { rowToUser } from "../lib/matching";

const router: IRouter = Router();

const messageRowToDto = (m: MessageRow) => ({
  id: m.id,
  fromUserId: m.fromUserId,
  toUserId: m.toUserId,
  content: m.content,
  createdAt: m.createdAt.toISOString(),
});

router.post("/messages", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.fromUserId === parsed.data.toUserId) {
    res.status(400).json({ error: "Cannot message yourself" });
    return;
  }
  const [from] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.fromUserId));
  const [to] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.toUserId));
  if (!from || !to) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [created] = await db
    .insert(messagesTable)
    .values({
      fromUserId: parsed.data.fromUserId,
      toUserId: parsed.data.toUserId,
      content: parsed.data.content,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to send" });
    return;
  }
  res.status(201).json(messageRowToDto(created));
});

router.get("/users/:userId/threads", async (req, res): Promise<void> => {
  const parsed = ListThreadsForUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = parsed.data.userId;
  const all = await db
    .select()
    .from(messagesTable)
    .where(or(eq(messagesTable.fromUserId, userId), eq(messagesTable.toUserId, userId)))
    .orderBy(desc(messagesTable.createdAt));

  const threadByOther = new Map<string, MessageRow>();
  for (const m of all) {
    const otherId = m.fromUserId === userId ? m.toUserId : m.fromUserId;
    if (!threadByOther.has(otherId)) threadByOther.set(otherId, m);
  }
  const otherIds = Array.from(threadByOther.keys());
  const others: UserRow[] = otherIds.length
    ? await db.select().from(usersTable).where(inArray(usersTable.id, otherIds))
    : [];
  const otherById = new Map(others.map((u) => [u.id, u]));

  const threads = otherIds
    .map((oid) => {
      const u = otherById.get(oid);
      const last = threadByOther.get(oid);
      if (!u || !last) return null;
      return {
        otherUser: rowToUser(u),
        lastMessage: messageRowToDto(last),
        unread: last.toUserId === userId,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  res.json(ListThreadsForUserResponse.parse(threads));
});

router.get("/users/:meId/messages/:otherId", async (req, res): Promise<void> => {
  const parsed = ListMessagesBetweenParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { meId, otherId } = parsed.data;
  const rows = await db
    .select()
    .from(messagesTable)
    .where(
      or(
        and(eq(messagesTable.fromUserId, meId), eq(messagesTable.toUserId, otherId)),
        and(eq(messagesTable.fromUserId, otherId), eq(messagesTable.toUserId, meId)),
      ),
    )
    .orderBy(messagesTable.createdAt);
  res.json(ListMessagesBetweenResponse.parse(rows.map(messageRowToDto)));
});

export default router;
