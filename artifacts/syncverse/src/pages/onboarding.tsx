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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

function StepBubble({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`h-1.5 flex-1 rounded-full transition-all ${
        done ? "bg-primary" : active ? "bg-primary/60" : "bg-muted"
      }`}
    />
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
  const topZones = insights.data?.mostActiveZones.slice(0, 3) ?? [];
  const trending = insights.data?.trendingActivities.slice(0, 4) ?? [];

  // Group seeded users by college, take a few from each so the picker stays compact
  const demoByCollege = new Map<string, typeof allUsers.data>();
  for (const u of allUsers.data ?? []) {
    if (!demoByCollege.has(u.college)) demoByCollege.set(u.college, []);
    const list = demoByCollege.get(u.college)!;
    if (list && list.length < 4) list.push(u);
  }
  const demoColleges = Array.from(demoByCollege.entries()).slice(0, 4);

  const useDemo = (id: string) => {
    setCurrentUserId(id);
    setLocation("/feed");
  };

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 md:p-14">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live on campus
          </div>
          <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl">
            <span className="text-primary">SYNC</span>
            <span>VERSE</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-foreground/90 md:text-2xl">
            The campus connection engine. Find the people building, studying,
            shipping, and hustling — <span className="text-primary">right now</span>.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={onStart} className="px-8 text-base font-bold">
              <Zap className="mr-2 h-4 w-4" /> Sync me in
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex -space-x-2">
                {["#22D3EE", "#A78BFA", "#F472B6", "#34D399"].map((c) => (
                  <span
                    key={c}
                    className="h-7 w-7 rounded-full ring-2 ring-card"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={totalActive}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="font-semibold text-foreground"
                >
                  {totalActive}
                </motion.span>
              </AnimatePresence>
              students live now
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topZones.map((z, i) => {
          const meta = ZONE_META[z.zone as CommunityZone];
          const Icon = meta?.icon ?? Sparkles;
          return (
            <motion.div
              key={z.zone}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className={`border-border bg-gradient-to-br ${meta?.tint ?? ""} h-full`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                        <Icon className="h-3 w-3" /> {meta?.label ?? z.zone}
                      </div>
                      <div className="mt-3 text-3xl font-black tracking-tighter">
                        {z.activeUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">in this zone</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        live
                      </div>
                      <div className="text-2xl font-black text-primary">{z.livingNow}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {demoColleges.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> Try the demo as a real student
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              one click sign-in
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {demoColleges.map(([college, users]) => (
              <Card key={college} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-bold">{college}</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {(users ?? []).length} students
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(users ?? []).map((u) => {
                      const meta = ZONE_META[u.zone as CommunityZone];
                      const Icon = meta?.icon ?? Sparkles;
                      const initials = u.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <button
                          key={u.id}
                          onClick={() => useDemo(u.id)}
                          className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-muted/30 p-2.5 text-left transition-all hover:border-primary/50 hover:bg-primary/5"
                        >
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black text-background"
                            style={{ backgroundColor: u.avatarColor }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 truncate text-sm font-bold">
                              {u.name}
                              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                · {u.major}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                              <Icon className="h-3 w-3 flex-shrink-0 text-primary" />
                              <span className="truncate">{u.intent}</span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pick any student to instantly see their matches, threads, and squads. Or scroll down to create your own.
          </p>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Flame className="h-3 w-3" /> Trending right now
          </div>
          <div className="space-y-2">
            {trending.map((t, i) => (
              <motion.div
                key={t.label + i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-sm font-black">{i + 1}</span>
                  </div>
                  <div className="truncate text-sm font-semibold">{t.label}</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t.zone}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {t.count} live
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Sparkles,
            title: "Real matches, not chats",
            body:
              "Tell SYNCVERSE what you're working on. Get ranked by alignment with people pulling toward the same thing.",
          },
          {
            icon: Users,
            title: "Auto-formed squads",
            body:
              "When 3+ students lock onto a shared mission, SYNCVERSE proposes a squad with a name, purpose, and first move.",
          },
          {
            icon: Activity,
            title: "Live, anonymous, no inbox spam",
            body:
              "Your intent updates as your week changes. Match, message, RSVP — only as deep as you want to go.",
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-5">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <div className="font-bold">{c.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button size="lg" onClick={onStart} className="px-10 text-base font-bold">
          Start your sync <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          No login. No inbox. Anonymous by default.
        </p>
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
  });

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
  const submit = () => createUser.mutate({ data: form });

  const canStep0 =
    form.name.trim().length > 1 &&
    form.college.trim().length > 1 &&
    form.major.trim().length > 1;
  const canStep1 = !!form.zone;
  const canStep2 = form.intent.trim().length >= 3;

  if (existingUserId && !showForm) {
    return (
      <div className="space-y-8">
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
        <LandingHero onStart={() => setLocation("/feed")} />
      </div>
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
            Three quick steps
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Step {step + 1} of 3 — under 30 seconds.
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
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
                  <h2 className="text-2xl font-bold">Pick your zone</h2>
                  <p className="text-sm text-muted-foreground">
                    Where is your energy this week? You can switch any time.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {ZONES_LIST.map((z) => {
                      const meta = ZONE_META[z];
                      const Icon = meta.icon;
                      const active = form.zone === z;
                      return (
                        <button
                          key={z}
                          onClick={() => setForm({ ...form, zone: z })}
                          className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                            active
                              ? "border-primary bg-gradient-to-br " + meta.tint + " shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                              : "border-border bg-muted/20 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div className="font-bold">{meta.label}</div>
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
                      onClick={submit}
                      disabled={!canStep2 || createUser.isPending}
                      className="flex-1"
                      size="lg"
                    >
                      <Zap className="mr-2 h-4 w-4" /> Sync me in
                    </Button>
                  </div>
                  {createUser.isError && (
                    <p className="text-sm text-destructive">Something went wrong. Try again.</p>
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
