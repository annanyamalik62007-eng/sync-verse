import { Link } from "wouter";
import {
  useListLiveSignals,
  useGetCommunityInsights,
  useGetFomoTriggers,
  useGetUser,
  useListEvents,
  useGetMajorHub,
  getGetUserQueryKey,
  getListEventsQueryKey,
  getGetMajorHubQueryKey,
  type Signal,
  type FomoTrigger,
  type ZoneActivity,
  type TrendingActivity,
  type CommunityZone,
  type CampusEvent,
  type User,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Activity, Flame, TrendingUp, Users, Zap, Clock, ArrowRight, Edit3, Radio, Calendar, MapPin, GraduationCap } from "lucide-react";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID, ZONE_HUE } from "@/lib/theme";
import { UserAvatar } from "@/components/user-avatar";

function eventTimeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.round(diffMs / 3600000);
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (Math.abs(diffH) < 1) return "starting now";
  if (diffH > 0 && diffH < 6) return `in ${diffH}h · ${time}`;
  if (sameDay) return `today · ${time}`;
  if (isTomorrow) return `tomorrow · ${time}`;
  return d.toLocaleDateString([], { weekday: "short" }) + " · " + time;
}

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
  const events = useListEvents(
    { college, userId: userId ?? undefined },
    {
      query: {
        enabled: !!college,
        queryKey: getListEventsQueryKey({ college, userId: userId ?? undefined }),
      },
    },
  );
  const majorHub = useGetMajorHub(
    { major: user?.major ?? "", college },
    {
      query: {
        enabled: !!user?.major && !!college,
        queryKey: getGetMajorHubQueryKey({ major: user?.major ?? "", college }),
      },
    },
  );

  const totalActive = insights.data?.totalActiveNow ?? 0;
  const upcomingEvents = (events.data ?? [])
    .slice()
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .filter((e) => new Date(e.startsAt).getTime() > Date.now() - 60 * 60 * 1000)
    .slice(0, 4);
  const majorPeers = (majorHub.data?.peers ?? [])
    .filter((p) => p.id !== userId)
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* YOUR SIGNAL TODAY — replaces explainer for onboarded users */}
      {user && (
        <section
          className="relative overflow-hidden rounded-3xl border p-5 md:p-6"
          style={{
            borderColor: `${ZONE_HUE[user.zone] ?? SV_CYAN}55`,
            background: `linear-gradient(135deg, ${ZONE_HUE[user.zone] ?? SV_CYAN}15 0%, transparent 60%), rgba(255,255,255,0.02)`,
            boxShadow: `0 16px 50px -25px ${ZONE_HUE[user.zone] ?? SV_CYAN}88`,
          }}
        >
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div
                className="rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(from 200deg, ${ZONE_HUE[user.zone] ?? SV_CYAN}, ${SV_HOT}, ${ZONE_HUE[user.zone] ?? SV_CYAN})`,
                }}
              >
                <div className="rounded-full p-[2px]" style={{ backgroundColor: SV_INK }}>
                  <UserAvatar user={user} size="lg" />
                </div>
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full ring-2"
                style={{
                  ["--tw-ring-color" as string]: SV_INK,
                  backgroundColor: SV_GREEN,
                  boxShadow: `0 0 10px ${SV_GREEN}`,
                } as React.CSSProperties}
              >
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full"
                  style={{ backgroundColor: SV_GREEN, opacity: 0.55 }}
                />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Radio className="h-3 w-3" style={{ color: SV_GREEN }} />
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: SV_GREEN }}
                >
                  your signal today
                </p>
              </div>
              <p className="mt-2 text-base font-bold italic leading-snug md:text-lg">
                "{user.intent}"
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{
                    borderColor: `${ZONE_HUE[user.zone] ?? SV_CYAN}66`,
                    color: ZONE_HUE[user.zone] ?? SV_CYAN,
                    backgroundColor: `${ZONE_HUE[user.zone] ?? SV_CYAN}10`,
                  }}
                >
                  / {user.zone}
                </span>
                <span
                  className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ borderColor: `${SV_ACID}55`, color: SV_ACID, backgroundColor: `${SV_ACID}10` }}
                >
                  {user.timeframe}
                </span>
                <span
                  className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ borderColor: `${SV_HOT}55`, color: SV_HOT, backgroundColor: `${SV_HOT}10` }}
                >
                  {user.energyLevel} energy
                </span>
                {user.lookingFor && (
                  <span
                    className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                    style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                  >
                    seeking: {user.lookingFor}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/user/${user.id}`}
              className="shrink-0 rounded-full border p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
              aria-label="edit signal"
            >
              <Edit3 className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

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

      {/* HAPPENING ON CAMPUS — events */}
      {upcomingEvents.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <SectionHeader hue={SV_ACID} tag="happening on campus" icon={Calendar} compact />
            <Link
              href="/events"
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white/80"
            >
              all events →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {upcomingEvents.map((e: CampusEvent) => {
              const hue = ZONE_HUE[e.zone] ?? SV_ACID;
              const timeLbl = eventTimeLabel(e.startsAt);
              const isLive = timeLbl === "starting now";
              return (
                <Link key={e.id} href="/events">
                  <div
                    className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.04]"
                    style={{
                      borderColor: `${hue}33`,
                      background: `linear-gradient(135deg, ${hue}10 0%, transparent 70%), rgba(255,255,255,0.02)`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <ZoneChip zone={e.zone} />
                      <span
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: isLive ? SV_GREEN : hue }}
                      >
                        {isLive && (
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full"
                            style={{ backgroundColor: SV_GREEN }}
                          />
                        )}
                        {timeLbl}
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-base font-bold leading-snug">{e.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/60">{e.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                        <MapPin className="h-3 w-3" />
                        {e.location}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {e.attendees.slice(0, 3).map((a: User) => (
                            <UserAvatar
                              key={a.id}
                              user={a}
                              size="xs"
                              className="border"
                              ring={SV_INK}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                          {e.attendeeCount} in
                        </span>
                      </div>
                    </div>
                    {e.isAttending && (
                      <span
                        className="absolute right-3 top-3 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest"
                        style={{ backgroundColor: SV_GREEN, color: SV_INK }}
                      >
                        you in
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* IN YOUR MAJOR — peer activity */}
      {majorPeers.length > 0 && user && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <SectionHeader
              hue={SV_CYAN}
              tag={`${majorPeers.length}+ in ${user.major.toLowerCase()} right now`}
              icon={GraduationCap}
              compact
            />
            <Link
              href={`/major/${encodeURIComponent(user.major)}`}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white/80"
            >
              all peers →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {majorPeers.map((p) => {
              const hue = ZONE_HUE[p.zone] ?? SV_CYAN;
              return (
                <Link key={p.id} href={`/user/${p.id}`}>
                  <div
                    className="group flex h-full cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all hover:-translate-y-0.5 hover:bg-white/[0.04]"
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <UserAvatar user={p} size="md" ring={hue} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{p.name}</span>
                        <ZoneChip zone={p.zone} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs italic leading-snug text-white/70">
                        "{p.intent}"
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className="rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                          style={{
                            borderColor: `${SV_ACID}55`,
                            color: SV_ACID,
                          }}
                        >
                          {p.timeframe}
                        </span>
                        {p.lookingFor && (
                          <span
                            className="rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                            style={{
                              borderColor: "rgba(255,255,255,0.15)",
                              color: "rgba(255,255,255,0.6)",
                            }}
                          >
                            wants {p.lookingFor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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
