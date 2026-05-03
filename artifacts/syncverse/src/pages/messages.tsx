import { Link } from "wouter";
import {
  useListThreadsForUser,
  getListThreadsForUserQueryKey,
  useGetMatchesForUser,
  getGetMatchesForUserQueryKey,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import {
  Edit,
  MessageCircle,
  Search,
  Camera,
  ChevronDown,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import {
  SV_INK,
  SV_HOT,
  SV_CYAN,
  SV_ACID,
  SV_GREEN,
  SV_GRID,
  ZONE_HUE,
  accentByIndex,
} from "@/lib/theme";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
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
    <div className="mx-auto w-full max-w-[600px]">
      {/* Header */}
      <header
        className="sticky top-0 z-20 -mx-4 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:-mx-8 md:px-8"
        style={{ borderColor: SV_GRID, backgroundColor: `${SV_INK}d9` }}
      >
        <div className="flex items-center gap-1.5">
          <h1 className="text-xl font-bold">messages</h1>
          <ChevronDown className="h-5 w-5 text-white" />
        </div>
        <button
          className="rounded-full p-1.5 transition-transform hover:scale-110"
          aria-label="new message"
        >
          <Edit className="h-6 w-6 text-white" />
        </button>
      </header>

      {/* Search bar */}
      <div className="my-4">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: SV_GRID }}
        >
          <Search className="h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Story rail of new matches (notes) */}
      {newMatches.length > 0 && (
        <div className="-mx-4 mb-4 overflow-x-auto md:-mx-0">
          <div className="flex gap-4 px-4 pb-2 md:px-0">
            {newMatches.slice(0, 12).map((m, i) => {
              const accent = accentByIndex(i);
              const zoneHue = ZONE_HUE[m.user.zone] ?? SV_CYAN;
              return (
                <Link
                  key={m.user.id}
                  href={`/messages/${m.user.id}`}
                  className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
                >
                  <div className="relative">
                    <div
                      className="rounded-full p-[2px] transition-transform group-hover:scale-105"
                      style={{
                        background: `conic-gradient(from 200deg, ${accent}, ${zoneHue}, ${SV_HOT}, ${accent})`,
                      }}
                    >
                      <div
                        className="rounded-full p-[2px]"
                        style={{ backgroundColor: SV_INK }}
                      >
                        <div className="overflow-hidden rounded-full">
                          <UserAvatar user={m.user} size="lg" />
                        </div>
                      </div>
                    </div>
                    <span
                      className="absolute -bottom-1 left-1/2 max-w-[80px] -translate-x-1/2 truncate rounded-full border px-2 py-0.5 text-[9px]"
                      style={{
                        borderColor: SV_INK,
                        backgroundColor: SV_INK,
                        color: SV_HOT,
                      }}
                    >
                      new
                    </span>
                  </div>
                  <div className="mt-1 w-full truncate text-center text-[11px]">
                    {m.user.name.split(" ")[0].toLowerCase()}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Section heading */}
      <div className="mb-2 mt-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-bold">Messages</h2>
        <button className="text-xs font-bold text-white/50 hover:text-white">
          Requests
        </button>
      </div>

      {threads.isLoading && (
        <div className="space-y-3 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-1 py-2"
            >
              <div
                className="h-14 w-14 animate-pulse rounded-full"
                style={{ backgroundColor: SV_GRID }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-3 w-1/3 animate-pulse rounded"
                  style={{ backgroundColor: SV_GRID }}
                />
                <div
                  className="h-3 w-2/3 animate-pulse rounded"
                  style={{ backgroundColor: SV_GRID }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {threads.data && threads.data.length === 0 && newMatches.length === 0 && (
        <div className="py-16 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2"
            style={{ borderColor: "white" }}
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-light">Your messages</h3>
          <p className="mt-1 text-sm text-white/60">
            Match with someone, then say hi.
          </p>
          <Link
            href="/matches"
            className="mt-4 inline-block rounded-lg px-4 py-1.5 text-sm font-bold"
            style={{ backgroundColor: SV_HOT, color: SV_INK }}
          >
            See matches
          </Link>
        </div>
      )}

      {/* Thread list */}
      <div className="-mx-1">
        {threads.data?.map((t) => {
          const isFromMe = t.lastMessage.fromUserId === userId;
          const hue = ZONE_HUE[t.otherUser.zone] ?? SV_CYAN;
          return (
            <Link
              key={t.otherUser.id}
              href={`/messages/${t.otherUser.id}`}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
            >
              <div
                className="rounded-full p-[2px]"
                style={{
                  background: t.unread
                    ? `conic-gradient(from 200deg, ${SV_HOT}, ${hue}, ${SV_CYAN}, ${SV_HOT})`
                    : "transparent",
                }}
              >
                <div
                  className="rounded-full p-[2px]"
                  style={{ backgroundColor: SV_INK }}
                >
                  <div className="overflow-hidden rounded-full">
                    <UserAvatar user={t.otherUser} size="lg" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`truncate text-sm ${t.unread ? "font-bold" : "font-normal"}`}
                  >
                    {t.otherUser.name.toLowerCase().replace(/\s+/g, ".")}
                  </span>
                  <span
                    className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full"
                    style={{ backgroundColor: SV_CYAN, color: SV_INK }}
                  >
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                      <path
                        d="M3 6l2 2 4-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`truncate ${t.unread ? "font-bold text-white" : "text-white/60"}`}
                  >
                    {isFromMe ? "You: " : ""}
                    {t.lastMessage.content}
                  </span>
                  <span className="shrink-0 text-white/40">·</span>
                  <span className="shrink-0 text-white/40">
                    {timeAgo(t.lastMessage.createdAt)}
                  </span>
                </div>
              </div>
              <button
                className="rounded-full p-1.5 text-white/60 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                aria-label="camera"
                onClick={(e) => e.preventDefault()}
              >
                <Camera className="h-5 w-5" />
              </button>
              {t.unread && (
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: SV_HOT }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
