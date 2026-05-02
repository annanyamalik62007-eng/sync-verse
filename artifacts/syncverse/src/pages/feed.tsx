import { Link } from "wouter";
import {
  useListLiveSignals,
  useGetCommunityInsights,
  useGetFomoTriggers,
  useGetUser,
  getGetUserQueryKey,
  type Signal,
  type FomoTrigger,
  type ZoneActivity,
  type TrendingActivity,
  type CommunityZone,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Flame, TrendingUp, Users, Zap, Clock } from "lucide-react";

const intensityClass: Record<string, string> = {
  high: "border-primary text-primary bg-primary/10",
  medium: "border-accent text-accent bg-accent/10",
  low: "border-muted-foreground/30 text-muted-foreground bg-muted/30",
};

const urgencyIcon: Record<string, typeof Flame> = {
  high: Flame,
  medium: Zap,
  subtle: Clock,
};

function ZoneChip({ zone }: { zone: CommunityZone }) {
  return (
    <Link href={`/zone/${zone}`}>
      <span className="cursor-pointer rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary">
        {zone}
      </span>
    </Link>
  );
}

export default function Feed() {
  const userId = useCurrentUserId();
  const { data: user } = useGetUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId ?? "") },
  });
  const college = user?.college;

  const signals = useListLiveSignals({ college });
  const insights = useGetCommunityInsights({ college });
  const fomos = useGetFomoTriggers({ college });

  const totalActive = insights.data?.totalActiveNow ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          Live signal feed
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tighter md:text-5xl">
          {totalActive} {totalActive === 1 ? "person is" : "people are"} active
          {college ? ` at ${college}` : ""} right now
        </h1>
        <p className="mt-2 text-muted-foreground">Hi {user?.name ?? "there"} — here's where the energy is.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/matches">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:shadow-[0_0_25px_-5px_hsl(var(--primary))]">
              <Flame className="h-4 w-4" /> See your matches
            </button>
          </Link>
          <Link href="/squads">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-5 py-2.5 text-sm font-bold transition-all hover:border-primary hover:text-primary">
              <Users className="h-4 w-4" /> Squads forming
            </button>
          </Link>
        </div>
      </div>

      {/* FOMO triggers */}
      {(fomos.data?.length ?? 0) > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Don't miss this</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {fomos.data!.map((f: FomoTrigger) => {
              const Icon = urgencyIcon[f.urgency] ?? Zap;
              return (
                <Link key={f.id} href={`/zone/${f.relatedZone}`}>
                  <Card className="cursor-pointer border-border bg-card transition-all hover:border-primary hover:shadow-[0_0_20px_-8px_hsl(var(--primary))]">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-snug">{f.message}</p>
                        <ZoneChip zone={f.relatedZone} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Live signals */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-widest">Live signals</h2>
        </div>
        <div className="space-y-2">
          {signals.isLoading && <p className="text-sm text-muted-foreground">Reading the pulse...</p>}
          {signals.data?.length === 0 && (
            <Card className="border-dashed border-border bg-card">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Quiet on campus right now. Be the first to spark something.
              </CardContent>
            </Card>
          )}
          {signals.data?.map((s: Signal) => (
            <Card key={s.id} className="border-border bg-card transition-colors hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={intensityClass[s.intensity]}>
                    {s.intensity}
                  </Badge>
                  <span className="text-sm font-medium">{s.message}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ZoneChip zone={s.zone} />
                  <span>{s.timeAgo}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Insights */}
      {insights.data && (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Trending</h3>
              </div>
              <ul className="space-y-2">
                {insights.data.trendingActivities.map((t: TrendingActivity, i: number) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{t.label}</span>
                    <div className="flex items-center gap-2">
                      <ZoneChip zone={t.zone} />
                      <span className="font-bold text-primary">{t.count}</span>
                    </div>
                  </li>
                ))}
                {insights.data.trendingActivities.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nothing trending yet.</li>
                )}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Most active zones</h3>
              </div>
              <ul className="space-y-2">
                {insights.data.mostActiveZones.map((z: ZoneActivity) => (
                  <li key={z.zone}>
                    <Link href={`/zone/${z.zone}`}>
                      <div className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                        <span className="font-semibold capitalize">{z.zone}</span>
                        <span className="text-xs text-muted-foreground">
                          {z.activeUsers} active · {z.livingNow} now · {z.squads} squads
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
