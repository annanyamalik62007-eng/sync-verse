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
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
      <div className="text-center text-muted-foreground">
        <p>Unknown zone.</p>
        <Link href="/feed" className="text-primary underline">Back to feed</Link>
      </div>
    );
  }

  return <ZoneInner zone={zone} college={college} />;
}

function ZoneInner({ zone, college }: { zone: CommunityZone; college?: string }) {
  const users = useListUsers({ zone, ...(college ? { college } : {}) });
  const activity = useGetZoneActivity();
  const z = activity.data?.find((a) => a.zone === zone);
  const TrendI = z ? trendIcon[z.trendDirection] : Minus;

  return (
    <div className="space-y-6">
      <Link href="/feed" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Live feed
      </Link>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Activity className="h-3 w-3 animate-pulse" /> Zone
        </div>
        <h1 className="mt-2 text-4xl font-black tracking-tighter md:text-6xl">{ZONE_LABELS[zone]}</h1>
        {z && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Active" value={z.activeUsers} />
            <Stat label="Living now" value={z.livingNow} />
            <Stat label="Squads" value={z.squads} />
            <Stat
              label="Trend"
              value={
                <span className="inline-flex items-center gap-1">
                  <TrendI className="h-5 w-5" />
                  <span className="capitalize">{z.trendDirection}</span>
                </span>
              }
            />
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          People in this zone {college ? `at ${college}` : ""}
        </h2>
        {users.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {users.data?.length === 0 && (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No one here yet. You could be the first signal.
            </CardContent>
          </Card>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {users.data?.map((u: User) => (
            <Card key={u.id} className="border-border bg-card">
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-background"
                  style={{ backgroundColor: u.avatarColor }}
                >
                  {u.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{u.name}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {u.timeframe} · {u.energyLevel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.major} · {u.college}
                  </p>
                  <p className="mt-1 text-sm">{u.intent}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="text-2xl font-black text-primary">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
