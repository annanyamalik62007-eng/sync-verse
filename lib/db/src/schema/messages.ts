import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: uuid("from_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    toUserId: uuid("to_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    fromIdx: index("messages_from_idx").on(t.fromUserId),
    toIdx: index("messages_to_idx").on(t.toUserId),
  }),
);

export type MessageRow = typeof messagesTable.$inferSelect;
