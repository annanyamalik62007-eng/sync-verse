import { Link } from "wouter";
import {
  useListThreadsForUser,
  getListThreadsForUserQueryKey,
  useGetMatchesForUser,
  getGetMatchesForUserQueryKey,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Messages() {
  const userId = useCurrentUserId();
  const threads = useListThreadsForUser(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getListThreadsForUserQueryKey(userId ?? ""),
      refetchInterval: 6000,
    },
  });
  const matches = useGetMatchesForUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetMatchesForUserQueryKey(userId ?? "") },
  });

  const startedIds = new Set(threads.data?.map((t) => t.otherUser.id) ?? []);
  const newMatches = matches.data?.filter((m) => !startedIds.has(m.user.id)) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <MessageCircle className="h-3 w-3" /> Direct messages
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tighter md:text-5xl">Conversations</h1>
        <p className="mt-2 text-muted-foreground">
          Pick up where the sync left off. Messages stay private between you and the other student.
        </p>
      </div>

      {newMatches.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> Start a chat with a fresh match
            </div>
            <div className="flex flex-wrap gap-2">
              {newMatches.slice(0, 6).map((m) => (
                <Link
                  key={m.user.id}
                  href={`/messages/${m.user.id}`}
                  className="flex items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1.5 text-sm font-semibold transition-all hover:border-primary hover:bg-primary/10"
                >
                  <UserAvatar user={m.user} size="xs" />
                  {m.user.name.split(" ")[0]}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {threads.isLoading && <p className="text-sm text-muted-foreground">Loading conversations...</p>}

      {threads.data && threads.data.length === 0 && newMatches.length === 0 && (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="p-8 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No conversations yet. Find matches first, then say hi.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {threads.data?.map((t) => {
          const isFromMe = t.lastMessage.fromUserId === userId;
          return (
            <Link
              key={t.otherUser.id}
              href={`/messages/${t.otherUser.id}`}
              className="group block"
            >
              <Card
                className={`border-border bg-card transition-all hover:border-primary/50 ${
                  t.unread ? "border-primary/40 shadow-[0_0_20px_-10px_hsl(var(--primary))]" : ""
                }`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <UserAvatar user={t.otherUser} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold">{t.otherUser.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.otherUser.major} · {t.otherUser.college}
                      </span>
                      {t.unread && (
                        <Badge className="bg-primary text-primary-foreground text-[10px]">new</Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {isFromMe ? "You: " : ""}
                      {t.lastMessage.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground">{timeAgo(t.lastMessage.createdAt)}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
