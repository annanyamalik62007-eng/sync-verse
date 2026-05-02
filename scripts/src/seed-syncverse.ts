import { db, usersTable, squadsTable, squadMembersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const COLOR_PALETTE = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C780FA",
  "#FF9F45", "#22D3EE", "#F472B6", "#A3E635", "#FB923C",
];

function pickColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLOR_PALETTE[h % COLOR_PALETTE.length]!;
}

const SEED_USERS = [
  { name: "Maya Chen", college: "Stanford", major: "Computer Science", intent: "looking for two cofounders to build an AI study tool this weekend", timeframe: "now", energyLevel: "building", zone: "startup" },
  { name: "Jordan Patel", college: "Stanford", major: "Design", intent: "want to help build something useful for students this week", timeframe: "now", energyLevel: "building", zone: "startup" },
  { name: "Devon Kim", college: "Stanford", major: "Business", intent: "looking to join a startup team — strong on go-to-market", timeframe: "soon", energyLevel: "building", zone: "startup" },
  { name: "Sam Rivera", college: "Stanford", major: "Mathematics", intent: "need a study partner for advanced linear algebra problem set", timeframe: "now", energyLevel: "exploring", zone: "study" },
  { name: "Priya Shah", college: "Stanford", major: "Mathematics", intent: "studying for the linear algebra midterm tonight in the library", timeframe: "now", energyLevel: "exploring", zone: "study" },
  { name: "Alex Nguyen", college: "Stanford", major: "Computer Science", intent: "polishing my resume for SWE internship interviews next week", timeframe: "soon", energyLevel: "building", zone: "career" },
  { name: "Riley Brooks", college: "Stanford", major: "Economics", intent: "preparing for finance interviews — want mock interview partners", timeframe: "soon", energyLevel: "exploring", zone: "career" },
  { name: "Noor Ahmed", college: "Stanford", major: "Film", intent: "shooting a short film this weekend — need actors and a sound person", timeframe: "soon", energyLevel: "building", zone: "creative" },
  { name: "Theo Walsh", college: "Stanford", major: "Music", intent: "want to collaborate on a creative project this month", timeframe: "later", energyLevel: "exploring", zone: "creative" },
  { name: "Casey Ortiz", college: "Stanford", major: "Kinesiology", intent: "looking for a morning running group — 6am tomorrow", timeframe: "now", energyLevel: "building", zone: "fitness" },
  { name: "Jamie Lee", college: "Stanford", major: "Biology", intent: "anyone want to grab dinner and just hang out tonight", timeframe: "now", energyLevel: "browsing", zone: "social" },
  { name: "Ava Morales", college: "Stanford", major: "Biology", intent: "researching CRISPR applications — looking for a reading group", timeframe: "later", energyLevel: "exploring", zone: "research" },
];

async function main() {
  console.log("Seeding SYNCVERSE AI...");
  await db.execute(sql`TRUNCATE ${squadMembersTable}, ${squadsTable}, ${usersTable} RESTART IDENTITY CASCADE`);

  const inserted = await db
    .insert(usersTable)
    .values(
      SEED_USERS.map((u) => ({
        ...u,
        avatarColor: pickColor(u.name + u.major),
      })),
    )
    .returning();

  console.log(`Inserted ${inserted.length} users`);

  // Form one example squad from the startup founders
  const startupFolks = inserted.filter((u) => u.zone === "startup").slice(0, 3);
  if (startupFolks.length >= 3) {
    const [squad] = await db
      .insert(squadsTable)
      .values({
        name: "The Sprint Founders",
        purpose: "Forming around: \"build an AI study tool this weekend\" — 3 students at Stanford aligned on startup.",
        firstAction: "Whiteboard the problem in 1 sentence, then list 3 customers to interview this week",
        suggestedMeetup: "Innovation hub, tonight 8pm",
        zone: "startup",
      })
      .returning();
    if (squad) {
      await db.insert(squadMembersTable).values(
        startupFolks.map((u) => ({ squadId: squad.id, userId: u.id })),
      );
      console.log(`Created seed squad: ${squad.name}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
