import { Link } from "wouter";
import {
  useListThreadsForUser,
  getListThreadsForUserQueryKey,
  useGetMatchesForUser,
  getGetMatchesForUserQueryKey,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GRID, ZONE_HUE } from "@/lib/theme";

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
    <div className="space-y-8">
      <header className="border-b-2 pb-6" style={{ borderColor: SV_ACID }}>
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: SV_ACID }}
        >
          <MessageCircle className="h-3 w-3" /> / direct messages
        </div>
        <h1 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          <span className="sv-outline-text" style={{ color: SV_ACID }}>conversations</span>
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/50">
          // private threads · pick up where the sync left off
        </p>
      </header>

      {newMatches.length > 0 && (
        <section
          className="border-2 p-5"
          style={{ borderColor: SV_HOT, backgroundColor: SV_INK }}
        >
          <div
            className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_HOT }}
          >
            <Sparkles className="h-3 w-3" /> / fresh matches · say hi
          </div>
          <div className="flex flex-wrap gap-2">
            {newMatches.slice(0, 8).map((m) => (
              <Link
                key={m.user.id}
                href={`/messages/${m.user.id}`}
                className="group flex items-center gap-2 border-2 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-widest transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
                style={{
                  borderColor: SV_HOT,
                  color: "white",
                  boxShadow: `3px 3px 0 0 ${SV_HOT}`,
                }}
              >
                <UserAvatar user={m.user} size="xs" square />
                {m.user.name.split(" ")[0]}
              </Link>
            ))}
          </div>
        </section>
      )}

      {threads.isLoading && (
        <p className="font-mono text-xs uppercase tracking-widest text-white/50">
          // loading conversations...
        </p>
      )}

      {threads.data && threads.data.length === 0 && newMatches.length === 0 && (
        <div
          className="border-2 border-dashed p-10 text-center"
          style={{ borderColor: SV_GRID }}
        >
          <MessageCircle className="mx-auto h-8 w-8" style={{ color: SV_CYAN }} />
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/60">
            // no conversations yet. find matches first, then say hi.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {threads.data?.map((t) => {
          const isFromMe = t.lastMessage.fromUserId === userId;
          const hue = ZONE_HUE[t.otherUser.zone] ?? SV_CYAN;
          return (
            <Link
              key={t.otherUser.id}
              href={`/messages/${t.otherUser.id}`}
              className="group block"
            >
              <div
                className="flex items-center gap-4 border-2 p-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
                style={{
                  borderColor: t.unread ? hue : SV_GRID,
                  backgroundColor: SV_INK,
                  boxShadow: t.unread ? `4px 4px 0 0 ${hue}` : `4px 4px 0 0 ${SV_GRID}`,
                }}
              >
                <UserAvatar user={t.otherUser} size="lg" square />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-black">{t.otherUser.name}</span>
                    {t.unread && (
                      <span
                        className="px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest"
                        style={{ backgroundColor: hue, color: SV_INK }}
                      >
                        new
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-0.5 font-mono text-[9px] uppercase tracking-widest"
                    style={{ color: hue }}
                  >
                    / {t.otherUser.major}
                  </div>
                  <p className="mt-1.5 truncate text-xs text-white/70">
                    {isFromMe ? "you: " : ""}
                    {t.lastMessage.content}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
                    {timeAgo(t.lastMessage.createdAt)}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    style={{ color: hue }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
