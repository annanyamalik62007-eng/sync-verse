import { Link } from "wouter";
import { useGetMatchesForUser, getGetMatchesForUserQueryKey, type Match } from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Sparkles, MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

export default function Matches() {
  const userId = useCurrentUserId();
  const matches = useGetMatchesForUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetMatchesForUserQueryKey(userId ?? "") },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Flame className="h-3 w-3" /> Real-time match detection
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tighter md:text-5xl">Your matches</h1>
        <p className="mt-2 text-muted-foreground">
          People on your wavelength right now — ranked by alignment with your intent.
        </p>
      </div>

      {matches.isLoading && <p className="text-sm text-muted-foreground">Scanning campus signals...</p>}

      {matches.data?.length === 0 && (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No matches yet. The more specific your intent, the better we sync you.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {matches.data?.map((m: Match) => (
          <Card
            key={m.user.id}
            className="border-border bg-card transition-all hover:border-primary/50 hover:shadow-[0_0_25px_-10px_hsl(var(--primary))]"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <UserAvatar user={m.user} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{m.user.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {m.user.major} · {m.user.college}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/90">{m.user.intent}</p>
                  <p className="mt-2 text-xs text-primary">{m.reason}</p>
                  {m.sharedSignals.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.sharedSignals.map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-primary/30 bg-primary/5 text-[10px] text-primary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-black leading-none tracking-tighter text-primary">{m.alignmentScore}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">align</div>
                  </div>
                  <Link
                    href={`/messages/${m.user.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    <MessageCircle className="h-3 w-3" /> Message
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
