import { useState } from "react";
import { Link } from "wouter";
import {
  useGetMatchesForUser,
  getGetMatchesForUserQueryKey,
  type Match,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  Flame,
  Plus,
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

export default function Matches() {
  const userId = useCurrentUserId();
  const matches = useGetMatchesForUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetMatchesForUserQueryKey(userId ?? "") },
  });

  return (
    <div className="mx-auto w-full max-w-[560px] pb-16">
      {/* IG-style header */}
      <header
        className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6"
        style={{
          borderColor: SV_GRID,
          backgroundColor: `${SV_INK}d9`,
        }}
      >
        <div>
          <h1 className="text-2xl font-black italic leading-none tracking-tight">
            matches
          </h1>
          <div
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_HOT }}
          >
            <Flame className="mr-1 inline h-3 w-3" />
            ranked by alignment
          </div>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105"
          style={{ borderColor: SV_HOT, color: SV_HOT }}
          aria-label="add"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      {/* IG-style story rail (your matches as story rings) */}
      {matches.data && matches.data.length > 0 && (
        <div className="-mx-4 mb-6 overflow-x-auto md:-mx-6">
          <div className="flex gap-4 px-4 pb-2 md:px-6">
            {matches.data.slice(0, 12).map((m: Match, i: number) => {
              const accent = accentByIndex(i);
              const zoneHue = ZONE_HUE[m.user.zone] ?? SV_CYAN;
              return (
                <Link
                  key={`story-${m.user.id}`}
                  href={`/user/${m.user.id}`}
                  className="group flex w-16 shrink-0 flex-col items-center gap-1.5"
                >
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
                  <div className="w-full truncate text-center text-[11px] font-medium">
                    {m.user.name.split(" ")[0].toLowerCase()}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {matches.isLoading && (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] animate-pulse border-2"
              style={{ borderColor: SV_GRID, backgroundColor: "#11111A" }}
            />
          ))}
        </div>
      )}

      {matches.data?.length === 0 && (
        <div
          className="border-2 border-dashed p-10 text-center"
          style={{ borderColor: SV_GRID }}
        >
          <Sparkles className="mx-auto h-8 w-8" style={{ color: SV_CYAN }} />
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/60">
            // no matches yet. the more specific your intent, the better we sync you.
          </p>
        </div>
      )}

      {/* Feed of IG-style match posts */}
      <div className="space-y-8">
        {matches.data?.map((m: Match, i: number) => (
          <MatchCard key={m.user.id} match={m} index={i} />
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  const accent = accentByIndex(index);
  const zoneHue = ZONE_HUE[match.user.zone] ?? SV_CYAN;
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const baseLikes = 12 + ((match.alignmentScore * 3) % 87);
  const likeCount = baseLikes + (liked ? 1 : 0);

  return (
    <article
      className="overflow-hidden border"
      style={{ borderColor: SV_GRID, backgroundColor: SV_INK }}
    >
      {/* Card header — avatar, name, more */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <Link
          href={`/user/${match.user.id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <div
            className="rounded-full p-[2px]"
            style={{
              background: `conic-gradient(from 180deg, ${accent}, ${zoneHue}, ${SV_HOT}, ${accent})`,
            }}
          >
            <div
              className="rounded-full p-[2px]"
              style={{ backgroundColor: SV_INK }}
            >
              <div className="overflow-hidden rounded-full">
                <UserAvatar user={match.user} size="md" />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold tracking-tight">
                {match.user.name.toLowerCase().replace(/\s+/g, ".")}
              </span>
              <span
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full"
                style={{ backgroundColor: SV_CYAN, color: SV_INK }}
                title="verified campus member"
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
            <div
              className="truncate text-[11px]"
              style={{ color: zoneHue }}
            >
              {match.user.major} · {match.user.college}
            </div>
          </div>
        </Link>
        <button
          className="rounded-full p-1.5 text-white/60 transition-colors hover:text-white"
          aria-label="more"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* "Post" content — their intent rendered as a square post */}
      <Link
        href={`/messages/${match.user.id}`}
        className="relative block aspect-square w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${zoneHue} 100%)`,
        }}
      >
        {/* subtle grid for texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(${SV_INK}10 1px, transparent 1px), linear-gradient(90deg, ${SV_INK}10 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* alignment badge top-right */}
        <div
          className="absolute right-3 top-3 inline-flex items-center gap-1 border px-2 py-1 font-mono text-[10px] font-black uppercase tracking-widest"
          style={{
            borderColor: SV_INK,
            backgroundColor: SV_INK,
            color: accent,
          }}
        >
          <Sparkles className="h-3 w-3" />
          align {match.alignmentScore}
        </div>
        {/* zone tag top-left */}
        <div
          className="absolute left-3 top-3 inline-flex items-center px-2 py-1 font-mono text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: SV_INK, color: zoneHue }}
        >
          / {match.user.zone}
        </div>

        {/* big intent quote */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <p
            className="text-center text-2xl font-black italic leading-tight tracking-tight md:text-3xl"
            style={{ color: SV_INK }}
          >
            "{match.user.intent}"
          </p>
        </div>

        {/* shared signals strip across bottom */}
        {match.sharedSignals.length > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 px-4 py-3"
            style={{ backgroundColor: `${SV_INK}cc` }}
          >
            {match.sharedSignals.slice(0, 5).map((s: string, idx: number) => (
              <span
                key={idx}
                className="border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                style={{ borderColor: accent, color: accent }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* IG-style action row */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLiked((v) => !v)}
            className="rounded-full p-1.5 transition-transform active:scale-90"
            aria-label="like"
          >
            <Heart
              className="h-6 w-6 transition-colors"
              style={{
                color: liked ? SV_HOT : "#ffffff",
                fill: liked ? SV_HOT : "transparent",
              }}
            />
          </button>
          <Link
            href={`/messages/${match.user.id}`}
            className="rounded-full p-1.5 transition-transform active:scale-90"
            aria-label="message"
          >
            <MessageCircle className="h-6 w-6" />
          </Link>
          <button
            className="rounded-full p-1.5 transition-transform active:scale-90"
            aria-label="share"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
        <button
          onClick={() => setSaved((v) => !v)}
          className="rounded-full p-1.5 transition-transform active:scale-90"
          aria-label="save"
        >
          <Bookmark
            className="h-6 w-6 transition-colors"
            style={{
              color: saved ? SV_ACID : "#ffffff",
              fill: saved ? SV_ACID : "transparent",
            }}
          />
        </button>
      </div>

      {/* Likes + caption */}
      <div className="space-y-1 px-3 pb-3">
        <div className="text-sm font-bold">
          <span style={{ color: SV_HOT }}>{likeCount}</span>
          <span className="text-white/80"> on the same wavelength</span>
        </div>
        <div className="text-sm leading-snug">
          <Link
            href={`/user/${match.user.id}`}
            className="font-bold tracking-tight"
          >
            {match.user.name.toLowerCase().replace(/\s+/g, ".")}
          </Link>{" "}
          <span className="text-white/80">{match.reason}</span>
        </div>
        <Link
          href={`/messages/${match.user.id}`}
          className="block text-xs text-white/40 hover:text-white/70"
        >
          view all signals
        </Link>
        <div
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30"
          style={{ letterSpacing: "0.25em" }}
        >
          {timeAgo(index)} · anonymous until you say hi
        </div>
      </div>

      {/* CTA strip */}
      <Link
        href={`/messages/${match.user.id}`}
        className="flex items-center justify-between border-t px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.25em] transition-colors hover:bg-white/5"
        style={{ borderColor: SV_GRID, color: accent }}
      >
        <span>say hi to {match.user.name.split(" ")[0].toLowerCase()}</span>
        <span style={{ color: SV_GREEN }}>→</span>
      </Link>
    </article>
  );
}

function timeAgo(seed: number): string {
  const minutes = [4, 9, 17, 28, 42, 58];
  const hours = [2, 4, 7];
  if (seed < minutes.length) return `${minutes[seed]}m ago`;
  return `${hours[(seed - minutes.length) % hours.length]}h ago`;
}
