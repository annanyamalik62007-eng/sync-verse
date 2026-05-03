import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type UserRow } from "@workspace/db";
import {
  GenerateIcebreakerBody as IcebreakerInput,
  GenerateIcebreakerResponse as IcebreakerResponse,
  GenerateIcebreakerSuggestionsResponse as IcebreakerSuggestionsResponse,
  GenerateSquadPitchBody as SquadPitchInput,
  GenerateSquadPitchResponse as SquadPitchResponse,
} from "@workspace/api-zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

function userBlurb(u: UserRow): string {
  const parts = [
    `Name: ${u.name}`,
    `Major: ${u.major}`,
    `College: ${u.college}`,
    `Zone: ${u.zone}`,
    `Intent: "${u.intent}"`,
    `Timeframe: ${u.timeframe}`,
    `Energy: ${u.energyLevel}`,
  ];
  if (u.lookingFor) parts.push(`Looking for: ${u.lookingFor}`);
  if (u.skills) parts.push(`Skills: ${u.skills}`);
  if (u.availability) parts.push(`Available: ${u.availability}`);
  return parts.join("\n");
}

async function callClaude(prompt: string, maxTokens = 8192, timeoutMs = 18000): Promise<string> {
  const result = await Promise.race([
    anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
  if (!result) return "";
  const block = result.content[0];
  return block && block.type === "text" ? block.text.trim() : "";
}

async function loadPair(meId: string, otherId: string) {
  const [me] = await db.select().from(usersTable).where(eq(usersTable.id, meId));
  const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherId));
  return { me, other };
}

router.post("/ai/icebreaker", async (req, res): Promise<void> => {
  const parsed = IcebreakerInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { me, other } = await loadPair(parsed.data.meId, parsed.data.otherId);
  if (!me || !other) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  try {
    const prompt = `You are writing a single short opening message that ${me.name} will send to ${other.name}. They just matched on SYNCVERSE — an anonymous campus connection app at ${me.college}. Write one casual, specific, friendly opener that references something concrete they share. No emojis. Max 2 sentences. Sound like a Gen Z college student, lowercase only, no greetings like "Hey!" — go right into it.

ABOUT ${me.name} (sender):
${userBlurb(me)}

ABOUT ${other.name} (recipient):
${userBlurb(other)}

Return only the message, nothing else.`;
    const text = await callClaude(prompt, 256);
    res.json(IcebreakerResponse.parse({ message: text || `noticed we're both in ${other.zone} — wanna swap notes?` }));
  } catch (err) {
    req.log.error({ err }, "icebreaker generation failed");
    res.json(IcebreakerResponse.parse({
      message: `noticed we're both in ${other.zone} — wanna swap notes on what you're working on?`,
    }));
  }
});

router.post("/ai/icebreaker-suggestions", async (req, res): Promise<void> => {
  const parsed = IcebreakerInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { me, other } = await loadPair(parsed.data.meId, parsed.data.otherId);
  if (!me || !other) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  try {
    const prompt = `Generate exactly 3 short opening message suggestions ${me.name} could send to ${other.name}. They just matched on SYNCVERSE, an anonymous campus app at ${me.college}. Each suggestion must be 1 sentence, casual, lowercase, no emojis, no "hey/hi" greetings — go straight into something specific from their shared signals. Vary the angle: one about their intent, one about logistics (meet up / collaborate), one playful question.

${me.name}:
${userBlurb(me)}

${other.name}:
${userBlurb(other)}

Return ONLY a JSON array of 3 strings, like: ["...", "...", "..."]. No prose, no markdown.`;
    const text = await callClaude(prompt, 512);
    let suggestions: string[] = [];
    try {
      const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        suggestions = parsed.filter((s) => typeof s === "string").slice(0, 3);
      }
    } catch {
      suggestions = [];
    }
    if (suggestions.length < 3) {
      suggestions = [
        `saw you're also into ${other.zone} — what are you actually working on rn?`,
        `you free this week to grab coffee and trade notes?`,
        `if you had to pick one thing to ship this month, what would it be?`,
      ];
    }
    res.json(IcebreakerSuggestionsResponse.parse({ suggestions }));
  } catch (err) {
    req.log.error({ err }, "icebreaker suggestions failed");
    res.json(IcebreakerSuggestionsResponse.parse({
      suggestions: [
        `saw you're also into ${other.zone} — what are you actually working on rn?`,
        `you free this week to grab coffee and trade notes?`,
        `if you had to pick one thing to ship this month, what would it be?`,
      ],
    }));
  }
});

router.post("/ai/squad-pitch", async (req, res): Promise<void> => {
  const parsed = SquadPitchInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { me, other } = await loadPair(parsed.data.fromUserId, parsed.data.toUserId);
  if (!me || !other) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  try {
    const prompt = `Write a short squad invitation message ${me.name} is sending to ${other.name} on SYNCVERSE — an anonymous campus app at ${me.college}. They want to form a small squad (3-5 people) to work on: "${parsed.data.squadIntent}".

Tone: casual, specific, lowercase, no emojis, 2 sentences max. Reference something concrete from ${other.name}'s profile that makes them a great fit. End with a clear ask (join the squad / reply if down).

${me.name} (organizer):
${userBlurb(me)}

${other.name} (invitee):
${userBlurb(other)}

Return only the message text.`;
    const text = await callClaude(prompt, 384);
    res.json(SquadPitchResponse.parse({
      message: text || `forming a squad around: "${parsed.data.squadIntent}". your ${other.zone} energy + ${other.skills ?? "what you bring"} would slot in perfect — down to join?`,
    }));
  } catch (err) {
    req.log.error({ err }, "squad pitch generation failed");
    res.json(SquadPitchResponse.parse({
      message: `forming a squad around: "${parsed.data.squadIntent}". your ${other.zone} energy would slot in perfect — down to join?`,
    }));
  }
});

export default router;
