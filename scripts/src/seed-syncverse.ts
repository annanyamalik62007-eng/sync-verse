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
  "#22D3EE", "#A78BFA", "#F472B6", "#34D399", "#FB923C",
  "#FBBF24", "#60A5FA", "#F87171", "#C084FC", "#4ADE80",
];
const pickColor = (i: number) => PALETTE[i % PALETTE.length]!;

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function pickAvatarUrl(seed: string): string {
  const h = hashSeed(seed);
  const gender = h % 2 === 0 ? "men" : "women";
  const idx = h % 99;
  return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;
}

type Zone = "career" | "startup" | "study" | "social" | "creative" | "fitness" | "research";

type SeedUser = {
  name: string;
  college: string;
  major: string;
  intent: string;
  timeframe: "now" | "soon" | "later";
  energyLevel: "browsing" | "exploring" | "building";
  zone: Zone;
  lookingFor?: string;
  skills?: string;
  availability?: string;
};

const seedUsers: SeedUser[] = [
  // ============ STANFORD ============
  // Startup AI-tools cofounder cohort (deliberate dense match)
  { name: "Maya Chen", college: "Stanford", major: "Computer Science",
    intent: "Looking for two cofounders to build an AI study tool this weekend",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "react, typescript, ai, fundraising", availability: "weekends" },
  { name: "Jordan Patel", college: "Stanford", major: "Design",
    intent: "Want to help build something useful for students this week — UI/product designer",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "figma, ux, product, branding", availability: "weekends" },
  { name: "Rohan Mehra", college: "Stanford", major: "Computer Science",
    intent: "Building a developer tool for AI agent tracing — looking for a backend cofounder",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "go, python, ai, distributed-systems", availability: "weekends" },
  { name: "Noah Kim", college: "Stanford", major: "Computer Science",
    intent: "Building a hardware hack this weekend — looking for a teammate who likes embedded",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "embedded, c, rust, hardware", availability: "weekends" },
  { name: "Sam Whitaker", college: "Stanford", major: "Computer Science",
    intent: "Hosting a small startup founders dinner Friday — need 4 more serious builders",
    timeframe: "soon", energyLevel: "exploring", zone: "social",
    lookingFor: "event partner", skills: "fundraising, growth, community", availability: "evenings" },
  { name: "Taylor Reed", college: "Stanford", major: "Computer Science",
    intent: "Solo on an AI study coach — desperately want a cofounder this week",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "react, typescript, ai, llms", availability: "weekends" },
  { name: "Aisha Khan", college: "Stanford", major: "Symbolic Systems",
    intent: "PM background — joining an AI tool sprint as cofounder this weekend",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "product, ai, research, user-interviews", availability: "weekends" },

  // Career interview-prep cohort
  { name: "Priya Shah", college: "Stanford", major: "Mechanical Engineering",
    intent: "Prepping for FAANG SWE on-sites — practice partner wanted",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "leetcode, system-design, python", availability: "weekday-evenings" },
  { name: "Theo Bauer", college: "Stanford", major: "Economics",
    intent: "Interview prep for Bain / McKinsey case interviews — let's drill cases together",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "consulting, case-prep, finance", availability: "weekday-evenings" },
  { name: "Marisol Vega", college: "Stanford", major: "Public Policy",
    intent: "MBB case prep — looking for a partner to drill 3 cases per week",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "consulting, case-prep, frameworks", availability: "weekday-evenings" },

  // Study LeetCode cohort
  { name: "Alex Rivera", college: "Stanford", major: "Computer Science",
    intent: "Cramming for distributed systems midterm — anyone want a study group tomorrow?",
    timeframe: "soon", energyLevel: "exploring", zone: "study",
    lookingFor: "study buddy", skills: "distributed-systems, go, networking", availability: "weekday-evenings" },
  { name: "Ines Romero", college: "Stanford", major: "Computer Science",
    intent: "Studying Leetcode hards for a meta intern interview — pairing tonight?",
    timeframe: "now", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "leetcode, python, dp, graphs", availability: "weekday-evenings" },
  { name: "Yusuf Hassan", college: "Stanford", major: "Computer Science",
    intent: "Meta intern interview Wednesday — need a Leetcode hard sparring partner",
    timeframe: "now", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "leetcode, python, dp", availability: "weekday-evenings" },

  // Other zones
  { name: "Hana Suzuki", college: "Stanford", major: "Symbolic Systems",
    intent: "Researching multi-agent LLMs — want a co-author for a workshop paper",
    timeframe: "soon", energyLevel: "building", zone: "research",
    lookingFor: "collab", skills: "ai, llms, research, writing", availability: "weekday-mornings" },
  { name: "Lila Okafor", college: "Stanford", major: "Art Practice",
    intent: "Designing posters for a campus poetry night — want a collaborator with type chops",
    timeframe: "soon", energyLevel: "exploring", zone: "creative",
    lookingFor: "collab", skills: "design, typography, illustrator", availability: "evenings" },
  { name: "Kai Nakamura", college: "Stanford", major: "Bioengineering",
    intent: "Looking for distance running partners — training for the Bay Area half marathon",
    timeframe: "now", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "running, endurance, half-marathon", availability: "weekday-mornings" },
  { name: "Sienna Liu", college: "Stanford", major: "Bioengineering",
    intent: "Half marathon training — long runs Saturday mornings, looking for company",
    timeframe: "now", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "running, half-marathon", availability: "weekend-mornings" },

  // ============ MIT ============
  // Research interp cohort
  { name: "Sofia Garcia", college: "MIT", major: "Computer Science",
    intent: "Looking for an ML research collaborator on transformers interpretability",
    timeframe: "soon", energyLevel: "building", zone: "research",
    lookingFor: "collab", skills: "ml, interpretability, pytorch, transformers", availability: "weekday-mornings" },
  { name: "Ethan Wright", college: "MIT", major: "Physics",
    intent: "Want to start a weekly philosophy + AI reading group",
    timeframe: "later", energyLevel: "exploring", zone: "research",
    lookingFor: "collab", skills: "philosophy, ai, reading-group, writing", availability: "weekday-evenings" },
  { name: "Yuna Park", college: "MIT", major: "Materials Science",
    intent: "Researching battery cathodes — looking for a SciML person to model degradation",
    timeframe: "later", energyLevel: "exploring", zone: "research",
    lookingFor: "collab", skills: "sciml, batteries, simulation, python", availability: "weekday-mornings" },
  { name: "Lina Brooks", college: "MIT", major: "Computer Science",
    intent: "Working on transformer interpretability + RLHF — want a research collaborator",
    timeframe: "soon", energyLevel: "building", zone: "research",
    lookingFor: "collab", skills: "ml, interpretability, rlhf, pytorch, transformers", availability: "weekday-mornings" },

  // Study/career
  { name: "Aria Davis", college: "MIT", major: "Mathematics",
    intent: "Forming a team for the Putnam — 3-person prep group, twice a week",
    timeframe: "soon", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "math, putnam, problem-solving", availability: "weekday-evenings" },
  { name: "Devon Hughes", college: "MIT", major: "EECS",
    intent: "Want to start a 6.824 (distributed systems) study circle — meet in Stata",
    timeframe: "soon", energyLevel: "exploring", zone: "study",
    lookingFor: "study buddy", skills: "distributed-systems, go, raft", availability: "weekday-evenings" },
  { name: "Hiro Tanaka", college: "MIT", major: "EECS",
    intent: "6.824 study group — want to grind labs together",
    timeframe: "soon", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "distributed-systems, go", availability: "weekday-evenings" },
  { name: "Caleb Ng", college: "MIT", major: "Computer Science",
    intent: "Quant interview prep — looking for a partner to grind probability questions",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "quant, probability, python", availability: "weekday-evenings" },

  // Startup
  { name: "Owen Clark", college: "MIT", major: "EECS",
    intent: "Building a robotics demo for BuildMIT — need a CV / perception teammate",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "robotics, cv, ros, python", availability: "weekends" },
  { name: "Naomi Sato", college: "MIT", major: "EECS",
    intent: "BuildMIT teammate hunt — I do perception/CV, looking for hardware folks",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "cv, robotics, python, perception", availability: "weekends" },

  // Fitness + creative
  { name: "Liam Torres", college: "MIT", major: "EECS",
    intent: "Recruiting for a 5k campus run on Saturday morning",
    timeframe: "soon", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "running, 5k", availability: "weekend-mornings" },
  { name: "Mira Patel", college: "MIT", major: "Brain & Cognitive Sciences",
    intent: "Want to organize a casual bouldering night at MIT BoulderShack — climbers welcome",
    timeframe: "soon", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "bouldering, climbing", availability: "weekday-evenings" },
  { name: "Anika Bose", college: "MIT", major: "Music & Theater Arts",
    intent: "Composer looking for film students with a short to score this month",
    timeframe: "later", energyLevel: "exploring", zone: "creative",
    lookingFor: "collab", skills: "music, scoring, composition, film", availability: "evenings" },
  { name: "Jonah Mitchell", college: "MIT", major: "Comparative Media Studies",
    intent: "Finishing a 7-min student film — need a composer who can score it",
    timeframe: "soon", energyLevel: "building", zone: "creative",
    lookingFor: "collab", skills: "film, editing, scoring, music", availability: "evenings" },

  // ============ BERKELEY ============
  { name: "Aanya Verma", college: "Berkeley", major: "Data Science",
    intent: "Looking for people to design a pitch deck for our hackathon project",
    timeframe: "now", energyLevel: "building", zone: "creative",
    lookingFor: "collab", skills: "deck, design, narrative", availability: "weekday-evenings" },
  { name: "Marcus Lee", college: "Berkeley", major: "Business Administration",
    intent: "Want to host a founders dinner — need 4 more builders",
    timeframe: "soon", energyLevel: "exploring", zone: "social",
    lookingFor: "event partner", skills: "community, fundraising, ops", availability: "evenings" },
  { name: "Zara Ali", college: "Berkeley", major: "Computer Science",
    intent: "Doing front-end interview prep — pair programming partner wanted",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "react, typescript, css, leetcode", availability: "weekday-evenings" },
  { name: "Diego Santos", college: "Berkeley", major: "Cognitive Science",
    intent: "Open mic poetry night this Friday — bring something to read",
    timeframe: "soon", energyLevel: "exploring", zone: "creative",
    lookingFor: "event partner", skills: "poetry, writing, performance", availability: "evenings" },
  { name: "Ben Carter", college: "Berkeley", major: "Computer Science",
    intent: "Cofounder search — building consumer AI in the agent space, full-stack engineer here",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "react, typescript, ai, agents, fullstack", availability: "weekends" },
  { name: "Nina Park", college: "Berkeley", major: "Computer Science",
    intent: "Building a real-time collab whiteboard — need a designer who loves UX",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "react, typescript, realtime, design", availability: "weekends" },
  { name: "Quinn Park", college: "Berkeley", major: "Design",
    intent: "Designer looking to join a serious consumer AI project — full-stack thinking",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "design, ux, react, ai, prototyping", availability: "weekends" },
  { name: "Talia Gold", college: "Berkeley", major: "Statistics",
    intent: "Studying for Stat 134 final — anyone want a problem-set sprint Thursday?",
    timeframe: "soon", energyLevel: "exploring", zone: "study",
    lookingFor: "study buddy", skills: "stats, probability, r", availability: "weekday-evenings" },
  { name: "Reese Gallagher", college: "Berkeley", major: "Statistics",
    intent: "Stat 134 final crash group — joining anything that meets at Moffitt",
    timeframe: "soon", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "stats, probability", availability: "weekday-evenings" },
  { name: "Ivan Petrov", college: "Berkeley", major: "Computer Science",
    intent: "Looking for a research partner on RLHF reward hacking — we publish or we ship",
    timeframe: "later", energyLevel: "building", zone: "research",
    lookingFor: "collab", skills: "rlhf, ml, research, pytorch", availability: "weekday-mornings" },
  { name: "Jasper Wu", college: "Berkeley", major: "Architecture",
    intent: "Climbing partner needed for Indian Rock — weekday evenings",
    timeframe: "soon", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "climbing, bouldering, outdoors", availability: "weekday-evenings" },
  { name: "Eli Brown", college: "Berkeley", major: "Cognitive Science",
    intent: "Want to start a board game night every Wednesday — strategy heavy",
    timeframe: "soon", energyLevel: "browsing", zone: "social",
    lookingFor: "event partner", skills: "boardgames, strategy, community", availability: "weekday-evenings" },
  { name: "Camila Reyes", college: "Berkeley", major: "EECS",
    intent: "Mentor wanted in ML/research — open to coffee + advice",
    timeframe: "later", energyLevel: "browsing", zone: "career",
    lookingFor: "mentor", skills: "ml, pytorch, research", availability: "anytime" },

  // ============ HARVARD ============
  { name: "Olivia Chen", college: "Harvard", major: "Government",
    intent: "Recruiting writers for a new student-led tech policy newsletter",
    timeframe: "soon", energyLevel: "exploring", zone: "creative",
    lookingFor: "collab", skills: "writing, policy, editing", availability: "evenings" },
  { name: "Ravi Iyer", college: "Harvard", major: "Applied Math",
    intent: "Building a finance coach app for students — looking for an iOS dev",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "swift, ios, finance, product", availability: "weekends" },
  { name: "Priya Anand", college: "Harvard", major: "Computer Science",
    intent: "iOS dev open to joining a fintech project this semester",
    timeframe: "now", energyLevel: "building", zone: "startup",
    lookingFor: "cofounder", skills: "swift, ios, product", availability: "weekends" },
  { name: "Maddie Brooks", college: "Harvard", major: "Economics",
    intent: "Banking SA recruiting — anyone running mock superdays this week?",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "finance, banking, modeling, valuation", availability: "weekday-evenings" },
  { name: "Holland Reeves", college: "Harvard", major: "Economics",
    intent: "Banking SA superday prep — looking for someone to drill technicals + behaviorals",
    timeframe: "now", energyLevel: "building", zone: "career",
    lookingFor: "study buddy", skills: "finance, banking, modeling, behavioral", availability: "weekday-evenings" },
  { name: "Felix Anders", college: "Harvard", major: "Computer Science",
    intent: "Looking for runners — easy 5-mile loop along the Charles, 6:30am",
    timeframe: "now", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "running, distance", availability: "weekday-mornings" },
  { name: "Naya Bennett", college: "Harvard", major: "Sociology",
    intent: "5-6am Charles river runner — looking for a regular crew",
    timeframe: "now", energyLevel: "exploring", zone: "fitness",
    lookingFor: "friend", skills: "running, 5k, easy-pace", availability: "weekday-mornings" },
  { name: "Sienna Park", college: "Harvard", major: "Computer Science",
    intent: "Studying for CS 124 (algorithms) — group session at Lamont Library tonight",
    timeframe: "now", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "algorithms, dp, graphs, dynamic-programming", availability: "weekday-evenings" },
  { name: "Adrian Ko", college: "Harvard", major: "Applied Math",
    intent: "CS 124 algorithms pset 4 — anyone working through it tonight?",
    timeframe: "now", energyLevel: "building", zone: "study",
    lookingFor: "study buddy", skills: "algorithms, dp, graphs", availability: "weekday-evenings" },
  { name: "Wyatt Cole", college: "Harvard", major: "Sociology",
    intent: "Want to organize a Sunday brunch club for first-years",
    timeframe: "later", energyLevel: "browsing", zone: "social",
    lookingFor: "event partner", skills: "community, hosting, events", availability: "weekends" },
  { name: "Imani Ward", college: "Harvard", major: "Government",
    intent: "Looking for a mentor in policy/tech writing — open to coffee chats",
    timeframe: "later", energyLevel: "browsing", zone: "creative",
    lookingFor: "mentor", skills: "writing, policy, journalism", availability: "anytime" },
  { name: "Ezra Klein", college: "Harvard", major: "Statistics",
    intent: "Researching causal inference in social data — looking for a research peer",
    timeframe: "soon", energyLevel: "exploring", zone: "research",
    lookingFor: "collab", skills: "stats, causal-inference, r, research", availability: "weekday-mornings" },
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
        avatarUrl: pickAvatarUrl(u.name + u.college + u.major),
      })),
    )
    .returning();
  console.log(`Inserted ${inserted.length} users`);

  const userByName = new Map(inserted.map((u) => [u.name, u]));
  const usersByCollege = new Map<string, typeof inserted>();
  for (const u of inserted) {
    if (!usersByCollege.has(u.college)) usersByCollege.set(u.college, []);
    usersByCollege.get(u.college)!.push(u);
  }

  // Stanford startup squad (founders building AI tools together)
  const stanfordStartup = inserted.filter(
    (u) => u.college === "Stanford" && u.zone === "startup",
  );
  if (stanfordStartup.length >= 3) {
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
        .values(stanfordStartup.slice(0, 4).map((u) => ({ squadId: squad.id, userId: u.id })));
      console.log(`Created seed squad: ${squad.name}`);
    }
  }

  // MIT research squad (interpretability folks)
  const mitInterp = ["Sofia Garcia", "Ethan Wright", "Lina Brooks"]
    .map((n) => userByName.get(n))
    .filter((u): u is NonNullable<typeof u> => !!u);
  if (mitInterp.length >= 2) {
    const [squad] = await db
      .insert(squadsTable)
      .values({
        name: "The Mech-Interp Lab",
        purpose:
          "Reading the latest mechanistic interpretability papers and reproducing two key results this month.",
        firstAction:
          "Drop your reading list — find the 3 papers everyone overlaps on",
        suggestedMeetup: "Stata 32-G449, Tuesday 5pm",
        zone: "research",
      })
      .returning();
    if (squad) {
      await db
        .insert(squadMembersTable)
        .values(mitInterp.map((u) => ({ squadId: squad.id, userId: u.id })));
      console.log(`Created seed squad: ${squad.name}`);
    }
  }

  // Berkeley consumer AI squad
  const berkeleyAI = ["Ben Carter", "Nina Park", "Quinn Park"]
    .map((n) => userByName.get(n))
    .filter((u): u is NonNullable<typeof u> => !!u);
  if (berkeleyAI.length >= 2) {
    const [squad] = await db
      .insert(squadsTable)
      .values({
        name: "Agent Studio",
        purpose:
          "Consumer AI in the agent space. Real users by end of month, live demo at the next Berkeley Builder Night.",
        firstAction: "Spec the v0 in a single page + book 5 user interviews",
        suggestedMeetup: "Soda Hall, Friday 4pm",
        zone: "startup",
      })
      .returning();
    if (squad) {
      await db
        .insert(squadMembersTable)
        .values(berkeleyAI.map((u) => ({ squadId: squad.id, userId: u.id })));
      console.log(`Created seed squad: ${squad.name}`);
    }
  }

  // Events
  const eventTemplates = [
    { college: "Stanford", title: "Founders Friday: Demo Night",
      description: "Bring a working demo, get 90 seconds + raw feedback from 50 builders.",
      zone: "startup" as const, location: "Huang Engineering, Room 205", hours: 26,
      hostName: "Maya Chen", attendees: ["Jordan Patel", "Noah Kim", "Sam Whitaker", "Rohan Mehra", "Taylor Reed", "Aisha Khan"] },
    { college: "Stanford", title: "CS Recruiting Mock Interviews",
      description: "Pair up for system design + coding mocks with senior students.",
      zone: "career" as const, location: "Gates 101", hours: 50,
      hostName: "Priya Shah", attendees: ["Theo Bauer", "Ines Romero", "Alex Rivera", "Marisol Vega", "Yusuf Hassan"] },
    { college: "Stanford", title: "5am Run Club",
      description: "Easy 5k around campus to clear your head before midterms.",
      zone: "fitness" as const, location: "Main Quad fountain", hours: 18,
      hostName: "Kai Nakamura", attendees: ["Sienna Liu", "Lila Okafor"] },
    { college: "Stanford", title: "Sunday Founders Brunch",
      description: "12-person brunch for people building things this quarter. Casual.",
      zone: "social" as const, location: "Coupa Cafe Y2E2", hours: 90,
      hostName: "Sam Whitaker", attendees: ["Maya Chen", "Rohan Mehra", "Jordan Patel", "Aisha Khan"] },
    { college: "MIT", title: "ML Reading Circle: Mech-Interp",
      description: "We crack open 2 papers on transformer interpretability.",
      zone: "research" as const, location: "Stata Center 32-G449", hours: 30,
      hostName: "Sofia Garcia", attendees: ["Ethan Wright", "Yuna Park", "Lina Brooks"] },
    { college: "MIT", title: "Hackathon Kickoff: BuildMIT",
      description: "48-hour build sprint. Find a team, ship a hack, win prizes.",
      zone: "startup" as const, location: "Media Lab Atrium", hours: 70,
      hostName: "Owen Clark", attendees: ["Sofia Garcia", "Devon Hughes", "Caleb Ng", "Liam Torres", "Naomi Sato", "Hiro Tanaka"] },
    { college: "MIT", title: "Charles River Sunrise 5K",
      description: "Easy pace 5k along the Charles, coffee after.",
      zone: "fitness" as const, location: "Mass Ave bridge", hours: 22,
      hostName: "Liam Torres", attendees: ["Mira Patel"] },
    { college: "Berkeley", title: "Open Mic + Poetry Night",
      description: "Bring a poem, a story, or just bring yourself. Free coffee.",
      zone: "creative" as const, location: "Caffe Strada patio", hours: 22,
      hostName: "Diego Santos", attendees: ["Aanya Verma", "Eli Brown", "Camila Reyes"] },
    { college: "Berkeley", title: "Founders Dinner",
      description: "Tight 12-person dinner for serious builders. Apply with your one-liner.",
      zone: "social" as const, location: "TBD downtown", hours: 60,
      hostName: "Marcus Lee", attendees: ["Ben Carter", "Nina Park", "Aanya Verma", "Quinn Park"] },
    { college: "Berkeley", title: "Stat 134 Crash Group",
      description: "Two-hour crash session before the final — bring practice exams.",
      zone: "study" as const, location: "Moffitt 4th floor", hours: 38,
      hostName: "Talia Gold", attendees: ["Zara Ali", "Reese Gallagher"] },
    { college: "Harvard", title: "Charles River 6:30am Run",
      description: "Easy 5-miler, all paces welcome. Coffee at Pavement after.",
      zone: "fitness" as const, location: "JFK Park", hours: 14,
      hostName: "Felix Anders", attendees: ["Wyatt Cole", "Naya Bennett"] },
    { college: "Harvard", title: "CS 124 Algorithms Study Jam",
      description: "Working through pset 4 together at Lamont.",
      zone: "study" as const, location: "Lamont Library Cafe", hours: 6,
      hostName: "Sienna Park", attendees: ["Maddie Brooks", "Adrian Ko"] },
    { college: "Harvard", title: "Banking Superday Mocks",
      description: "Mock superday format. Technicals + behaviorals + a brief case.",
      zone: "career" as const, location: "Sever Hall, Room 113", hours: 44,
      hostName: "Maddie Brooks", attendees: ["Holland Reeves"] },
  ];

  let createdEvents = 0;
  for (const t of eventTemplates) {
    const collegeUsers = usersByCollege.get(t.college) ?? [];
    if (collegeUsers.length === 0) continue;
    const host = userByName.get(t.hostName) ?? collegeUsers[0]!;
    const startsAt = new Date(Date.now() + t.hours * 60 * 60 * 1000);
    const [event] = await db
      .insert(eventsTable)
      .values({
        college: t.college, title: t.title, description: t.description,
        zone: t.zone, location: t.location, startsAt, hostUserId: host.id,
      })
      .returning();
    if (!event) continue;
    createdEvents++;
    const rsvpIds = new Set<string>([host.id]);
    for (const name of t.attendees) {
      const u = userByName.get(name);
      if (u) rsvpIds.add(u.id);
    }
    await db
      .insert(eventRsvpsTable)
      .values(Array.from(rsvpIds).map((userId) => ({ eventId: event.id, userId })));
  }
  console.log(`Created ${createdEvents} events with RSVPs`);

  // Direct messages between matched students
  const conversations: Array<[string, string, string[]]> = [
    ["Maya Chen", "Jordan Patel", [
      "Saw your intent — you down to sketch the AI study tool tonight?",
      "Yes! I have wireframes I've been sitting on. 7pm at the Innovation hub?",
      "Perfect. I'll bring the data — let's just talk to 5 students before we touch Figma.",
      "Deal. I'll prep the 3 questions we ask each one.",
    ]],
    ["Maya Chen", "Rohan Mehra", [
      "Your agent tracing tool sounds wild. Want to grab coffee Thursday?",
      "Yeah let's do it. CoHo at 3?",
    ]],
    ["Maya Chen", "Taylor Reed", [
      "Wait — you're solo on an AI study coach? I'm doing literally the same thing.",
      "No way. We should talk. Tonight?",
      "Yes. Innovation hub 8pm with the rest of the squad — come thru.",
    ]],
    ["Sofia Garcia", "Lina Brooks", [
      "Hey — your interp + RLHF intent matched mine 99%. Want to compare reading lists?",
      "Yes please. I have a Friday slot at Stata 5pm if it works.",
      "Locked. I'll bring the Anthropic monosemanticity paper + my notes.",
    ]],
    ["Priya Shah", "Theo Bauer", [
      "Hey — saw you're prepping cases. Want to drill 2 cases back-to-back tomorrow?",
      "Down. I have a McKinsey M&A and a Bain market sizing. Library 6pm?",
      "Locked. I'll bring my framework cheat sheet.",
    ]],
    ["Alex Rivera", "Ines Romero", [
      "You also grinding LC hards? Want to share a list?",
      "Yes please. I'm targeting graphs + DP this week.",
    ]],
    ["Aanya Verma", "Diego Santos", [
      "Mind if I steal you for an hour? Need a poet's eye on our deck cover.",
      "Hah, sure. Send it over.",
    ]],
    ["Ben Carter", "Nina Park", [
      "Saw your real-time whiteboard pitch — really like the live cursor demo.",
      "Thanks! What are you building?",
      "Consumer AI in the agent space. Could use a designer who loves UX.",
      "Let's chat. Friday 4pm?",
    ]],
    ["Liam Torres", "Mira Patel", [
      "Bouldering after the Saturday run? You climb?",
      "All the time. Let's combine 'em — run + climb day.",
    ]],
    ["Felix Anders", "Naya Bennett", [
      "6:30am on the Charles tomorrow?",
      "I'll be there. Pavement after?",
      "Always.",
    ]],
    ["Maddie Brooks", "Holland Reeves", [
      "Want to run mock superdays together this week? I have a list of technicals.",
      "Yes — I've been looking for a partner. Tuesday + Thursday?",
    ]],
  ];

  let messageCount = 0;
  for (const [aName, bName, msgs] of conversations) {
    const a = userByName.get(aName);
    const b = userByName.get(bName);
    if (!a || !b) continue;
    const base = Date.now() - msgs.length * 11 * 60 * 1000;
    for (let i = 0; i < msgs.length; i++) {
      const fromUser = i % 2 === 0 ? a : b;
      const toUser = i % 2 === 0 ? b : a;
      await db.insert(messagesTable).values({
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        content: msgs[i]!,
        createdAt: new Date(base + i * 11 * 60 * 1000),
      });
      messageCount++;
    }
  }
  console.log(`Seeded ${messageCount} messages across ${conversations.length} threads`);

  console.log("Done.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
