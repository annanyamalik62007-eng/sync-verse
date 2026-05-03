import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  ListUsersResponse,
  CreateUserBody,
  GetUserParams,
  GetUserResponse,
  UpdateUserBody,
} from "@workspace/api-zod";
import { pickAvatarColor, pickAvatarUrl, rowToUser } from "../lib/matching";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { zone, college } = parsed.data;
  const conditions = [];
  if (zone) conditions.push(eq(usersTable.zone, zone));
  if (college) conditions.push(eq(usersTable.college, college));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(usersTable)
          .where(and(...conditions))
          .orderBy(desc(usersTable.createdAt))
      : await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

  res.json(ListUsersResponse.parse(rows.map(rowToUser)));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const avatarColor = pickAvatarColor(data.name + data.major);
  const avatarUrl =
    data.avatarUrl && data.avatarUrl.trim().length > 0
      ? data.avatarUrl
      : pickAvatarUrl(data.name + data.college + data.major, data.gender);
  const [row] = await db
    .insert(usersTable)
    .values({ ...data, avatarColor, avatarUrl })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }
  res.status(201).json(GetUserResponse.parse(rowToUser(row)));
});

router.get("/users/:userId", async (req, res): Promise<void> => {
  const parsed = GetUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.userId));
  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetUserResponse.parse(rowToUser(row)));
});

router.patch("/users/:userId", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body.data)) {
    if (v !== undefined) patch[k] = v;
  }
  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  const [row] = await db
    .update(usersTable)
    .set(patch)
    .where(eq(usersTable.id, params.data.userId))
    .returning();
  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetUserResponse.parse(rowToUser(row)));
});

export default router;
