import { Router, type IRouter } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  usersTable,
  postsTable,
  postReactionsTable,
  postJoinsTable,
  type PostRow,
  type UserRow,
} from "@workspace/db";
import {
  ListZonePostsParams,
  ListZonePostsResponse,
  ListUserPostsParams,
  ListUserPostsResponse,
  CreatePostBody,
  TogglePostReactionParams,
  TogglePostReactionBody,
  TogglePostJoinParams,
  TogglePostJoinBody,
} from "@workspace/api-zod";
import { rowToUser } from "../lib/matching";

const router: IRouter = Router();

type Hydrated = {
  id: string;
  author: ReturnType<typeof rowToUser>;
  zone: PostRow["zone"];
  body: string;
  activityTag: string | null;
  imageUrl: string | null;
  reactionCount: number;
  joinCount: number;
  reactorIds: string[];
  joinerIds: string[];
  joiners: ReturnType<typeof rowToUser>[];
  createdAt: string;
};

async function hydratePosts(rows: PostRow[]): Promise<Hydrated[]> {
  if (rows.length === 0) return [];
  const postIds = rows.map((r) => r.id);
  const authorIds = Array.from(new Set(rows.map((r) => r.authorId)));

  const [authors, reactions, joins] = await Promise.all([
    db.select().from(usersTable).where(inArray(usersTable.id, authorIds)),
    db.select().from(postReactionsTable).where(inArray(postReactionsTable.postId, postIds)),
    db.select().from(postJoinsTable).where(inArray(postJoinsTable.postId, postIds)),
  ]);

  const joinerIds = Array.from(new Set(joins.map((j) => j.userId)));
  const joiners = joinerIds.length
    ? await db.select().from(usersTable).where(inArray(usersTable.id, joinerIds))
    : [];

  const authorById = new Map(authors.map((u) => [u.id, u]));
  const joinerById = new Map(joiners.map((u) => [u.id, u]));

  const reactionsByPost = new Map<string, typeof reactions>();
  for (const r of reactions) {
    const arr = reactionsByPost.get(r.postId) ?? [];
    arr.push(r);
    reactionsByPost.set(r.postId, arr);
  }
  const joinsByPost = new Map<string, typeof joins>();
  for (const j of joins) {
    const arr = joinsByPost.get(j.postId) ?? [];
    arr.push(j);
    joinsByPost.set(j.postId, arr);
  }

  return rows.map((p): Hydrated => {
    const author = authorById.get(p.authorId);
    const myReactions = reactionsByPost.get(p.id) ?? [];
    const myJoins = joinsByPost.get(p.id) ?? [];
    return {
      id: p.id,
      author: rowToUser(author ?? ({} as UserRow)),
      zone: p.zone,
      body: p.body,
      activityTag: p.activityTag,
      imageUrl: p.imageUrl,
      reactionCount: myReactions.length,
      joinCount: myJoins.length,
      reactorIds: Array.from(new Set(myReactions.map((r) => r.userId))),
      joinerIds: Array.from(new Set(myJoins.map((j) => j.userId))),
      joiners: myJoins
        .map((j) => joinerById.get(j.userId))
        .filter((u): u is UserRow => !!u)
        .slice(0, 6)
        .map(rowToUser),
      createdAt: p.createdAt.toISOString(),
    };
  });
}

router.get("/zones/:zone/posts", async (req, res): Promise<void> => {
  const params = ListZonePostsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const rows = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.zone, params.data.zone))
    .orderBy(desc(postsTable.createdAt))
    .limit(50);
  const hydrated = await hydratePosts(rows);
  res.json(ListZonePostsResponse.parse(hydrated));
});

router.get("/users/:userId/posts", async (req, res): Promise<void> => {
  const params = ListUserPostsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const rows = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.authorId, params.data.userId))
    .orderBy(desc(postsTable.createdAt))
    .limit(50);
  const hydrated = await hydratePosts(rows);
  res.json(ListUserPostsResponse.parse(hydrated));
});

router.post("/posts", async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [author] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.authorId));
  if (!author) {
    res.status(404).json({ error: "Author not found" });
    return;
  }
  const [created] = await db
    .insert(postsTable)
    .values({
      authorId: parsed.data.authorId,
      zone: parsed.data.zone,
      body: parsed.data.body,
      activityTag: parsed.data.activityTag ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "Failed to create post" });
    return;
  }
  const [hydrated] = await hydratePosts([created]);
  res.status(201).json(hydrated);
});

router.post("/posts/:postId/react", async (req, res): Promise<void> => {
  const params = TogglePostReactionParams.safeParse(req.params);
  const body = TogglePostReactionBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { postId } = params.data;
  const { userId, kind } = body.data;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const inserted = await db
    .insert(postReactionsTable)
    .values({ postId, userId, kind })
    .onConflictDoNothing()
    .returning({ id: postReactionsTable.id });
  if (inserted.length === 0) {
    await db
      .delete(postReactionsTable)
      .where(
        and(
          eq(postReactionsTable.postId, postId),
          eq(postReactionsTable.userId, userId),
          eq(postReactionsTable.kind, kind),
        ),
      );
  }
  const [hydrated] = await hydratePosts([post]);
  res.json(hydrated);
});

router.post("/posts/:postId/join", async (req, res): Promise<void> => {
  const params = TogglePostJoinParams.safeParse(req.params);
  const body = TogglePostJoinBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { postId } = params.data;
  const { userId } = body.data;
  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const inserted = await db
    .insert(postJoinsTable)
    .values({ postId, userId })
    .onConflictDoNothing()
    .returning({ id: postJoinsTable.id });
  if (inserted.length === 0) {
    await db
      .delete(postJoinsTable)
      .where(and(eq(postJoinsTable.postId, postId), eq(postJoinsTable.userId, userId)));
  }
  const [hydrated] = await hydratePosts([post]);
  res.json(hydrated);
});

export default router;
