import { Router, type IRouter } from "express";
import { and, eq, inArray, desc } from "drizzle-orm";
import {
  db,
  usersTable,
  squadsTable,
  squadMembersTable,
  type SquadRow,
  type UserRow,
} from "@workspace/db";
import {
  ListSquadsResponse,
  GetSquadSuggestionsForUserParams,
  GetSquadSuggestionsForUserResponse,
  JoinSquadParams,
  JoinSquadBody,
  JoinSquadResponse,
} from "@workspace/api-zod";
import { rowToUser, scoreMatch } from "../lib/matching";

const router: IRouter = Router();

async function squadsWithMembers(squadRows: SquadRow[]) {
  if (squadRows.length === 0) return [];
  const squadIds = squadRows.map((s) => s.id);
  const memberLinks = await db
    .select()
    .from(squadMembersTable)
    .where(inArray(squadMembersTable.squadId, squadIds));
  const userIds = Array.from(new Set(memberLinks.map((m) => m.userId)));
  const users =
    userIds.length > 0
      ? await db.select().from(usersTable).where(inArray(usersTable.id, userIds))
      : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  return squadRows.map((s) => {
    const members = memberLinks
      .filter((m) => m.squadId === s.id)
      .map((m) => userById.get(m.userId))
      .filter((u): u is UserRow => Boolean(u))
      .map(rowToUser);
    return {
      id: s.id,
      name: s.name,
      purpose: s.purpose,
      firstAction: s.firstAction,
      suggestedMeetup: s.suggestedMeetup,
      zone: s.zone,
      members,
      createdAt: s.createdAt.toISOString(),
    };
  });
}

router.get("/squads", async (_req, res): Promise<void> => {
  const squads = await db
    .select()
    .from(squadsTable)
    .orderBy(desc(squadsTable.createdAt));
  const populated = await squadsWithMembers(squads);
  res.json(ListSquadsResponse.parse(populated));
});

const SQUAD_NAME_PREFIXES = [
  "The", "Project", "Squad", "Lab", "Crew", "Pact", "Circuit", "Sprint",
];
const SQUAD_NAME_SUFFIXES: Record<string, string[]> = {
  career: ["Pivot", "Pipeline", "Offer", "Network"],
  startup: ["Founders", "Pitch", "MVP", "Launch"],
  study: ["Cohort", "Cram", "Curve", "Notebook"],
  social: ["Hangout", "Block", "Mixer", "Loop"],
  creative: ["Studio", "Atelier", "Canvas", "Set"],
  fitness: ["Run", "Reps", "Climb", "Court"],
  research: ["Lab", "Inquiry", "Stack", "Dig"],
};

function generateSquadProposal(
  zone: string,
  members: UserRow[],
): {
  name: string;
  purpose: string;
  firstAction: string;
  suggestedMeetup: string;
} {
  const prefix = SQUAD_NAME_PREFIXES[Math.floor(Math.random() * SQUAD_NAME_PREFIXES.length)]!;
  const suffixes = SQUAD_NAME_SUFFIXES[zone] ?? ["Crew"];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]!;
  const sharedIntent = members[0]?.intent ?? "make something happen";
  const name = `${prefix} ${suffix}`;
  const college = members[0]?.college ?? "campus";
  const meetupByZone: Record<string, string> = {
    career: "Career center, this Thursday 5pm",
    startup: "Innovation hub, tonight 8pm",
    study: "Library, 3rd floor — tomorrow 6pm",
    social: "Main quad, tonight 7pm",
    creative: "Arts building lounge, this weekend",
    fitness: "Rec center entrance, tomorrow 7am",
    research: "Science library, Friday 4pm",
  };
  const firstByZone: Record<string, string> = {
    career: "Each share one role you're targeting + the resume bullet you're proudest of",
    startup: "Whiteboard the problem in 1 sentence, then list 3 customers to interview this week",
    study: "Build a shared problem set + assign one person to each topic",
    social: "Pick the spot, lock the time, and bring one friend each",
    creative: "Each bring one piece of work-in-progress; trade honest critique",
    fitness: "Lock a recurring time on the calendar before you leave the chat",
    research: "Drop your reading list — find the 3 papers everyone overlaps on",
  };
  return {
    name,
    purpose: `Forming around: "${sharedIntent}" — ${members.length} students at ${college} aligned on ${zone}.`,
    firstAction: firstByZone[zone] ?? "Introduce yourselves and share your specific intent",
    suggestedMeetup: meetupByZone[zone] ?? "Pick a time in the next 48 hours",
  };
}

