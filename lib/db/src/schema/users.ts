import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  college: text("college").notNull(),
  major: text("major").notNull(),
  intent: text("intent").notNull(),
  timeframe: text("timeframe").notNull(),
  energyLevel: text("energy_level").notNull(),
  zone: text("zone").notNull(),
  avatarColor: text("avatar_color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof usersTable.$inferSelect;
