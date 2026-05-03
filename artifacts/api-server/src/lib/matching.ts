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

// Strong, unambiguous zone keywords. Used as a SOFT bonus: when a user's
// intent text mentions these words AND the other user has that zone in their
// zone set (primary + extras), we add a small bonus. This combines with —
// not replaces — the explicit zone picks.
const ZONE_KEYWORDS: Record<string, string[]> = {
  social: [
    "socialise", "socialize", "socializing", "socialising", "hangout",
    "hang-out", "friends", "friend", "party", "chill", "chilling",
    "make friends",
  ],
  startup: [
    "cofounder", "co-founder", "co founder", "founder", "founding", "startup",
    "start-up", "mvp", "yc", "y combinator", "techstars", "pitch deck",
  ],
  career: [
    "internship", "intern", "interview", "interviews", "leetcode", "recruiter",
    "recruiting", "fulltime", "full-time", "fang", "faang", "consulting",
    "banking", "trading", "quant", "swe role", "new grad",
  ],
  study: [
    "study", "studying", "exam", "exams", "midterm", "midterms", "finals",
    "homework", "pset", "psets", "problem-set", "tutor", "tutoring",
    "study group", "study buddy",
  ],
  research: [
    "research", "paper", "papers", "lab", "phd", "thesis", "neurips", "icml",
    "iclr", "professor", "advisor", "publication",
  ],
  creative: [
    "art", "music", "film", "painting", "photography", "podcast", "designer",
    "poetry", "fashion", "filmmaking",
  ],
  fitness: [
    "gym", "workout", "lift", "lifting", "marathon", "yoga", "pilates",
    "hiking", "running", "climbing", "cycling", "crossfit",
  ],
};

// Parse zone keywords out of an intent text → set of inferred zones.
function inferredZones(intent: string): Set<string> {
  const text = intent.toLowerCase();
  const out = new Set<string>();
  for (const [zone, keywords] of Object.entries(ZONE_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        out.add(zone);
        break;
      }
    }
  }
  return out;
}

// A user's full zone set: primary picked zone + any extras embedded as
// "zone:X" tokens in their intent (onboarding stores extras that way).
export function userZones(u: UserRow): Set<string> {
  const set = new Set<string>([u.zone]);
  const matches = u.intent.toLowerCase().matchAll(/zone:([a-z]+)/g);
  for (const m of matches) set.add(m[1]!);
  return set;
}

export function scoreMatch(me: UserRow, other: UserRow): ScoredMatch {
  const myTokens = tokens(me.intent);
  const theirTokens = tokens(other.intent);
  const intentOverlap = jaccard(myTokens, theirTokens); // 0..1

  const sharedTokens = [...myTokens].filter((t) => theirTokens.has(t)).slice(0, 5);

  // Combine ALL zone signals: each user has a set of picked zones (primary +
  // extras). We score on the size of the overlap, NOT on equality of one
  // primary pick. So a user who picked "social + creative" matches well with
  // a user who picked "creative + study" via the shared "creative".
  const myZones = userZones(me);
  const theirZones = userZones(other);
  const zoneIntersection: string[] = [];
  for (const z of myZones) if (theirZones.has(z)) zoneIntersection.push(z);
  const zoneOverlap = zoneIntersection.length;
  const sameZone = zoneOverlap > 0 ? 1 : 0;

  // Soft intent-keyword bonus: if MY written intent suggests zone X (e.g.
  // "want to socialise" → social) AND the OTHER user has X in their zone
  // set, we add a bonus. This rewards intent text matching the other person's
  // explicit picks WITHOUT overriding either user's chosen zones.
  const myInferred = inferredZones(me.intent);
  const theirInferred = inferredZones(other.intent);
  const intentToZoneHits =
    [...myInferred].filter((z) => theirZones.has(z)).length +
    [...theirInferred].filter((z) => myZones.has(z)).length;

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

  // Score combines every dimension the user gave us:
  //   - zone overlap (up to 3 picked zones each — count shared)
  //   - lookingFor (who they want to connect with) — hard match
  //   - intent text overlap (jaccard on intent words)
  //   - intent-keyword cross-match (my words land in their zones, vice versa)
  //   - skills, availability, timeframe, energy, college, major
  // Mild penalty (not a hard cutoff) when zero zones overlap so cross-vibe
  // matches need OTHER strong signals to bubble up.
  const zoneScore = sameZone ? 28 + Math.min(zoneOverlap - 1, 2) * 8 : 0;
  const intentZoneBonus = Math.min(intentToZoneHits, 3) * 6;
  const crossZonePenalty = sameZone ? 0 : 10;
  const score =
    intentOverlap * 26 +
    zoneScore +
    intentZoneBonus +
    sameLookingFor * 18 +
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
  if (sameZone) {
    reasons.push(
      zoneOverlap > 1
        ? `Shared zones: ${zoneIntersection.slice(0, 2).join(" + ")}`
        : `Both in ${zoneIntersection[0]} zone`,
    );
  }
  if (sharedSkills.length > 0) reasons.push(`Shared skills: ${sharedSkills.slice(0, 3).join(", ")}`);
  if (sameLookingFor) reasons.push(`Both want ${me.lookingFor}`);
  if (sameAvailability) reasons.push(`Both free ${me.availability}`);
  if (me.timeframe === other.timeframe) reasons.push(`Both ready ${me.timeframe}`);
  if (me.energyLevel === other.energyLevel) reasons.push(`Same ${me.energyLevel} energy`);
  if (sameCollege) reasons.push(`Same campus`);
  if (sameMajor) reasons.push(`${me.major} alignment`);

  const sharedSignals: string[] = [];
  for (const z of zoneIntersection) sharedSignals.push(z);
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
