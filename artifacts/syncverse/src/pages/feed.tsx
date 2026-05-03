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
        className="cursor-pointer rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ borderColor: `${hue}55`, color: hue, backgroundColor: `${hue}10` }}
      >
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
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* What is SYNCVERSE — primer for new users */}
      <section
        className="relative overflow-hidden rounded-3xl border p-6 md:p-7"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: `linear-gradient(135deg, rgba(255,0,153,0.08), rgba(0,229,255,0.06))`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-1 inline-flex h-2 w-2 shrink-0 animate-pulse rounded-full"
            style={{ backgroundColor: "#FF0099", boxShadow: "0 0 12px #FF0099" }}
          />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              What is SYNCVERSE
            </p>
            <h2 className="mt-1 text-lg font-bold leading-snug md:text-xl">
              Anonymous campus signal — find the people on{" "}
              <span style={{ color: "#FF0099" }}>{user?.college ?? "your campus"}</span>{" "}
              building, studying, or hyped on what you're hyped on{" "}
              <span style={{ color: "#FFFF00" }}>right now</span>.
            </h2>
            <ul className="mt-3 grid gap-2 text-sm text-white/75 md:grid-cols-3">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-white/40" />
                <span>Post what you're on. We sync you with the rest.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-white/40" />
                <span>Anonymous by default. No DMs, no inbox games.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-white/40" />
                <span>Shared signals = matches, squads, events.</span>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/matches"
                className="rounded-full px-4 py-1.5 text-xs font-bold"
                style={{ backgroundColor: "#FF0099", color: "#0A0A0F" }}
              >
                See your matches
              </Link>
              <Link
                href="/events"
                className="rounded-full border px-4 py-1.5 text-xs font-bold"
                style={{ borderColor: "rgba(0,229,255,0.5)", color: "#00E5FF" }}
              >
                Browse events
              </Link>
              {userId && (
                <Link
                  href={`/user/${userId}`}
                  className="rounded-full border px-4 py-1.5 text-xs font-bold text-white/70"
                  style={{ borderColor: "rgba(255,255,255,0.18)" }}
                >
                  Edit profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hero — soft gradient orb */}
      <section
        className="relative overflow-hidden rounded-3xl border p-8 md:p-10"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: `radial-gradient(ellipse at top left, ${SV_HOT}22 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${SV_CYAN}1f 0%, transparent 50%), ${SV_INK}`,
        }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${SV_GREEN}55`, color: SV_GREEN, backgroundColor: `${SV_GREEN}10` }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: SV_GREEN, opacity: 0.6 }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SV_GREEN }} />
          </span>
          live · {college ?? "campus"}
        </div>
        <h1 className="mt-4 text-4xl font-black italic leading-[0.95] tracking-tighter md:text-6xl">
          <span style={{ color: SV_HOT }}>{totalActive}</span>{" "}
          {totalActive === 1 ? "soul is" : "souls are"}
          <br />
          <span className="sv-outline-text" style={{ color: SV_CYAN }}>active</span> right now
        </h1>
        <p className="mt-4 text-sm text-white/70">
          welcome back, {user?.name?.split(" ")[0] ?? "stranger"} — here's where the energy is.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/matches">
            <button
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: SV_HOT, color: SV_INK }}
            >
              <Flame className="h-4 w-4" /> see matches
            </button>
          </Link>
          <Link href="/squads">
            <button
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors hover:bg-white/5"
              style={{ borderColor: `${SV_CYAN}66`, color: SV_CYAN }}
            >
              <Users className="h-4 w-4" /> squads forming
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
                    className="group flex h-full cursor-pointer items-center gap-3 rounded-2xl border p-4 outline-none transition-all hover:-translate-y-0.5 hover:bg-white/[0.03]"
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${hue}22`, color: hue }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-snug">{f.message}</p>
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
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          {signals.isLoading && (
            <p className="p-5 font-mono text-xs uppercase tracking-widest text-white/50">
              reading the pulse...
            </p>
          )}
          {signals.data?.length === 0 && (
            <p className="p-5 font-mono text-xs uppercase tracking-widest text-white/50">
              quiet on campus right now. be the first to spark something.
            </p>
          )}
          {signals.data?.map((s: Signal) => {
            const hue = intensityHue[s.intensity] ?? SV_CYAN;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="flex-shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                    style={{ borderColor: `${hue}55`, color: hue, backgroundColor: `${hue}10` }}
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
          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: `linear-gradient(135deg, ${SV_ACID}10 0%, transparent 60%), rgba(255,255,255,0.02)`,
            }}
          >
            <SectionHeader hue={SV_ACID} tag="trending now" icon={TrendingUp} compact />
            <ul className="mt-3 space-y-2">
              {insights.data.trendingActivities.map((t: TrendingActivity, i: number) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{t.label}</span>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <ZoneChip zone={t.zone} />
                    <span className="font-mono text-xs font-black" style={{ color: SV_ACID }}>
                      {t.count}
                    </span>
                  </div>
                </li>
              ))}
              {insights.data.trendingActivities.length === 0 && (
                <li className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  nothing trending yet.
                </li>
              )}
            </ul>
          </div>
          <div
            className="rounded-2xl border p-5"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: `linear-gradient(135deg, ${SV_GREEN}10 0%, transparent 60%), rgba(255,255,255,0.02)`,
            }}
          >
            <SectionHeader hue={SV_GREEN} tag="most active zones" icon={Users} compact />
            <ul className="mt-3 space-y-1">
              {insights.data.mostActiveZones.map((z: ZoneActivity) => {
                const hue = ZONE_HUE[z.zone] ?? SV_CYAN;
                return (
                  <li key={z.zone}>
                    <Link href={`/zone/${z.zone}`}>
                      <div className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/5">
                        <span
                          className="font-mono text-xs font-black uppercase tracking-widest"
                          style={{ color: hue }}
                        >
                          {z.zone}
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
    <div className={compact ? "flex items-center gap-2" : "mb-3 flex items-center gap-2 px-1"}>
      <Icon className="h-3.5 w-3.5" style={{ color: hue }} />
      <h2
        className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]"
        style={{ color: hue }}
      >
        {tag}
      </h2>
    </div>
  );
}
