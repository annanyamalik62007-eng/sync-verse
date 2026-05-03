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
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, ZONE_HUE } from "@/lib/theme";

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
  const sameMajorSameCollege = peers.filter(
    (p) => p.major === major && (!college || p.college === college),
  );
  const sameMajorOtherCollege = peers.filter(
    (p) => p.major === major && college && p.college !== college,
  );
  const otherMajorPeers = peers.filter((p) => p.major !== major);
  const orderedPeers = [
    ...sameMajorSameCollege,
    ...sameMajorOtherCollege,
    ...otherMajorPeers,
  ];
  const sameMajorTotal = sameMajorSameCollege.length + sameMajorOtherCollege.length;
  const collegesRepresented = new Set(
    [...sameMajorSameCollege, ...sameMajorOtherCollege]
      .map((p) => p.college)
      .filter(Boolean),
  );
  const peersSpanCampuses = collegesRepresented.size > 1;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${SV_CYAN}55`, color: SV_CYAN, backgroundColor: `${SV_CYAN}10` }}
        >
          <GraduationCap className="h-3 w-3" /> major hub
        </div>
        <h1 className="mt-4 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          <span className="sv-outline-text" style={{ color: SV_CYAN }}>{major ?? "your major"}</span>
        </h1>
        <p className="mt-3 text-sm text-white/60">
          {college
            ? peersSpanCampuses
              ? `everyone studying ${major} across ${collegesRepresented.size} campuses — what they're up to right now`
              : `everyone studying ${major} at ${college} — what they're up to right now`
            : "loading..."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          icon={Users}
          hue={SV_HOT}
          label="in your major"
          value={sameMajorTotal}
          sub={
            peersSpanCampuses
              ? `across ${collegesRepresented.size} campuses`
              : "peers on syncverse"
          }
        />
        <Stat
          icon={Activity}
          hue={SV_GREEN}
          label="living it now"
          value={livingNow.length}
          sub="in the moment"
        />
        <Stat
          icon={Building2}
          hue={SV_ACID}
          label={college ? `at ${college}` : "your campus"}
          value={sameMajorSameCollege.length}
          sub={
            sameMajorOtherCollege.length > 0
              ? `+ ${sameMajorOtherCollege.length} from other campuses`
              : "same major peers"
          }
        />
      </div>

      {hub.data?.topIntents && hub.data.topIntents.length > 0 && (
        <section
          className="rounded-2xl border p-5"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: `linear-gradient(135deg, ${SV_HOT}10 0%, transparent 60%), rgba(255,255,255,0.02)`,
          }}
        >
          <div
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_HOT }}
          >
            <TrendingUp className="h-3 w-3" /> what {major} students are working on
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hub.data.topIntents.map((t, i) => (
              <span
                key={i}
                className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"
                style={{ borderColor: `${SV_HOT}55`, color: SV_HOT, backgroundColor: `${SV_HOT}10` }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Users className="h-3.5 w-3.5" style={{ color: SV_CYAN }} />
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: SV_CYAN }}>
            your major peers — {sameMajorTotal} in {major}
            {otherMajorPeers.length > 0 && (
              <span className="text-white/40"> · +{otherMajorPeers.length} nearby</span>
            )}
          </h2>
        </div>
        {hub.isLoading && (
          <p className="text-sm text-white/50">loading peers...</p>
        )}
        {peers.length === 0 && !hub.isLoading && (
          <div
            className="rounded-2xl border border-dashed p-8 text-center text-sm text-white/50"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            you're the first {major} student here. invite your classmates.
          </div>
        )}
        <div className="space-y-3">
          {orderedPeers.map((p, idx) => {
            const hue = ZONE_HUE[p.zone] ?? SV_CYAN;
            const isCrossCampus = !!college && p.college !== college;
            const isOtherMajor = p.major !== major;
            const isFirstCrossCampus =
              !isOtherMajor && idx === sameMajorSameCollege.length && sameMajorOtherCollege.length > 0;
            const isFirstOtherMajor =
              isOtherMajor && idx === sameMajorSameCollege.length + sameMajorOtherCollege.length;
            return (
              <div key={p.id}>
                {isFirstCrossCampus && (
                  <div className="mb-3 mt-2 flex items-center gap-3 px-1">
                    <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40"
                    >
                      also studying {major} across the network
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                  </div>
                )}
                {isFirstOtherMajor && (
                  <div className="mb-3 mt-2 flex items-center gap-3 px-1">
                    <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40"
                    >
                      other people active near you right now
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                  </div>
                )}
                <Link
                  href={`/user/${p.id}`}
                  className="flex items-start gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.03]"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    className="rounded-full p-[2px]"
                    style={{
                      background: `conic-gradient(from 200deg, ${hue}, ${SV_HOT}, ${hue})`,
                    }}
                  >
                    <div className="rounded-full p-[2px]" style={{ backgroundColor: SV_INK }}>
                      <div className="overflow-hidden rounded-full">
                        <UserAvatar user={p} size="md" />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      {p.timeframe === "now" && (
                        <span
                          className="rounded-full px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest"
                          style={{ backgroundColor: SV_GREEN, color: SV_INK }}
                        >
                          live
                        </span>
                      )}
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: hue, backgroundColor: `${hue}15` }}
                      >
                        {p.zone}
                      </span>
                      {isCrossCampus && (
                        <span
                          className="rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                          style={{
                            borderColor: "rgba(255,255,255,0.15)",
                            color: "rgba(255,255,255,0.55)",
                          }}
                        >
                          {p.college}
                        </span>
                      )}
                      {isOtherMajor && (
                        <span
                          className="rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                          style={{
                            borderColor: `${SV_ACID}55`,
                            color: SV_ACID,
                            backgroundColor: `${SV_ACID}10`,
                          }}
                        >
                          {p.major}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm italic text-white/70">"{p.intent}"</p>
                  </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/messages/${p.id}`;
                  }}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: hue, color: SV_INK }}
                  aria-label={`Message ${p.name}`}
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </Link>
              </div>
            );
          })}
        </div>
      </section>

      {snapshot.data && snapshot.data.topMajors.length > 0 && (
        <section
          className="rounded-2xl border p-5"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: `linear-gradient(135deg, ${SV_ACID}10 0%, transparent 60%), rgba(255,255,255,0.02)`,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_ACID }}
          >
            most active majors at {college}
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
                    style={{ color: isYou ? SV_ACID : "white", fontWeight: isYou ? 700 : 400 }}
                  >
                    {m.major} {isYou && <span className="font-mono text-[9px] uppercase tracking-widest">· you</span>}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-2 w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isYou ? SV_ACID : SV_CYAN,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right font-mono text-xs tabular-nums text-white/60">
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
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: `linear-gradient(135deg, ${hue}15 0%, transparent 60%), rgba(255,255,255,0.02)`,
      }}
    >
      <div
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]"
        style={{ color: hue }}
      >
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div
        className="mt-2 text-4xl font-black italic leading-none tracking-tighter"
        style={{ color: hue }}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}
