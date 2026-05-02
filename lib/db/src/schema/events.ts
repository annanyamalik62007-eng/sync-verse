import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const eventsTable = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    college: text("college").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    zone: text("zone").notNull(),
    location: text("location").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    hostUserId: uuid("host_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    collegeIdx: index("events_college_idx").on(t.college),
    startsIdx: index("events_starts_idx").on(t.startsAt),
  }),
);

export const eventRsvpsTable = pgTable("event_rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EventRow = typeof eventsTable.$inferSelect;
export type EventRsvpRow = typeof eventRsvpsTable.$inferSelect;
