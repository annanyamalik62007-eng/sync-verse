import type { UserRow } from "@workspace/db";

const TIMEFRAME_SCORE: Record<string, number> = { now: 3, soon: 2, later: 1 };
const ENERGY_SCORE: Record<string, number> = { building: 3, exploring: 2, browsing: 1 };

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "for", "with", "to", "of", "in", "on",
  "at", "is", "am", "are", "i", "we", "my", "me", "you", "your", "want", "wants",
  "looking", "look", "need", "needs", "find", "some", "any", "do", "doing",
  "right", "now", "today", "tonight", "this", "that",
]);

export function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface ScoredMatch {
  user: UserRow;
  alignmentScore: number;
  reason: string;
  sharedSignals: string[];
}

function skillTokens(s: string | null): Set<string> {
  if (!s) return new Set();
  return new Set(
    s
      .toLowerCase()
      .split(/[,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 1),
  );
}

export function scoreMatch(me: UserRow, other: UserRow): ScoredMatch {
  const myTokens = tokens(me.intent);
  const theirTokens = tokens(other.intent);
  const intentOverlap = jaccard(myTokens, theirTokens); // 0..1

  const sharedTokens = [...myTokens].filter((t) => theirTokens.has(t)).slice(0, 5);

  const sameZone = me.zone === other.zone ? 1 : 0;
  const sameCollege = me.college === other.college ? 1 : 0;
  const sameMajor = me.major === other.major ? 1 : 0;

  const myT = TIMEFRAME_SCORE[me.timeframe] ?? 1;
  const theirT = TIMEFRAME_SCORE[other.timeframe] ?? 1;
  const timeAlignment = 1 - Math.abs(myT - theirT) / 2;

  const myE = ENERGY_SCORE[me.energyLevel] ?? 1;
  const theirE = ENERGY_SCORE[other.energyLevel] ?? 1;
  const energyAlignment = 1 - Math.abs(myE - theirE) / 2;

  // New optional dimensions
  const sameLookingFor =
    me.lookingFor && other.lookingFor && me.lookingFor === other.lookingFor ? 1 : 0;
  const sameAvailability =
    me.availability && other.availability && me.availability === other.availability ? 1 : 0;
  const mySkills = skillTokens(me.skills);
  const theirSkills = skillTokens(other.skills);
  const sharedSkills = [...mySkills].filter((s) => theirSkills.has(s));
  // Flat +10 for any shared skill token, plus +2 per additional shared token (cap at +18)
  const sharedSkillBonus =
    sharedSkills.length === 0
      ? 0
      : Math.min(10 + (sharedSkills.length - 1) * 2, 18);

  // Zone is the strongest signal of "what the user is here for" (socialise vs
  // build vs study). We weight it heavily AND penalize cross-zone matches so
  // someone looking to socialise primarily matches with other socialisers.
  // A strong shared intent + lookingFor can still bridge zones when warranted.
  const crossZonePenalty = sameZone ? 0 : 18;
  const score =
    intentOverlap * 26 +
    sameZone * 35 +
    sameLookingFor * 14 +
    timeAlignment * 12 +
    energyAlignment * 8 +
    sameCollege * 8 +
    sameMajor * 4 +
    sharedSkillBonus +
    sameAvailability * 5 -
    crossZonePenalty;

  const reasons: string[] = [];
  if (sharedTokens.length > 0) {
    reasons.push(`Both mention "${sharedTokens.slice(0, 3).join(", ")}"`);
  }
  if (sameZone) reasons.push(`Both in ${me.zone} zone`);
  if (sharedSkills.length > 0) reasons.push(`Shared skills: ${sharedSkills.slice(0, 3).join(", ")}`);
  if (sameLookingFor) reasons.push(`Both want ${me.lookingFor}`);
  if (sameAvailability) reasons.push(`Both free ${me.availability}`);
  if (me.timeframe === other.timeframe) reasons.push(`Both ready ${me.timeframe}`);
  if (me.energyLevel === other.energyLevel) reasons.push(`Same ${me.energyLevel} energy`);
  if (sameCollege) reasons.push(`Same campus`);
  if (sameMajor) reasons.push(`${me.major} alignment`);

  const sharedSignals: string[] = [];
  if (sameZone) sharedSignals.push(me.zone);
  if (me.timeframe === other.timeframe) sharedSignals.push(me.timeframe);
  if (me.energyLevel === other.energyLevel) sharedSignals.push(me.energyLevel);
  if (sameLookingFor && me.lookingFor) sharedSignals.push(me.lookingFor);
  for (const s of sharedSkills) sharedSignals.push(s);
  for (const t of sharedTokens) sharedSignals.push(t);

  return {
    user: other,
    alignmentScore: Math.min(100, Math.round(score)),
    reason: reasons.length > 0 ? reasons.join(" · ") : "Adjacent intent in your zone",
    sharedSignals: Array.from(new Set(sharedSignals)).slice(0, 6),
  };
}

const COLOR_PALETTE = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C780FA",
  "#FF9F45", "#22D3EE", "#F472B6", "#A3E635", "#FB923C",
];

export function pickAvatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLOR_PALETTE[h % COLOR_PALETTE.length]!;
}

export function pickAvatarUrl(seed: string, _genderHint?: string | null): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  // pravatar.cc serves crisp 300px portraits — randomuser.me caps at 128px and
  // looks blurry once we render avatars at lg/xl/2xl sizes on cards & profiles.
  const idx = (h % 70) + 1;
  return `https://i.pravatar.cc/300?img=${idx}`;
}

export function timeAgoFrom(date: Date): string {
  const sec = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function rowToUser(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    college: row.college,
    major: row.major,
    intent: row.intent,
    timeframe: row.timeframe,
    energyLevel: row.energyLevel,
    zone: row.zone,
    avatarColor: row.avatarColor,
    avatarUrl: row.avatarUrl,
    lookingFor: row.lookingFor,
    skills: row.skills,
    availability: row.availability,
    gender: row.gender,
    createdAt: row.createdAt.toISOString(),
  };
}
