import { Link, useRoute } from "wouter";
import {
  useListUsers,
  useGetZoneActivity,
  useGetUser,
  getGetUserQueryKey,
  type User,
  type CommunityZone,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Activity, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_GRID, ZONE_HUE, SV_CYAN } from "@/lib/theme";

const ZONE_LABELS: Record<CommunityZone, string> = {
  career: "Career",
  startup: "Startup",
  study: "Study",
  social: "Social",
  creative: "Creative",
  fitness: "Fitness",
  research: "Research",
};

const isZone = (s: string): s is CommunityZone => s in ZONE_LABELS;

const trendIcon: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  steady: Minus,
};

export default function Zone() {
  const [, params] = useRoute("/zone/:zone");
  const zone = params?.zone;
  const userId = useCurrentUserId();
  const { data: me } = useGetUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId ?? "") },
  });
  const college = me?.college;

  if (!zone || !isZone(zone)) {
    return (
      <div className="text-center font-mono text-xs uppercase tracking-widest text-white/50">
        // unknown zone.
        <Link href="/feed" style={{ color: SV_CYAN }} className="ml-2 underline">
          back to feed
        </Link>
      </div>
    );
  }

  return <ZoneInner zone={zone} college={college} />;
}

function ZoneInner({ zone, college }: { zone: CommunityZone; college?: string }) {
  const hue = ZONE_HUE[zone] ?? SV_CYAN;
  const users = useListUsers({ zone, ...(college ? { college } : {}) });
  const activity = useGetZoneActivity();
  const z = activity.data?.find((a) => a.zone === zone);
  const TrendI = z ? trendIcon[z.trendDirection] : Minus;

  return (
    <div className="space-y-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> / live feed
      </Link>

      <section
        className="border-2 p-6 md:p-10"
        style={{ borderColor: hue, boxShadow: `8px 8px 0 0 ${SV_GRID}` }}
      >
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: hue }}
        >
          <Activity className="h-3 w-3 animate-pulse" /> / zone
        </div>
        <h1 className="mt-3 text-5xl font-black italic leading-none tracking-tighter md:text-7xl">
          <span className="sv-outline-text" style={{ color: hue }}>
            {ZONE_LABELS[zone]}
          </span>
        </h1>
        {z && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat hue={hue} label="active" value={z.activeUsers} />
            <Stat hue={hue} label="living now" value={z.livingNow} />
            <Stat hue={hue} label="squads" value={z.squads} />
            <Stat
              hue={hue}
              label="trend"
              value={
                <span className="inline-flex items-center gap-1">
                  <TrendI className="h-5 w-5" />
                  <span className="capitalize">{z.trendDirection}</span>
                </span>
              }
            />
          </div>
        )}
      </section>

      <section>
        <h2
          className="mb-4 font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: hue }}
        >
          / people in this zone {college ? `at ${college}` : ""}
        </h2>
        {users.isLoading && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">
            // loading...
          </p>
        )}
        {users.data?.length === 0 && (
          <div
            className="border-2 border-dashed p-8 text-center font-mono text-xs uppercase tracking-widest text-white/50"
            style={{ borderColor: SV_GRID }}
          >
            // no one here yet. you could be the first signal.
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {users.data?.map((u: User) => (
            <div
              key={u.id}
              className="flex items-start gap-3 border-2 p-4"
              style={{
                borderColor: SV_GRID,
                backgroundColor: SV_INK,
                boxShadow: `3px 3px 0 0 ${SV_GRID}`,
              }}
            >
              <UserAvatar user={u} size="md" square />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black">{u.name}</h3>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: hue }}
                  >
                    {u.timeframe} · {u.energyLevel}
                  </span>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  {u.major} · {u.college}
                </p>
                <p className="mt-1.5 text-sm italic text-white/80">"{u.intent}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ hue, label, value }: { hue: string; label: string; value: React.ReactNode }) {
  return (
    <div className="border-2 p-3" style={{ borderColor: SV_GRID }}>
      <div
        className="text-3xl font-black italic leading-none tracking-tighter"
        style={{ color: hue }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em]"
        style={{ color: hue }}
      >
        / {label}
      </div>
    </div>
  );
}
