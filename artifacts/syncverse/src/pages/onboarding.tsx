import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCreateUser,
  useGetCommunityInsights,
  useListUsers,
  getGetCommunityInsightsQueryKey,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import {
  CommunityZone,
  Timeframe,
  EnergyLevel,
  type CreateUserInput,
} from "@workspace/api-client-react";
import { setCurrentUserId, useCurrentUserId } from "@/hooks/use-current-user";
import {
  SV_HOT as THEME_SV_HOT,
  SV_CYAN as THEME_SV_CYAN,
  SV_ACID as THEME_SV_ACID,
  SV_GREEN as THEME_SV_GREEN,
  SV_INK as THEME_SV_INK,
  ZONE_HUE as THEME_ZONE_HUE,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import {
  Activity,
  Zap,
  ArrowRight,
  Users,
  Flame,
  Sparkles,
  Rocket,
  Brain,
  Heart,
  PaintBucket,
  Dumbbell,
  Microscope,
  Briefcase,
  Asterisk,
  Radio,
  MoveUpRight,
  CornerDownRight,
} from "lucide-react";

const ZONE_META: Record<
  CommunityZone,
  { label: string; desc: string; icon: typeof Briefcase; tint: string; example: string }
> = {
  career: {
    label: "Career",
    desc: "Interviews, internships, recruiting prep",
    icon: Briefcase,
    tint: "from-amber-500/20 to-orange-500/5",
    example: "Practicing FAANG SWE on-sites — looking for a mock interview partner",
  },
  startup: {
    label: "Startup",
    desc: "Founders, builders, weekend hackers",
    icon: Rocket,
    tint: "from-violet-500/20 to-fuchsia-500/5",
    example: "Looking for two cofounders to build an AI study tool this weekend",
  },
  study: {
    label: "Study",
    desc: "Deep work, exam prep, problem sets",
    icon: Brain,
    tint: "from-cyan-500/20 to-blue-500/5",
    example: "Cramming for distributed systems midterm — anyone want a study group?",
  },
  social: {
    label: "Social",
    desc: "Events, meetups, hangouts, food",
    icon: Heart,
    tint: "from-pink-500/20 to-rose-500/5",
    example: "Hosting a founders dinner Friday — need 4 more builders",
  },
  creative: {
    label: "Creative",
    desc: "Design, music, writing, art",
    icon: PaintBucket,
    tint: "from-emerald-500/20 to-teal-500/5",
    example: "Designing a pitch deck — need a strong visual partner",
  },
  fitness: {
    label: "Fitness",
    desc: "Training, sports, runs",
    icon: Dumbbell,
    tint: "from-lime-500/20 to-green-500/5",
    example: "Recruiting for a 5k campus run on Saturday morning",
  },
  research: {
    label: "Research",
    desc: "Labs, papers, deep dives",
    icon: Microscope,
    tint: "from-indigo-500/20 to-purple-500/5",
    example: "ML research collaborator needed for transformer interpretability",
  },
};

const ZONES_LIST = Object.keys(ZONE_META) as CommunityZone[];

const TIMEFRAMES: { value: Timeframe; label: string; sub: string }[] = [
  { value: "now", label: "Right now", sub: "Within the next few hours" },
  { value: "soon", label: "Within a week", sub: "Sometime this week" },
  { value: "later", label: "This semester", sub: "Open-ended, anytime soon" },
];

const ENERGY: { value: EnergyLevel; label: string; sub: string }[] = [
  { value: "browsing", label: "Browsing", sub: "Just curious, scanning the room" },
  { value: "exploring", label: "Exploring", sub: "Open to ideas, ready to chat" },
  { value: "building", label: "Building", sub: "Heads down, ready to ship" },
];

const LOOKING_FOR_OPTIONS: { value: string; label: string }[] = [
  { value: "cofounder", label: "Cofounder" },
  { value: "study buddy", label: "Study buddy" },
  { value: "mentor", label: "Mentor" },
  { value: "friend", label: "Friend" },
  { value: "collab", label: "Collaborator" },
  { value: "event partner", label: "Event partner" },
];

const SKILL_SUGGESTIONS = [
  "react", "typescript", "python", "ai", "ml", "design",
  "leetcode", "system-design", "fundraising", "writing",
  "running", "climbing", "music",
];

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: "weekday-mornings", label: "Weekday mornings" },
  { value: "weekday-evenings", label: "Weekday evenings" },
  { value: "weekends", label: "Weekends" },
  { value: "evenings", label: "Evenings" },
  { value: "weekend-mornings", label: "Weekend mornings" },
  { value: "anytime", label: "Anytime" },
];

function StepBubble({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`h-1.5 flex-1 rounded-full transition-all ${
        done ? "bg-primary" : active ? "bg-primary/60" : "bg-muted"
      }`}
    />
  );
}

const HERO_STYLES = `
  @keyframes sv-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @keyframes sv-spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes sv-blink { 0%, 60% { opacity: 1; } 70%, 100% { opacity: 0.2; } }
  @keyframes sv-float {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(8px,-12px) scale(1.04); }
  }
  .sv-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  }
  .sv-marquee-track {
    display: inline-flex;
    animation: sv-marquee 40s linear infinite;
    will-change: transform;
  }
  .sv-marquee-track-fast {
    display: inline-flex;
    animation: sv-marquee 20s linear infinite;
    will-change: transform;
  }
  .sv-spin-slow { animation: sv-spin-slow 18s linear infinite; }
  .sv-blink { animation: sv-blink 1.4s ease-in-out infinite; }
  .sv-float { animation: sv-float 6s ease-in-out infinite; }
  .sv-outline-text {
    color: transparent;
    -webkit-text-stroke: 2px currentColor;
  }
  @media (min-width: 768px) {
    .sv-outline-text { -webkit-text-stroke-width: 3px; }
  }
  .sv-grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 56px 56px;
  }
  .sv-tilt-l { transform: rotate(-1.5deg); }
  .sv-tilt-r { transform: rotate(1.5deg); }
`;