router.get(
  "/users/:userId/squad-suggestions",
  async (req, res): Promise<void> => {
    const parsed = GetSquadSuggestionsForUserParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [me] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parsed.data.userId));
    if (!me) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Squad suggestions are scoped to the same college as well — squads form on campus.
    const candidates = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.zone, me.zone), eq(usersTable.college, me.college)));
    const others = candidates.filter((u) => u.id !== me.id);
    const scored = others
      .map((o) => scoreMatch(me, o))
      .filter((m) => m.alignmentScore >= 25)
      .sort((a, b) => b.alignmentScore - a.alignmentScore);

    const proposals: Array<Record<string, unknown>> = [];
    const buildProposal = (members: UserRow[]) => {
      const proposal = generateSquadProposal(me.zone, members);
      const ids = members.map((m) => m.id).join("_");
      proposals.push({
        id: `suggested-${ids}`,
        ...proposal,
        zone: me.zone,
        members: members.map(rowToUser),
        createdAt: new Date().toISOString(),
      });
    };
    if (scored.length >= 2) {
      buildProposal([me, scored[0]!.user, scored[1]!.user]);
    }
    if (scored.length >= 4) {
      buildProposal([me, scored[2]!.user, scored[3]!.user]);
    }

    res.json(GetSquadSuggestionsForUserResponse.parse(proposals));
  },
);

router.post("/squads/:squadId/join", async (req, res): Promise<void> => {
  const params = JoinSquadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = JoinSquadBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  let squadId = params.data.squadId;

  // Suggested squads have ids "suggested-<uuid>_<uuid>_..." — materialize on join
  // with the full proposed member set so the "3+ aligned users" rule holds.
  if (squadId.startsWith("suggested-")) {
    const memberIds = squadId.slice("suggested-".length).split("_").filter(Boolean);
    if (memberIds.length === 0) {
      res.status(400).json({ error: "Invalid suggested squad id" });
      return;
    }
    const proposedMembers = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, memberIds));
    if (proposedMembers.length === 0) {
      res.status(404).json({ error: "Suggested members not found" });
      return;
    }
    // Anchor zone/proposal on the joining user when present, else the first member
    const anchor =
      proposedMembers.find((m) => m.id === body.data.userId) ?? proposedMembers[0]!;
    const proposal = generateSquadProposal(anchor.zone, proposedMembers);
    const [created] = await db
      .insert(squadsTable)
      .values({ ...proposal, zone: anchor.zone })
      .returning();
    if (!created) {
      res.status(500).json({ error: "Failed to create squad" });
      return;
    }
    squadId = created.id;
    // Seed the squad with every proposed member so the squad reflects the alignment.
    await db
      .insert(squadMembersTable)
      .values(proposedMembers.map((m) => ({ squadId, userId: m.id })));
  }

  // Idempotent join
  const existing = await db
    .select()
    .from(squadMembersTable)
    .where(eq(squadMembersTable.squadId, squadId));
  if (!existing.some((e) => e.userId === body.data.userId)) {
    await db
      .insert(squadMembersTable)
      .values({ squadId, userId: body.data.userId });
  }

  const [squadRow] = await db
    .select()
    .from(squadsTable)
    .where(eq(squadsTable.id, squadId));
  if (!squadRow) {
    res.status(404).json({ error: "Squad not found" });
    return;
  }
  const [populated] = await squadsWithMembers([squadRow]);
  res.json(JoinSquadResponse.parse(populated));
});

export default router;
