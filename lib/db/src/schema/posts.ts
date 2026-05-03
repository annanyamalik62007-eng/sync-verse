import { pgTable, text, timestamp, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const postsTable = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    zone: text("zone").notNull(),
    body: text("body").notNull(),
    activityTag: text("activity_tag"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    authorIdx: index("posts_author_idx").on(t.authorId),
    zoneIdx: index("posts_zone_idx").on(t.zone),
    createdIdx: index("posts_created_idx").on(t.createdAt),
  }),
);

export const postReactionsTable = pgTable(
  "post_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("post_reactions_uniq").on(t.postId, t.userId, t.kind),
    postIdx: index("post_reactions_post_idx").on(t.postId),
  }),
);

export const postJoinsTable = pgTable(
  "post_joins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniq: uniqueIndex("post_joins_uniq").on(t.postId, t.userId),
    postIdx: index("post_joins_post_idx").on(t.postId),
  }),
);

export type PostRow = typeof postsTable.$inferSelect;
export type PostReactionRow = typeof postReactionsTable.$inferSelect;
export type PostJoinRow = typeof postJoinsTable.$inferSelect;