const SV_HOT = THEME_SV_HOT;
const SV_CYAN = THEME_SV_CYAN;
const SV_ACID = THEME_SV_ACID;
const SV_GREEN = THEME_SV_GREEN;
const SV_INK = THEME_SV_INK;
const ZONE_HUE = THEME_ZONE_HUE;

function MarqueeStrip({
  totalActive,
  trending,
  hue,
}: {
  totalActive: number;
  trending: { label: string; count: number }[];
  hue: string;
}) {
  const items: string[] = [
    `${totalActive} students live on campus rn`,
    "no inbox / no DMs / no cap",
    "anonymous by default",
    ...trending.map((t) => `${t.count} on it: ${t.label}`),
    "ur college only · ur energy only",
    "match · meet · ship",
  ];
  const loop = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden border-y py-3 font-mono text-xs uppercase tracking-[0.25em]"
      style={{ borderColor: hue, color: hue, backgroundColor: SV_INK }}
    >
      <div className="sv-marquee-track gap-10 whitespace-nowrap">
        {loop.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <Asterisk className="h-3 w-3" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function LandingHero({ onStart }: { onStart: () => void }) {
  const [, setLocation] = useLocation();
  const insights = useGetCommunityInsights(
    {},
    { query: { queryKey: getGetCommunityInsightsQueryKey({}), refetchInterval: 8000 } },
  );
  const allUsers = useListUsers(
    {},
    { query: { queryKey: getListUsersQueryKey({}) } },
  );
  const totalActive = insights.data?.totalActiveNow ?? 0;
  const topZones = insights.data?.mostActiveZones.slice(0, 5) ?? [];
  const trending = insights.data?.trendingActivities.slice(0, 5) ?? [];

  // Group seeded users by college, take a few from each so the picker stays compact
  const demoByCollege = new Map<string, typeof allUsers.data>();
  for (const u of allUsers.data ?? []) {
    if (!demoByCollege.has(u.college)) demoByCollege.set(u.college, []);
    const list = demoByCollege.get(u.college)!;
    if (list && list.length < 4) list.push(u);
  }
  const demoColleges = Array.from(demoByCollege.entries()).slice(0, 4);
  const previewAvatars = (allUsers.data ?? []).slice(0, 6);

  // Featured match pair for the "anatomy of a match" demo section.
  // Try to grab two users from the same startup cohort with overlapping signals;
  // fall back to the first two users we have.
  const findUser = (name: string) =>
    (allUsers.data ?? []).find((u) => u.name === name);
  const matchA = findUser("Maya Chen") ?? (allUsers.data ?? [])[0];
  const matchB =
    findUser("Rohan Mehra") ??
    findUser("Taylor Reed") ??
    (allUsers.data ?? [])[1];
  const sharedSignals: string[] = [];
  if (matchA && matchB) {
    if (matchA.zone === matchB.zone) sharedSignals.push(matchA.zone);
    if (matchA.timeframe === matchB.timeframe) sharedSignals.push(matchA.timeframe);
    if (matchA.energyLevel === matchB.energyLevel) sharedSignals.push(matchA.energyLevel);
    if (
      matchA.lookingFor &&
      matchB.lookingFor &&
      matchA.lookingFor === matchB.lookingFor
    ) {
      sharedSignals.push(matchA.lookingFor);
    }
    if (
      matchA.availability &&
      matchB.availability &&
      matchA.availability === matchB.availability
    ) {
      sharedSignals.push(matchA.availability);
    }
    const skillsA = new Set(
      (matchA.skills ?? "").toLowerCase().split(/[,;]+/).map((s) => s.trim()).filter(Boolean),
    );
    const skillsB = new Set(
      (matchB.skills ?? "").toLowerCase().split(/[,;]+/).map((s) => s.trim()).filter(Boolean),
    );
    for (const s of skillsA) if (skillsB.has(s)) sharedSignals.push(s);
  }
  const facesWall = (allUsers.data ?? []).slice(0, 18);

  const useDemo = (id: string) => {
    setCurrentUserId(id);
    setLocation("/feed");
  };

  return (
    <div
      className="relative w-full overflow-x-hidden text-white"
      style={{ backgroundColor: SV_INK }}
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />
      <div className="pointer-events-none absolute inset-0 sv-noise opacity-60" />

      {/* MARQUEE */}
      <MarqueeStrip totalActive={totalActive} trending={trending} hue={SV_CYAN} />

      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 sv-grid-bg" />
        <div
          className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px] rounded-full opacity-40 blur-[120px] sv-float"
          style={{ background: `radial-gradient(circle, ${SV_HOT} 0%, transparent 70%)` }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-0 h-[420px] w-[420px] rounded-full opacity-30 blur-[120px] sv-float"
          style={{
            background: `radial-gradient(circle, ${SV_CYAN} 0%, transparent 70%)`,
            animationDelay: "2s",
          }}
        />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-12 md:px-12 md:pb-32 md:pt-20">
          <div className="flex items-center justify-between gap-4">
            <div
              className="inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ borderColor: SV_GREEN, color: SV_GREEN }}
            >
              <span
                className="h-1.5 w-1.5 sv-blink rounded-full"
                style={{ backgroundColor: SV_GREEN }}
              />
              Signal Live
            </div>
            <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 md:flex">
              <span>v0.4 · spring '26</span>
              <Asterisk className="h-3 w-3 sv-spin-slow" style={{ color: SV_HOT }} />
              <span>made for builders</span>
            </div>
          </div>

          {/* Wordmark */}
          <div className="relative mt-8 select-none md:mt-12">
            <h1 className="font-black leading-[0.82] tracking-[-0.05em]">
              <span
                className="block text-[20vw] italic md:text-[15vw]"
                style={{ color: SV_HOT, textShadow: `0 0 60px ${SV_HOT}40` }}
              >
                SYNC
              </span>
              <span className="-mt-2 flex items-end gap-3 md:-mt-4 md:gap-6">
                <span
                  className="sv-outline-text text-[20vw] md:text-[15vw]"
                  style={{ color: SV_CYAN }}
                >
                  VERSE
                </span>
                <span
                  className="mb-3 hidden items-center gap-1 self-end font-mono text-xs uppercase tracking-[0.3em] md:mb-6 md:flex"
                  style={{ color: SV_ACID }}
                >
                  <CornerDownRight className="h-3 w-3" />
                  campus os
                </span>
              </span>
            </h1>
          </div>

          {/* Tagline + CTA */}
          <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7">
              <p className="text-2xl font-bold leading-tight tracking-tight md:text-4xl">
                find the ppl on ur campus{" "}
                <span className="italic" style={{ color: SV_CYAN }}>
                  building
                </span>
                ,{" "}
                <span className="italic" style={{ color: SV_HOT }}>
                  shipping
                </span>{" "}
                & locked in{" "}
                <span
                  className="inline-block -rotate-2 px-2"
                  style={{ backgroundColor: SV_ACID, color: SV_INK }}
                >
                  right now.
                </span>
              </p>
              <p className="mt-5 max-w-xl text-base text-white/60 md:text-lg">
                anonymous · single-college · no DMs no inbox no algorithm games.
                you post what ur on. we sync u with the rest.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={onStart}
                  className="group relative inline-flex items-center gap-3 px-7 py-4 text-base font-black uppercase tracking-widest text-black transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: SV_HOT,
                    boxShadow: `6px 6px 0 0 ${SV_CYAN}`,
                  }}
                >
                  <Zap className="h-5 w-5" />
                  Sync me in
                  <MoveUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {previewAvatars.length > 0
                      ? previewAvatars.map((u) => (
                          <UserAvatar
                            key={u.id}
                            user={u}
                            size="md"
                            className="border-2"
                            ring={SV_INK}
                          />
                        ))
                      : ["#22D3EE", "#A78BFA", "#F472B6", "#34D399"].map((c) => (
                          <span
                            key={c}
                            className="h-9 w-9 rounded-full border-2"
                            style={{ backgroundColor: c, borderColor: SV_INK }}
                          />
                        ))}
                  </div>
                  <div className="font-mono text-xs uppercase tracking-widest text-white/70">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={totalActive}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-base font-black not-italic"
                        style={{ color: SV_GREEN }}
                      >
                        {totalActive}
                      </motion.span>
                    </AnimatePresence>{" "}
                    on rn
                  </div>
                </div>
              </div>
            </div>

            {/* Sticker stack */}
            <div className="relative md:col-span-5">
              <div className="pointer-events-none relative mx-auto h-[280px] max-w-md md:h-[340px]">
                <div
                  className="absolute left-2 top-4 sv-tilt-l border-2 px-4 py-3 font-mono text-xs uppercase tracking-widest"
                  style={{ borderColor: SV_CYAN, color: SV_CYAN, backgroundColor: SV_INK }}
                >
                  Stata Center · 2:14 AM
                  <div className="mt-1 text-sm font-bold normal-case tracking-normal text-white">
                    "looking for hackathon co-builder"
                  </div>
                </div>
                <div
                  className="absolute right-0 top-24 sv-tilt-r px-4 py-3"
                  style={{ backgroundColor: SV_ACID, color: SV_INK }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                    Squad formed
                  </div>
                  <div className="text-sm font-black">3/4 locked in</div>
                </div>
                <div
                  className="absolute bottom-8 left-8 sv-tilt-l border-2 px-4 py-2"
                  style={{ borderColor: SV_HOT, color: "white", backgroundColor: SV_INK }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: SV_HOT }}>
                    new match
                  </span>
                  <div className="text-sm font-bold">"both in 6.046, both stuck"</div>
                </div>
                <div
                  className="absolute -right-2 bottom-2 flex h-16 w-16 items-center justify-center rounded-full font-mono text-[10px] uppercase tracking-widest"
                  style={{ backgroundColor: SV_HOT, color: SV_INK }}
                >
                  <Asterisk className="absolute h-16 w-16 sv-spin-slow opacity-30" />
                  <span className="relative font-black">live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANATOMY OF A MATCH */}
      {matchA && matchB && (
        <section
          className="relative border-t"
          style={{ borderColor: "#1a1a22", backgroundColor: "#0d0d14" }}
        >
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-24">
            <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div
                  className="font-mono text-xs uppercase tracking-[0.3em]"
                  style={{ color: SV_CYAN }}
                >
                  / how matching works
                </div>
                <h2 className="mt-2 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
                  anatomy of a{" "}
                  <span className="sv-outline-text" style={{ color: SV_CYAN }}>
                    match
                  </span>
                </h2>
              </div>
              <p className="max-w-md text-sm text-white/60">
                two real students. they both posted what they were on. SYNCVERSE
                spotted the overlap and surfaced them to each other.
              </p>
            </div>

            <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              {[matchA, matchB].map((u, idx) => {
                const accent = idx === 0 ? SV_HOT : SV_CYAN;
                const meta = ZONE_META[u.zone as CommunityZone];
                const Icon = meta?.icon ?? Sparkles;
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative border-2 p-5 md:p-6"
                    style={{ borderColor: accent, backgroundColor: SV_INK }}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} size="xl" square />
                      <div className="min-w-0">
                        <div className="text-lg font-black leading-tight">
                          {u.name}
                        </div>
                        <div
                          className="font-mono text-[10px] uppercase tracking-widest"
                          style={{ color: accent }}
                        >
                          {u.major} · {u.college}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-snug text-white/80">
                      "{u.intent}"
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                        style={{ backgroundColor: accent, color: SV_INK }}
                      >
                        <Icon className="h-3 w-3" />
                        {u.zone}
                      </span>
                      {u.lookingFor && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                          style={{ borderColor: accent, color: accent, borderWidth: 1 }}
                        >
                          wants {u.lookingFor}
                        </span>
                      )}
                      {u.availability && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                          style={{ borderColor: accent, color: accent, borderWidth: 1 }}
                        >
                          free {u.availability}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Connector */}
              <div className="flex items-center justify-center md:flex-col">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex h-24 w-24 flex-col items-center justify-center md:h-28 md:w-28"
                  style={{
                    backgroundColor: SV_ACID,
                    color: SV_INK,
                    boxShadow: `4px 4px 0 0 ${SV_HOT}`,
                  }}
                >
                  <div className="font-mono text-[9px] uppercase tracking-widest">
                    align
                  </div>
                  <div className="text-3xl font-black italic leading-none tracking-tighter md:text-4xl">
                    94
                  </div>
                  <Asterisk className="mt-1 h-4 w-4 sv-spin-slow" />
                </motion.div>
              </div>
            </div>

            {sharedSignals.length > 0 && (
              <div className="mt-8 border-2 p-5" style={{ borderColor: "#1a1a22", backgroundColor: SV_INK }}>
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: SV_GREEN }}
                >
                  / shared signals SYNCVERSE picked up
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sharedSignals.slice(0, 8).map((s, i) => (
                    <motion.span
                      key={s + i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="inline-flex items-center gap-1 px-3 py-1 font-mono text-xs uppercase tracking-widest"
                      style={{
                        backgroundColor: SV_GREEN,
                        color: SV_INK,
                        boxShadow: `2px 2px 0 0 ${SV_INK}`,
                      }}
                    >
                      <Asterisk className="h-3 w-3" />
                      {s}
                    </motion.span>
                  ))}
                </div>
                <p className="mt-4 max-w-2xl text-sm text-white/60">
                  no questionnaires. no swiping. just the overlap between what
                  you posted and what 200 other students already posted today.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FACES WALL */}
      {facesWall.length > 0 && (
        <section
          className="relative border-t"
          style={{ borderColor: "#1a1a22", backgroundColor: SV_INK }}
        >
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-3xl font-black italic leading-none tracking-tighter md:text-5xl">
                live <span style={{ color: SV_HOT }}>faces</span> on campus
              </h2>
              <div
                className="hidden font-mono text-[10px] uppercase tracking-[0.3em] md:block"
                style={{ color: SV_ACID }}
              >
                tap a face to drop into their feed
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 md:gap-3">
              {facesWall.map((u) => {
                const meta = ZONE_META[u.zone as CommunityZone];
                const hue = ZONE_HUE[u.zone as CommunityZone] ?? SV_CYAN;
                return (
                  <button
                    key={u.id}
                    onClick={() => useDemo(u.id)}
                    className="group relative aspect-square overflow-hidden border-2 transition-transform hover:-translate-y-1"
                    style={{ borderColor: "#1a1a22" }}
                  >
                    <UserAvatar user={u} fill />
                    <div
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2"
                    >
                      <div className="truncate text-[10px] font-black uppercase tracking-tight text-white">
                        {u.name.split(" ")[0]}
                      </div>
                      <div
                        className="truncate font-mono text-[8px] uppercase tracking-widest"
                        style={{ color: hue }}
                      >
                        {meta?.label ?? u.zone}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* BENTO VIBE GRID */}
      <section className="relative border-t" style={{ borderColor: "#1a1a22" }}>
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
              what's <span style={{ color: SV_HOT }}>hitting</span>
              <br />
              on campus
            </h2>
            <div className="hidden text-right font-mono text-xs uppercase tracking-widest text-white/50 md:block">
              auto-refresh
              <br />
              every 8s
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
            {/* Total counter mega tile */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative col-span-2 overflow-hidden md:col-span-3 md:row-span-2"
              style={{ backgroundColor: SV_HOT, color: SV_INK }}
            >
              <div className="relative p-6 md:p-10">
                <div className="font-mono text-xs uppercase tracking-[0.3em]">
                  total students locked in
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={totalActive}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="mt-2 text-[28vw] font-black italic leading-[0.82] tracking-[-0.07em] md:text-[12vw]"
                  >
                    {totalActive.toString().padStart(3, "0")}
                  </motion.div>
                </AnimatePresence>
                <div className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                  <Radio className="h-3 w-3 sv-blink" />
                  broadcasting now
                </div>
                <div className="mt-6 max-w-xs text-sm font-bold leading-tight">
                  every one of them is on something. one of them is on ur thing.
                </div>
              </div>
              <Asterisk className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 opacity-10 sv-spin-slow" />
            </motion.div>

            {/* Top zone tiles */}
            {topZones.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="col-span-1 h-32 animate-pulse md:col-span-3 md:h-auto"
                    style={{ backgroundColor: "#11111A" }}
                  />
                ))
              : topZones.slice(0, 4).map((z, i) => {
                  const meta = ZONE_META[z.zone as CommunityZone];
                  const Icon = meta?.icon ?? Sparkles;
                  const hue = ZONE_HUE[z.zone as CommunityZone] ?? SV_CYAN;
                  const big = i === 0;
                  return (
                    <motion.div
                      key={z.zone}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className={`group relative overflow-hidden border-2 transition-transform hover:-translate-y-1 ${
                        big ? "col-span-2 md:col-span-3" : "col-span-1 md:col-span-3"
                      }`}
                      style={{ borderColor: hue, backgroundColor: SV_INK }}
                    >
                      <div className="relative p-5 md:p-6">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest"
                            style={{ backgroundColor: hue, color: SV_INK }}
                          >
                            <Icon className="h-3 w-3" />
                            {meta?.label ?? z.zone}
                          </div>
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: hue }}
                          >
                            #{(i + 1).toString().padStart(2, "0")}
                          </span>
                        </div>
                        <div
                          className="mt-3 text-5xl font-black italic leading-none tracking-tighter md:text-7xl"
                          style={{ color: hue }}
                        >
                          {z.activeUsers}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                          <span className="font-mono uppercase tracking-widest">
                            in zone
                          </span>
                          <span
                            className="font-mono font-black uppercase tracking-widest"
                            style={{ color: SV_GREEN }}
                          >
                            +{z.livingNow} live
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE — explain communities */}
      <section
        className="relative border-t border-b"
        style={{ borderColor: "#1a1a22", backgroundColor: "#0d0d14" }}
      >
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-24">
          <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: SV_ACID }}>
                / what's inside
              </div>
              <h2 className="mt-2 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
                three rooms.<br />
                <span className="sv-outline-text" style={{ color: SV_ACID }}>one campus</span>.
              </h2>
            </div>
            <p className="max-w-md text-sm text-white/60">
              everything inside is shaped by who you are and what you're after.
              no global feed. no follower counts. just your people, this week, on your campus.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                accent: SV_HOT,
                tag: "/ matches",
                title: "people on your wavelength",
                body: "tell us what you're working on right now. we surface the 6 students at your college whose intent, major, and energy line up tightest. ranked by alignment. refreshed live.",
                bullets: ["filtered to your school only", "ranked by shared signals", "anonymous until you say hi"],
              },
              {
                accent: SV_CYAN,
                tag: "/ squads",
                title: "small rooms that ship",
                body: "auto-formed groups of 3-5 around a real first action. study group for orgo midterm. cofounder team for demo day. running crew for charles river. with a meet spot already picked.",
                bullets: ["3-5 people max", "first action pre-set", "meet spot suggested"],
              },
              {
                accent: SV_GREEN,
                tag: "/ events",
                title: "events curated to you",
                body: "every event you see is hand-picked for your zone, your major, and what you said you're looking for. no scrolling through 200 frat parties when you came here to find a thesis advisor.",
                bullets: ["personalized per person", "host your own in 30s", "see who else is going"],
              },
            ].map((card, i) => (
              <div
                key={card.tag}
                className="border-2"
                style={{ borderColor: card.accent, backgroundColor: SV_INK }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ backgroundColor: card.accent, color: SV_INK }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em]">{card.tag}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest">
                    0{i + 1}
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-2xl font-black italic leading-tight tracking-tight md:text-3xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{card.body}</p>
                  <ul className="mt-5 space-y-2 border-t pt-4" style={{ borderColor: "#1a1a22" }}>
                    {card.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/50"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5"
                          style={{ backgroundColor: card.accent }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDY PEERS — meet your major */}
      <section className="relative border-b" style={{ borderColor: "#1a1a22", backgroundColor: SV_INK }}>
        <div className="mx-auto grid max-w-[1440px] gap-0 px-5 py-16 md:grid-cols-2 md:px-12 md:py-24">
          <div className="border-2 p-6 md:p-10" style={{ borderColor: SV_CYAN }}>
            <div
              className="font-mono text-xs uppercase tracking-[0.3em]"
              style={{ color: SV_CYAN }}
            >
              / study peers
            </div>
            <h2 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-5xl">
              came here to <span style={{ color: SV_CYAN }}>study</span>?<br />
              meet the rest of your major.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/70 md:text-base">
              every major on your campus has a hub. see who else is grinding the same orgo problem set,
              the same quant final, the same thesis defense. find a study room. form a group.
              never grind alone again.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "same major", value: "live count" },
                { label: "active now", value: "in the moment" },
                { label: "study squads", value: "open to join" },
                { label: "shared topics", value: "what they're on" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="border p-3"
                  style={{ borderColor: "#1a1a22" }}
                >
                  <div
                    className="font-mono text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: SV_CYAN }}
                  >
                    {s.label}
                  </div>
                  <div className="mt-1 text-xs text-white/60">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="relative flex flex-col justify-between border-l-0 border-2 p-6 md:p-10"
            style={{ borderColor: SV_GREEN, backgroundColor: "#0d0d14" }}
          >
            <div>
              <div
                className="font-mono text-xs uppercase tracking-[0.3em]"
                style={{ color: SV_GREEN }}
              >
                / events for you
              </div>
              <h2 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-5xl">
                every event,<br />
                <span style={{ color: SV_GREEN }}>handpicked</span>.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/70 md:text-base">
                we don't show you everything. we show you what fits.
                a thesis writing sprint if you're deep in research. a founders friday if you're building.
                a 6am charles river run if you marked yourself a runner. one calendar. zero noise.
              </p>
            </div>
            <div className="mt-8 border-t pt-6" style={{ borderColor: "#1a1a22" }}>
              <div className="space-y-3">
                {[
                  { tag: "STUDY", text: "orgo midterm sprint · widener basement" },
                  { tag: "STARTUP", text: "demo day rehearsal · innovation hub" },
                  { tag: "FITNESS", text: "charles river 5k · 6am thursday" },
                ].map((e, i) => {
                  const hue = [SV_CYAN, SV_HOT, SV_ACID][i]!;
                  return (
                    <div key={e.tag} className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 font-mono text-[10px] uppercase tracking-widest"
                        style={{ backgroundColor: hue, color: SV_INK }}
                      >
                        {e.tag}
                      </span>
                      <span className="text-xs text-white/70 md:text-sm">{e.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OLD PICK A BRAIN (kept hidden, was demo) */}
      {false && demoColleges.length > 0 && (
        <section
          className="relative border-t border-b"
          style={{ borderColor: "#1a1a22", backgroundColor: "#0d0d14" }}
        >
          <div
            className="overflow-hidden border-b py-2 font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ borderColor: "#1a1a22", color: SV_ACID }}
          >
            <div className="sv-marquee-track-fast gap-8 whitespace-nowrap">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <Asterisk className="h-2.5 w-2.5" /> jack into someone's head ·
                  one tap demo · no signup ·
                </span>
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-24">
            <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div
                  className="font-mono text-xs uppercase tracking-[0.3em]"
                  style={{ color: SV_ACID }}
                >
                  / try it live
                </div>
                <h2 className="mt-2 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
                  pick a <span className="sv-outline-text" style={{ color: SV_ACID }}>brain</span>
                </h2>
              </div>
              <p className="max-w-md text-sm text-white/60">
                tap any student to instantly see their feed, matches, threads, squads.
                no signup. no nothing. just be them for a sec.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {demoColleges.map(([college, users], collegeIdx) => {
                const accent = [SV_HOT, SV_CYAN, SV_ACID, SV_GREEN][collegeIdx % 4];
                return (
                  <div
                    key={college}
                    className="border-2"
                    style={{ borderColor: accent, backgroundColor: SV_INK }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ backgroundColor: accent, color: SV_INK }}
                    >
                      <div className="font-black uppercase tracking-tight">{college}</div>
                      <span className="font-mono text-[10px] uppercase tracking-widest">
                        {(users ?? []).length} online
                      </span>
                    </div>
                    <div className="divide-y" style={{ borderColor: "#1a1a22" }}>
                      {(users ?? []).map((u) => {
                        const meta = ZONE_META[u.zone as CommunityZone];
                        const Icon = meta?.icon ?? Sparkles;
                        const zoneHue = ZONE_HUE[u.zone as CommunityZone] ?? SV_CYAN;
                        return (
                          <button
                            key={u.id}
                            onClick={() => useDemo(u.id)}
                            className="group relative flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                            style={{ borderColor: "#1a1a22" }}
                          >
                            <UserAvatar user={u} size="lg" square />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 truncate text-sm font-black">
                                {u.name}
                                <span
                                  className="font-mono text-[10px] uppercase tracking-widest"
                                  style={{ color: zoneHue }}
                                >
                                  · {u.major}
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/60">
                                <Icon className="h-3 w-3 flex-shrink-0" style={{ color: zoneHue }} />
                                <span className="truncate italic">"{u.intent}"</span>
                              </div>
                            </div>
                            <div
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center transition-transform group-hover:translate-x-1"
                              style={{ backgroundColor: accent, color: SV_INK }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TRENDING (removed per request) */}
      {false && trending.length > 0 && (
        <section className="relative border-t" style={{ borderColor: "#1a1a22" }}>
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-24">
            <div className="mb-8">
              <div
                className="font-mono text-xs uppercase tracking-[0.3em]"
                style={{ color: SV_HOT }}
              >
                / leaderboard
              </div>
              <h2 className="mt-2 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
                what people <br />
                <span style={{ color: SV_HOT }}>can't shut up</span> about
              </h2>
            </div>

            <div className="border-y-2" style={{ borderColor: SV_HOT }}>
              {trending.map((t, i) => {
                const hue = ZONE_HUE[t.zone as CommunityZone] ?? SV_CYAN;
                return (
                  <motion.div
                    key={t.label + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                    className="group flex items-center gap-4 border-b py-4 transition-colors last:border-b-0 hover:bg-white/[0.02] md:gap-6 md:py-6"
                    style={{ borderColor: "#1a1a22" }}
                  >
                    <div
                      className="w-16 text-right font-black italic leading-none sv-outline-text md:w-32 md:text-7xl"
                      style={{ color: SV_HOT, fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-bold md:text-2xl">
                        {t.label}
                      </div>
                      <div
                        className="mt-1 inline-block font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: hue }}
                      >
                        / {t.zone}
                      </div>
                    </div>
                    <div
                      className="flex flex-col items-end gap-0.5 px-2 py-1 font-mono"
                      style={{ color: SV_GREEN }}
                    >
                      <span className="text-2xl font-black md:text-3xl">{t.count}</span>
                      <span className="text-[9px] uppercase tracking-widest">
                        on it now
                      </span>
                    </div>
                    <MoveUpRight
                      className="hidden h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 md:block"
                      style={{ color: SV_HOT }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* MANIFESTO */}
      <section className="relative border-t" style={{ borderColor: "#1a1a22", backgroundColor: "#0d0d14" }}>
        <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-12 md:py-24">
          <div className="mb-12 flex items-center gap-4">
            <div className="h-px flex-1" style={{ backgroundColor: SV_CYAN }} />
            <span
              className="font-mono text-xs uppercase tracking-[0.4em]"
              style={{ color: SV_CYAN }}
            >
              the manifesto
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: SV_CYAN }} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                tag: "01 / matches",
                pull: "real matches.",
                hue: SV_CYAN,
                body:
                  "you say what ur on. we rank ppl pulling in the same direction. not vibes. alignment.",
              },
              {
                tag: "02 / squads",
                pull: "auto-squads.",
                hue: SV_HOT,
                body:
                  "3+ ppl lock onto one mission and a squad spawns with a name, a purpose, a first move.",
              },
              {
                tag: "03 / nothing else",
                pull: "no inbox. no algo.",
                hue: SV_ACID,
                body:
                  "anonymous by default. ur intent updates as ur week shifts. only as deep as u want.",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                className="group relative overflow-hidden border-2 p-6 transition-transform hover:-translate-y-1 md:p-8"
                style={{ borderColor: c.hue, backgroundColor: SV_INK }}
              >
                <div
                  className="font-mono text-xs uppercase tracking-[0.3em]"
                  style={{ color: c.hue }}
                >
                  {c.tag}
                </div>
                <div
                  className="mt-6 text-4xl font-black italic leading-none tracking-tighter md:text-5xl"
                  style={{ color: c.hue }}
                >
                  {c.pull}
                </div>
                <p className="mt-6 text-sm leading-relaxed text-white/70">{c.body}</p>
                <Asterisk
                  className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 transition-transform group-hover:rotate-45"
                  style={{ color: c.hue }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA WALL */}
      <section
        className="relative overflow-hidden border-t"
        style={{ borderColor: "#1a1a22", backgroundColor: SV_HOT }}
      >
        <div className="pointer-events-none absolute inset-0 sv-noise opacity-30" />
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full opacity-50 blur-[120px]"
          style={{ backgroundColor: SV_CYAN }}
        />
        <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-12 md:py-32">
          <div
            className="font-mono text-xs uppercase tracking-[0.4em]"
            style={{ color: SV_INK }}
          >
            / ur turn
          </div>
          <h2
            className="mt-4 text-[15vw] font-black italic leading-[0.82] tracking-[-0.05em] md:text-[10vw]"
            style={{ color: SV_INK }}
          >
            you in?
          </h2>
          <p
            className="mt-6 max-w-2xl text-lg font-bold md:text-2xl"
            style={{ color: SV_INK }}
          >
            takes 30 seconds. no email. no password. just say what ur on
            and meet the rest of campus already on it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-8 py-5 text-lg font-black uppercase tracking-widest transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: SV_INK,
                color: SV_ACID,
                boxShadow: `8px 8px 0 0 ${SV_CYAN}`,
              }}
            >
              <Zap className="h-5 w-5" />
              Sync me in
              <MoveUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <div
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
              style={{ color: SV_INK }}
            >
              <Asterisk className="h-3 w-3 sv-spin-slow" />
              <span>no login · no inbox · anonymous by default</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div
        className="border-t px-5 py-6 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 md:px-12"
        style={{ borderColor: "#1a1a22" }}
      >
        SYNCVERSE · campus os · single-college only · v0.4
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const existingUserId = useCurrentUserId();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateUserInput>({
    name: "",
    college: "",
    major: "",
    intent: "",
    timeframe: "now",
    energyLevel: "exploring",
    zone: "startup",
    lookingFor: "",
    skills: "",
    availability: "",
  });
  const [extraZones, setExtraZones] = useState<CommunityZone[]>([]);

  const selectedZones: CommunityZone[] = [form.zone, ...extraZones];

  const toggleZone = (z: CommunityZone) => {
    if (form.zone === z) {
      // demoting primary: promote first extra if present, else no-op (need at least 1)
      if (extraZones.length === 0) return;
      const [newPrimary, ...rest] = extraZones;
      setForm({ ...form, zone: newPrimary });
      setExtraZones(rest);
      return;
    }
    if (extraZones.includes(z)) {
      setExtraZones(extraZones.filter((x) => x !== z));
      return;
    }
    // adding new zone
    if (selectedZones.length === 0) {
      setForm({ ...form, zone: z });
      return;
    }
    if (selectedZones.length >= 3) return; // cap at 3
    setExtraZones([...extraZones, z]);
  };

  // If they've already onboarded, show the landing page with a "go to feed" CTA
  useEffect(() => {
    // do nothing - we handle this with conditional rendering
  }, []);

  const createUser = useCreateUser({
    mutation: {
      onSuccess: (user) => {
        setCurrentUserId(user.id);
        setLocation("/feed");
      },
    },
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const submit = () => {
    // pack extra zones as `zone:<name>` tokens into skills so matching picks them up
    const zoneTokens = extraZones.map((z) => `zone:${z}`).join(", ");
    const baseSkills = (form.skills ?? "").trim();
    const mergedSkills = [baseSkills, zoneTokens].filter(Boolean).join(", ");
    createUser.mutate({ data: { ...form, skills: mergedSkills } });
  };

  const canStep0 =
    form.name.trim().length > 1 &&
    form.college.trim().length > 1 &&
    form.major.trim().length > 1;
  const canStep1 = !!form.zone;
  const canStep2 = form.intent.trim().length >= 3;

  if (existingUserId && !showForm) {
    return (
      <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <Activity className="h-3 w-3 animate-pulse" /> You're already in
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tighter md:text-4xl">
                Welcome back to SYNCVERSE
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your intent is live. Jump back into the feed.
              </p>
            </div>
            <Link href="/feed">
              <Button size="lg">
                Open feed <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showForm) {
    return <LandingHero onStart={() => setShowForm(true)} />;
  }

  const exampleIntent = ZONE_META[form.zone].example;

  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Activity className="h-3 w-3 animate-pulse" /> Setting up your sync
          </div>
          <h1 className="text-4xl font-black tracking-tighter md:text-5xl">
            Four quick steps
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step + 1} of 4 — under 45 seconds.
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <StepBubble key={i} active={i === step} done={i < step} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-bold">Who are you?</h2>
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      placeholder="Maya Chen"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="college">College</Label>
                      <Input
                        id="college"
                        placeholder="Stanford"
                        value={form.college}
                        onChange={(e) => setForm({ ...form, college: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        placeholder="Computer Science"
                        value={form.major}
                        onChange={(e) => setForm({ ...form, major: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={next} disabled={!canStep0} className="w-full" size="lg">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-bold">Pick your zones</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose 1–3 zones. First pick is your primary; extras widen
                    your match pool. ({selectedZones.length}/3 selected)
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {ZONES_LIST.map((z) => {
                      const meta = ZONE_META[z];
                      const Icon = meta.icon;
                      const isPrimary = form.zone === z;
                      const isExtra = extraZones.includes(z);
                      const active = isPrimary || isExtra;
                      const atCap = !active && selectedZones.length >= 3;
                      const order = isPrimary
                        ? 1
                        : isExtra
                          ? extraZones.indexOf(z) + 2
                          : 0;
                      return (
                        <button
                          key={z}
                          onClick={() => toggleZone(z)}
                          disabled={atCap}
                          className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                            active
                              ? "border-primary bg-gradient-to-br " + meta.tint + " shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                              : atCap
                                ? "border-border bg-muted/10 opacity-40 cursor-not-allowed"
                                : "border-border bg-muted/20 hover:border-primary/50"
                          }`}
                        >
                          {active && (
                            <div
                              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black"
                              style={{
                                backgroundColor: isPrimary ? SV_HOT : SV_CYAN,
                                color: SV_INK,
                              }}
                            >
                              {order}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div className="font-bold">{meta.label}</div>
                            {isPrimary && (
                              <span className="ml-1 rounded border border-primary/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                primary
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{meta.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={back} variant="outline" size="lg">
                      Back
                    </Button>
                    <Button onClick={next} disabled={!canStep1} className="flex-1" size="lg">
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-bold">What are you up to?</h2>
                  <p className="text-sm text-muted-foreground">
                    Be specific. Specific intents get specific matches.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="intent">Your intent right now</Label>
                    <Textarea
                      id="intent"
                      rows={4}
                      placeholder={exampleIntent}
                      value={form.intent}
                      onChange={(e) => setForm({ ...form, intent: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, intent: exampleIntent })}
                      className="text-xs text-primary hover:underline"
                    >
                      Use example
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Timeframe</Label>
                      <div className="flex flex-col gap-2">
                        {TIMEFRAMES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setForm({ ...form, timeframe: t.value })}
                            className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                              form.timeframe === t.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/30"
                            }`}
                          >
                            <div className="font-semibold">{t.label}</div>
                            <div className="text-[11px] text-muted-foreground">{t.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Energy level</Label>
                      <div className="flex flex-col gap-2">
                        {ENERGY.map((e) => (
                          <button
                            key={e.value}
                            onClick={() => setForm({ ...form, energyLevel: e.value })}
                            className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                              form.energyLevel === e.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/30"
                            }`}
                          >
                            <div className="font-semibold">{e.label}</div>
                            <div className="text-[11px] text-muted-foreground">{e.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={back} variant="outline" size="lg">
                      Back
                    </Button>
                    <Button
                      onClick={next}
                      disabled={!canStep2}
                      className="flex-1"
                      size="lg"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <h2 className="text-2xl font-bold">One more layer</h2>
                  <p className="text-sm text-muted-foreground">
                    Optional. The more you say, the sharper your matches.
                  </p>

                  <div className="space-y-2">
                    <Label>You're looking for</Label>
                    <div className="flex flex-wrap gap-2">
                      {LOOKING_FOR_OPTIONS.map((o) => {
                        const active = form.lookingFor === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                lookingFor: active ? "" : o.value,
                              })
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted/30 hover:border-primary/50"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Your skills (comma separated)</Label>
                    <Input
                      id="skills"
                      placeholder="react, typescript, ai, fundraising"
                      value={form.skills ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, skills: e.target.value })
                      }
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {SKILL_SUGGESTIONS.map((s) => {
                        const tokens = (form.skills ?? "")
                          .split(",")
                          .map((t) => t.trim().toLowerCase())
                          .filter(Boolean);
                        const active = tokens.includes(s.toLowerCase());
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? tokens.filter((t) => t !== s.toLowerCase())
                                : [...tokens, s.toLowerCase()];
                              setForm({ ...form, skills: next.join(", ") });
                            }}
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                              active
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border bg-muted/20 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            + {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>When you're free</Label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABILITY_OPTIONS.map((o) => {
                        const active = form.availability === o.value;
                        return (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                availability: active ? "" : o.value,
                              })
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted/30 hover:border-primary/50"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={back} variant="outline" size="lg">
                      Back
                    </Button>
                    <Button
                      onClick={submit}
                      disabled={createUser.isPending}
                      className="flex-1"
                      size="lg"
                    >
                      <Zap className="mr-2 h-4 w-4" /> Sync me in
                    </Button>
                  </div>
                  {createUser.isError && (
                    <p className="text-sm text-destructive">
                      Something went wrong. Try again.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
