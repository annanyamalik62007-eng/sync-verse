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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Activity,
  MessageCircle,
  TrendingUp,
  Building2,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <GraduationCap className="h-3 w-3" /> Major hub
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tighter md:text-5xl">
          {major ?? "Your major"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {college ? `Everyone studying ${major} at ${college} — and what they're up to right now.` : "Loading..."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Users className="h-3 w-3" /> Same major
            </div>
            <div className="mt-2 text-3xl font-black tracking-tighter text-primary">
              {peers.length}
            </div>
            <div className="text-xs text-muted-foreground">peers on SYNCVERSE</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Activity className="h-3 w-3" /> Active now
            </div>
            <div className="mt-2 text-3xl font-black tracking-tighter text-primary">
              {livingNow.length}
            </div>
            <div className="text-xs text-muted-foreground">in the moment</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Building2 className="h-3 w-3" /> Campus total
            </div>
            <div className="mt-2 text-3xl font-black tracking-tighter text-primary">
              {snapshot.data?.totalActive ?? "-"}
            </div>
            <div className="text-xs text-muted-foreground">students at {college}</div>
          </CardContent>
        </Card>
      </div>

      {hub.data?.topIntents && hub.data.topIntents.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> What {major} students are working on
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {hub.data.topIntents.map((t, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-xs text-primary"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-xl font-bold">Your major peers</h2>
        {hub.isLoading && <p className="text-sm text-muted-foreground">Loading peers...</p>}
        {peers.length === 0 && !hub.isLoading && (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You're the first {major} student here. Invite your classmates.
              </p>
            </CardContent>
          </Card>
        )}
        <div className="space-y-3">
          {peers.map((p) => (
            <Card key={p.id} className="border-border bg-card hover:border-primary/40">
              <CardContent className="flex items-start gap-4 p-4">
                <UserAvatar user={p} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{p.name}</span>
                    {p.timeframe === "now" && (
                      <Badge className="bg-primary/15 text-[10px] text-primary">live now</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {p.zone}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{p.intent}</p>
                </div>
                <Link
                  href={`/messages/${p.id}`}
                  className="flex-shrink-0 rounded-full border border-primary/30 bg-primary/5 p-2 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  aria-label={`Message ${p.name}`}
                >
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {snapshot.data && snapshot.data.topMajors.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Most active majors at {college}
            </div>
            <div className="mt-3 space-y-2">
              {snapshot.data.topMajors.map((m) => {
                const max = snapshot.data!.topMajors[0]?.count ?? 1;
                const pct = Math.round((m.count / max) * 100);
                const isYou = m.major === major;
                return (
                  <div key={m.major} className="flex items-center gap-3">
                    <span className={`w-44 truncate text-sm ${isYou ? "font-bold text-primary" : ""}`}>
                      {m.major} {isYou && <span className="text-[10px]">· you</span>}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-sm tabular-nums text-muted-foreground">
                      {m.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
