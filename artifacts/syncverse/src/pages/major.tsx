import { Link } from "wouter";
import {
  useGetUser,
  getGetUserQueryKey,
  useGetMajorHub,
  getGetMajorHubQueryKey,
  useGetCollegeSnapshot,
  getGetCollegeSnapshotQueryKey,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import {
  GraduationCap,
  Users,
  Activity,
  MessageCircle,
  TrendingUp,
  Building2,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID, ZONE_HUE } from "@/lib/theme";

export default function Major() {
  const userId = useCurrentUserId();
  const me = useGetUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId ?? "") },
  });
  const major = me.data?.major;
  const college = me.data?.college;

  const hub = useGetMajorHub(
    { major: major ?? "", college },
    {
      query: {
        enabled: !!major,
        queryKey: getGetMajorHubQueryKey({ major: major ?? "", college }),
      },
    },
  );

  const snapshot = useGetCollegeSnapshot(college ?? "", {
    query: {
      enabled: !!college,
      queryKey: getGetCollegeSnapshotQueryKey(college ?? ""),
    },
  });

  const peers = (hub.data?.peers ?? []).filter((p) => p.id !== userId);
  const livingNow = peers.filter((p) => p.timeframe === "now");

  return (
    <div className="space-y-8">
      <header className="border-b-2 pb-6" style={{ borderColor: SV_CYAN }}>
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: SV_CYAN }}
        >
          <GraduationCap className="h-3 w-3" /> / major hub
        </div>
        <h1 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          <span className="sv-outline-text" style={{ color: SV_CYAN }}>{major ?? "your major"}</span>
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/50">
          // {college ? `everyone studying ${major} at ${college} — what they're up to right now` : "loading..."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Users} hue={SV_HOT} label="same major" value={peers.length} sub="peers on syncverse" />
        <Stat icon={Activity} hue={SV_GREEN} label="active now" value={livingNow.length} sub="in the moment" />
        <Stat icon={Building2} hue={SV_ACID} label="campus total" value={snapshot.data?.totalActive ?? "—"} sub={`students at ${college ?? "—"}`} />
      </div>

      {hub.data?.topIntents && hub.data.topIntents.length > 0 && (
        <section
          className="border-2 p-5"
          style={{ borderColor: SV_HOT, backgroundColor: SV_INK }}
        >
          <div
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_HOT }}
          >
            <TrendingUp className="h-3 w-3" /> / what {major} students are working on
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hub.data.topIntents.map((t, i) => (
              <span
                key={i}
                className="border px-2 py-1 font-mono text-[10px] uppercase tracking-widest"
                style={{ borderColor: SV_HOT, color: SV_HOT }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-3.5 w-3.5" style={{ color: SV_CYAN }} />
          <h2
            className="font-mono text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: SV_CYAN }}
          >
            / your major peers
          </h2>
        </div>
        {hub.isLoading && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">
            // loading peers...
          </p>
        )}
        {peers.length === 0 && !hub.isLoading && (
          <div
            className="border-2 border-dashed p-8 text-center font-mono text-xs uppercase tracking-widest text-white/50"
            style={{ borderColor: SV_GRID }}
          >
            // you're the first {major} student here. invite your classmates.
          </div>
        )}
        <div className="space-y-3">
          {peers.map((p) => {
            const hue = ZONE_HUE[p.zone] ?? SV_CYAN;
            return (
              <div
                key={p.id}
                className="flex items-start gap-4 border-2 p-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
                style={{
                  borderColor: SV_GRID,
                  backgroundColor: SV_INK,
                  boxShadow: `3px 3px 0 0 ${SV_GRID}`,
                }}
              >
                <UserAvatar user={p} size="md" square />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black">{p.name}</span>
                    {p.timeframe === "now" && (
                      <span
                        className="px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest"
                        style={{ backgroundColor: SV_GREEN, color: SV_INK }}
                      >
                        live
                      </span>
                    )}
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: hue }}
                    >
                      / {p.zone}
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-white/70">"{p.intent}"</p>
                </div>
                <Link
                  href={`/messages/${p.id}`}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  style={{
                    backgroundColor: hue,
                    borderColor: hue,
                    color: SV_INK,
                    boxShadow: `2px 2px 0 0 ${SV_INK}`,
                  }}
                  aria-label={`Message ${p.name}`}
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {snapshot.data && snapshot.data.topMajors.length > 0 && (
        <section
          className="border-2 p-5"
          style={{ borderColor: SV_ACID, backgroundColor: SV_INK }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_ACID }}
          >
            / most active majors at {college}
          </div>
          <div className="mt-4 space-y-2">
            {snapshot.data.topMajors.map((m) => {
              const max = snapshot.data!.topMajors[0]?.count ?? 1;
              const pct = Math.round((m.count / max) * 100);
              const isYou = m.major === major;
              return (
                <div key={m.major} className="flex items-center gap-3">
                  <span
                    className="w-44 truncate text-sm"
                    style={{ color: isYou ? SV_ACID : "white", fontWeight: isYou ? 900 : 400 }}
                  >
                    {m.major} {isYou && <span className="font-mono text-[9px] uppercase tracking-widest">· you</span>}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-2 w-full overflow-hidden border"
                      style={{ borderColor: SV_GRID }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isYou ? SV_ACID : SV_CYAN,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="w-8 text-right font-mono text-xs tabular-nums text-white/60"
                  >
                    {m.count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  hue,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  hue: string;
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div
      className="border-2 p-4"
      style={{ borderColor: hue, backgroundColor: SV_INK, boxShadow: `4px 4px 0 0 ${SV_GRID}` }}
    >
      <div
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: hue }}
      >
        <Icon className="h-3 w-3" /> / {label}
      </div>
      <div
        className="mt-2 text-4xl font-black italic leading-none tracking-tighter"
        style={{ color: hue }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/50">{sub}</div>
    </div>
  );
}
