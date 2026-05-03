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
import { Activity, Flame, TrendingUp, Users, Zap, Clock, ArrowRight } from "lucide-react";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID, ZONE_HUE } from "@/lib/theme";

const intensityHue: Record<string, string> = {
  high: SV_HOT,
  medium: SV_ACID,
  low: SV_CYAN,
};

const urgencyIcon: Record<string, typeof Flame> = {
  high: Flame,
  medium: Zap,
  subtle: Clock,
};

function ZoneChip({ zone }: { zone: CommunityZone }) {
  const hue = ZONE_HUE[zone] ?? SV_CYAN;
  return (
    <Link href={`/zone/${zone}`}>
      <span
        className="cursor-pointer border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em]"
        style={{ borderColor: hue, color: hue }}
      >
        / {zone}
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
      <section
        className="relative overflow-hidden border-2 p-6 md:p-10"
        style={{ borderColor: SV_HOT, boxShadow: `8px 8px 0 0 ${SV_GRID}` }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: SV_ACID }}
        >
          / live signal feed · {college ?? "campus"}
        </div>
        <h1 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          <span style={{ color: SV_HOT }}>{totalActive}</span>{" "}
          {totalActive === 1 ? "soul is" : "souls are"}
          <br />
          <span className="sv-outline-text" style={{ color: SV_CYAN }}>active</span> right now
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/60">
          // welcome back, {user?.name?.split(" ")[0] ?? "stranger"} — here's where the energy is.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/matches">
            <button
              className="inline-flex items-center gap-2 border-2 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                backgroundColor: SV_HOT,
                borderColor: SV_HOT,
                color: SV_INK,
                boxShadow: `4px 4px 0 0 ${SV_INK}`,
              }}
            >
              <Flame className="h-3.5 w-3.5" /> see matches
            </button>
          </Link>
          <Link href="/squads">
            <button
              className="inline-flex items-center gap-2 border-2 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                borderColor: SV_CYAN,
                color: SV_CYAN,
                boxShadow: `4px 4px 0 0 ${SV_CYAN}`,
              }}
            >
              <Users className="h-3.5 w-3.5" /> squads forming
            </button>
          </Link>
        </div>
      </section>

      {/* FOMO triggers */}
      {(fomos.data?.length ?? 0) > 0 && (
        <section>
          <SectionHeader hue={SV_HOT} tag="don't miss this" icon={Flame} />
          <div className="grid gap-3 md:grid-cols-2">
            {fomos.data!.map((f: FomoTrigger) => {
              const Icon = urgencyIcon[f.urgency] ?? Zap;
              const hue = ZONE_HUE[f.relatedZone] ?? SV_HOT;
              return (
                <Link key={f.id} href={`/zone/${f.relatedZone}`}>
                  <div
                    tabIndex={0}
                    className="group flex h-full cursor-pointer items-center gap-3 border-2 p-4 transition-all outline-none hover:translate-x-[-2px] hover:translate-y-[-2px] hover:[border-color:var(--sv-hue)] hover:shadow-[4px_4px_0_0_var(--sv-hue)] focus-visible:translate-x-[-2px] focus-visible:translate-y-[-2px] focus-visible:[border-color:var(--sv-hue)] focus-visible:shadow-[4px_4px_0_0_var(--sv-hue)]"
                    style={
                      {
                        borderColor: SV_GRID,
                        backgroundColor: SV_INK,
                        ["--sv-hue" as string]: hue,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      style={{ backgroundColor: hue, color: SV_INK }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold leading-snug">{f.message}</p>
                      <div className="mt-1.5">
                        <ZoneChip zone={f.relatedZone} />
                      </div>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: hue }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Live signals */}
      <section>
        <SectionHeader hue={SV_CYAN} tag="live signals" icon={Activity} />
        <div
          className="border-y-2"
          style={{ borderColor: SV_CYAN }}
        >
          {signals.isLoading && (
            <p className="p-5 font-mono text-xs uppercase tracking-widest text-white/50">
              // reading the pulse...
            </p>
          )}
          {signals.data?.length === 0 && (
            <p className="p-5 font-mono text-xs uppercase tracking-widest text-white/50">
              // quiet on campus right now. be the first to spark something.
            </p>
          )}
          {signals.data?.map((s: Signal, i: number) => {
            const hue = intensityHue[s.intensity] ?? SV_CYAN;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 border-b py-3 px-4 last:border-b-0"
                style={{ borderColor: SV_GRID }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="flex-shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                    style={{ borderColor: hue, color: hue }}
                  >
                    {s.intensity}
                  </span>
                  <span className="truncate text-sm">{s.message}</span>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <ZoneChip zone={s.zone} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {s.timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Insights */}
      {insights.data && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="border-2 p-5" style={{ borderColor: SV_ACID, backgroundColor: SV_INK }}>
            <SectionHeader hue={SV_ACID} tag="trending now" icon={TrendingUp} compact />
            <ul className="mt-3 space-y-2">
              {insights.data.trendingActivities.map((t: TrendingActivity, i: number) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{t.label}</span>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <ZoneChip zone={t.zone} />
                    <span
                      className="font-mono text-xs font-black"
                      style={{ color: SV_ACID }}
                    >
                      {t.count}
                    </span>
                  </div>
                </li>
              ))}
              {insights.data.trendingActivities.length === 0 && (
                <li className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  // nothing trending yet.
                </li>
              )}
            </ul>
          </div>
          <div className="border-2 p-5" style={{ borderColor: SV_GREEN, backgroundColor: SV_INK }}>
            <SectionHeader hue={SV_GREEN} tag="most active zones" icon={Users} compact />
            <ul className="mt-3 space-y-1">
              {insights.data.mostActiveZones.map((z: ZoneActivity) => {
                const hue = ZONE_HUE[z.zone] ?? SV_CYAN;
                return (
                  <li key={z.zone}>
                    <Link href={`/zone/${z.zone}`}>
                      <div className="flex cursor-pointer items-center justify-between gap-3 border border-transparent px-2 py-1.5 text-sm hover:border-white/10">
                        <span
                          className="font-mono text-xs font-black uppercase tracking-widest"
                          style={{ color: hue }}
                        >
                          / {z.zone}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                          {z.activeUsers} active · {z.livingNow} now · {z.squads} sq
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  hue,
  tag,
  icon: Icon,
  compact = false,
}: {
  hue: string;
  tag: string;
  icon: typeof Flame;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex items-center gap-2" : "mb-4 flex items-center gap-2"}>
      <Icon className="h-3.5 w-3.5" style={{ color: hue }} />
      <h2
        className="font-mono text-xs font-black uppercase tracking-[0.3em]"
        style={{ color: hue }}
      >
        / {tag}
      </h2>
    </div>
  );
}
