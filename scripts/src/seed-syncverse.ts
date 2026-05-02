import {
  db,
  usersTable,
  squadsTable,
  squadMembersTable,
  eventsTable,
  eventRsvpsTable,
  messagesTable,
  pool,
} from "@workspace/db";

const PALETTE = [
  "#22D3EE",
  "#A78BFA",
  "#F472B6",
  "#34D399",
  "#FB923C",
  "#FBBF24",
  "#60A5FA",
  "#F87171",
];
const pickColor = (i: number) => PALETTE[i % PALETTE.length]!;

const seedUsers = [
  {
    name: "Maya Chen",
    college: "Stanford",
    major: "Computer Science",
    intent: "Looking for two cofounders to build an AI study tool this weekend",
    timeframe: "now" as const,
    energyLevel: "building" as const,
    zone: "startup" as const,
  },
  {
    name: "Jordan Patel",
    college: "Stanford",
    major: "Design",
    intent: "Want to help build something useful for students this week",
    timeframe: "now" as const,
    energyLevel: "building" as const,
    zone: "startup" as const,
  },
  {
    name: "Alex Rivera",
    college: "Stanford",
    major: "Computer Science",
    intent: "Cramming for distributed systems midterm — anyone want a study group tomorrow?",
    timeframe: "soon" as const,
    energyLevel: "exploring" as const,
    zone: "study" as const,
  },
  {
    name: "Priya Shah",
    college: "Stanford",
    major: "Mechanical Engineering",
    intent: "Prepping for FAANG SWE on-sites — practice partner wanted",
    timeframe: "now" as const,
    energyLevel: "building" as const,
    zone: "career" as const,
  },
  {
    name: "Noah Kim",
    college: "Stanford",
    major: "Computer Science",
    intent: "Building a hardware hack this weekend — looking for a teammate",
    timeframe: "now" as const,
    energyLevel: "building" as const,
    zone: "startup" as const,
  },
  {
    name: "Sofia Garcia",
    college: "MIT",
    major: "Computer Science",
    intent: "Looking for an ML research collaborator on transformers interpretability",
    timeframe: "soon" as const,
    energyLevel: "building" as const,
    zone: "research" as const,
  },
  {
    name: "Ethan Wright",
    college: "MIT",
    major: "Physics",
    intent: "Want to start a weekly philosophy + AI reading group",
    timeframe: "later" as const,
    energyLevel: "exploring" as const,
    zone: "research" as const,
  },
  {
    name: "Liam Torres",
    college: "MIT",
    major: "EECS",
    intent: "Recruiting for a 5k campus run on Saturday morning",
    timeframe: "soon" as const,
    energyLevel: "exploring" as const,
    zone: "fitness" as const,
  },
  {
    name: "Aanya Verma",
    college: "Berkeley",
    major: "Data Science",
    intent: "Looking for people to design a pitch deck for our hackathon project",
    timeframe: "now" as const,
    energyLevel: "building" as const,
    zone: "creative" as const,
  },
  {
    name: "Marcus Lee",
    college: "Berkeley",
    major: "Business Administration",
    intent: "Want to host a founders dinner — need 4 more builders",
    timeframe: "soon" as const,
    energyLevel: "exploring" as const,
    zone: "social" as const,
  },
  {
    name: "Zara Ali",
    college: "Berkeley",
    major: "Computer Science",
    intent: "Doing front-end interview prep — pair programming partner wanted",
    timeframe: "now" as const,
    energyLevel: "building" as const,
    zone: "career" as const,
  },
  {
    name: "Diego Santos",
    college: "Berkeley",
    major: "Cognitive Science",
    intent: "Open mic poetry night this Friday — bring something to read",
    timeframe: "soon" as const,
    energyLevel: "exploring" as const,
    zone: "creative" as const,
  },
];

