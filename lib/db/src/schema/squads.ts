import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const squadsTable = pgTable("squads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  purpose: text("purpose").notNull(),
  firstAction: text("first_action").notNull(),
  suggestedMeetup: text("suggested_meetup").notNull(),
  zone: text("zone").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const squadMembersTable = pgTable("squad_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  squadId: uuid("squad_id").notNull().references(() => squadsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SquadRow = typeof squadsTable.$inferSelect;
export type SquadMemberRow = typeof squadMembersTable.$inferSelect;
