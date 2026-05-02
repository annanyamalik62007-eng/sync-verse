import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateUser } from "@workspace/api-client-react";
import {
  CommunityZone,
  Timeframe,
  EnergyLevel,
  type CreateUserInput,
} from "@workspace/api-client-react";
import { setCurrentUserId } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Zap, ArrowRight } from "lucide-react";

const ZONES: { value: CommunityZone; label: string; desc: string }[] = [
  { value: "career", label: "Career", desc: "interviews, internships, recruiting" },
  { value: "startup", label: "Startup", desc: "founders, builders, hackers" },
  { value: "study", label: "Study", desc: "deep work, exam prep, problem sets" },
  { value: "social", label: "Social", desc: "events, meetups, hangouts" },
  { value: "creative", label: "Creative", desc: "design, music, writing, art" },
  { value: "fitness", label: "Fitness", desc: "training, sports, runs" },
  { value: "research", label: "Research", desc: "labs, papers, deep dives" },
];

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "now", label: "Right now" },
  { value: "soon", label: "Within a week" },
  { value: "later", label: "This semester" },
];

const ENERGY: { value: EnergyLevel; label: string }[] = [
  { value: "browsing", label: "Browsing" },
  { value: "exploring", label: "Exploring" },
  { value: "building", label: "Building" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
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
    createUser.mutate({ data: form });
  };

  const canStep0 = form.name.trim().length > 1 && form.college.trim().length > 1 && form.major.trim().length > 1;
  const canStep1 = !!form.zone;
  const canStep2 = form.intent.trim().length >= 3;

  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Activity className="h-3 w-3 animate-pulse" /> Live on campus
          </div>
          <h1 className="text-5xl font-black tracking-tighter md:text-7xl">
            <span className="text-primary">SYNC</span>VERSE
          </h1>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Find the people building, studying, shipping, hustling — right now, on your campus.
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-5">
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
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold">Pick your zone</h2>
                <p className="text-sm text-muted-foreground">Where are your energy and attention going this week?</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {ZONES.map((z) => (
                    <button
                      key={z.value}
                      onClick={() => setForm({ ...form, zone: z.value })}
                      className={`group rounded-xl border p-4 text-left transition-all ${
                        form.zone === z.value
                          ? "border-primary bg-primary/10 shadow-[0_0_20px_-5px_hsl(var(--primary))]"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      }`}
                    >
                      <div className="font-bold">{z.label}</div>
                      <div className="text-xs text-muted-foreground">{z.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={back} variant="outline" size="lg">Back</Button>
                  <Button onClick={next} disabled={!canStep1} className="flex-1" size="lg">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold">What are you up to?</h2>
                <div className="space-y-2">
                  <Label htmlFor="intent">Your intent right now</Label>
                  <Textarea
                    id="intent"
                    rows={4}
                    placeholder="Looking for two cofounders to build an AI study tool this weekend"
                    value={form.intent}
                    onChange={(e) => setForm({ ...form, intent: e.target.value })}
                  />
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
                          {t.label}
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
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={back} variant="outline" size="lg">Back</Button>
                  <Button onClick={submit} disabled={!canStep2 || createUser.isPending} className="flex-1" size="lg">
                    <Zap className="mr-2 h-4 w-4" /> Sync me in
                  </Button>
                </div>
                {createUser.isError && (
                  <p className="text-sm text-destructive">Something went wrong. Try again.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