async function main() {
  console.log("Seeding SYNCVERSE AI...");

  await db.delete(messagesTable);
  await db.delete(eventRsvpsTable);
  await db.delete(eventsTable);
  await db.delete(squadMembersTable);
  await db.delete(squadsTable);
  await db.delete(usersTable);

  const inserted = await db
    .insert(usersTable)
    .values(
      seedUsers.map((u, i) => ({
        ...u,
        avatarColor: pickColor(i),
      })),
    )
    .returning();
  console.log(`Inserted ${inserted.length} users`);

  // Seed an active squad at Stanford
  const stanford = inserted.filter((u) => u.college === "Stanford" && u.zone === "startup");
  if (stanford.length >= 2) {
    const [squad] = await db
      .insert(squadsTable)
      .values({
        name: "The Sprint Founders",
        purpose:
          "Building a shared AI study tool. Tight loop, real users, ship by Sunday.",
        firstAction:
          "Whiteboard the problem in 1 sentence + list 5 students to interview tonight",
        suggestedMeetup: "Innovation hub, tonight 8pm",
        zone: "startup",
      })
      .returning();
    if (squad) {
      await db
        .insert(squadMembersTable)
        .values(stanford.slice(0, 2).map((u) => ({ squadId: squad.id, userId: u.id })));
      console.log(`Created seed squad: ${squad.name}`);
    }
  }

  // Seed events per college
  const eventTemplates = [
    {
      college: "Stanford",
      title: "Founders Friday: Demo Night",
      description:
        "Bring a working demo, get 90 seconds + raw feedback from 50 builders.",
      zone: "startup" as const,
      location: "Huang Engineering, Room 205",
      hours: 26,
    },
    {
      college: "Stanford",
      title: "CS Recruiting Mock Interviews",
      description: "Pair up for system design + coding mocks with senior students.",
      zone: "career" as const,
      location: "Gates 101",
      hours: 50,
    },
    {
      college: "Stanford",
      title: "5am Run Club",
      description: "Easy 5k around campus to clear your head before midterms.",
      zone: "fitness" as const,
      location: "Main Quad fountain",
      hours: 18,
    },
    {
      college: "MIT",
      title: "ML Reading Circle: Mech-Interp",
      description: "We crack open 2 papers on transformer interpretability.",
      zone: "research" as const,
      location: "Stata Center 32-G449",
      hours: 30,
    },
    {
      college: "MIT",
      title: "Hackathon Kickoff: BuildMIT",
      description: "48-hour build sprint. Find a team, ship a hack, win prizes.",
      zone: "startup" as const,
      location: "Media Lab Atrium",
      hours: 70,
    },
    {
      college: "Berkeley",
      title: "Open Mic + Poetry Night",
      description: "Bring a poem, a story, or just bring yourself. Free coffee.",
      zone: "creative" as const,
      location: "Caffe Strada patio",
      hours: 22,
    },
    {
      college: "Berkeley",
      title: "Founders Dinner",
      description:
        "Tight 12-person dinner for serious builders. Apply with your one-liner.",
      zone: "social" as const,
      location: "TBD downtown",
      hours: 60,
    },
  ];

  const usersByCollege = new Map<string, typeof inserted>();
  for (const u of inserted) {
    if (!usersByCollege.has(u.college)) usersByCollege.set(u.college, []);
    usersByCollege.get(u.college)!.push(u);
  }

  for (const t of eventTemplates) {
    const collegeUsers = usersByCollege.get(t.college) ?? [];
    if (collegeUsers.length === 0) continue;
    const host = collegeUsers[0]!;
    const startsAt = new Date(Date.now() + t.hours * 60 * 60 * 1000);
    const [event] = await db
      .insert(eventsTable)
      .values({
        college: t.college,
        title: t.title,
        description: t.description,
        zone: t.zone,
        location: t.location,
        startsAt,
        hostUserId: host.id,
      })
      .returning();
    if (event) {
      const rsvpUsers = collegeUsers.slice(0, Math.min(3, collegeUsers.length));
      await db
        .insert(eventRsvpsTable)
        .values(rsvpUsers.map((u) => ({ eventId: event.id, userId: u.id })));
    }
  }
  console.log(`Created ${eventTemplates.length} events`);

  console.log("Done.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
