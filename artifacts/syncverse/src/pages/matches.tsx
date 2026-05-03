import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMatchesForUser,
  getGetMatchesForUserQueryKey,
  useGenerateIcebreaker,
  useSendMessage,
  getListThreadsForUserQueryKey,
  getListMessagesBetweenQueryKey,
  type Match,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import {
  Sparkles,
  Flame,
  X,
  Check,
  RotateCcw,
  Send,
  Loader2,
  Edit3,
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

type Action = "connect" | "pass";

export default function Matches() {
  const userId = useCurrentUserId();
  const matches = useGetMatchesForUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetMatchesForUserQueryKey(userId ?? "") },
  });

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<Action[]>([]);
  const [icebreakerFor, setIcebreakerFor] = useState<Match | null>(null);

  const list = matches.data ?? [];
  const remaining = list.slice(index);
  const visible = remaining.slice(0, 3);

  const advance = (action: Action) => {
    setHistory((h) => [...h, action]);
    setIndex((i) => i + 1);
  };

  const undo = () => {
    if (index === 0) return;
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => i - 1);
  };

  const handleConnect = (m: Match) => {
    setIcebreakerFor(m);
    advance("connect");
  };

  return (
    <div className="mx-auto w-full max-w-[560px] pb-20">
      {/* header */}
      <header
        className="sticky top-0 z-20 -mx-4 mb-5 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6"
        style={{ borderColor: SV_GRID, backgroundColor: `${SV_INK}d9` }}
      >
        <div>
          <h1 className="text-2xl font-black italic leading-none tracking-tight">matches</h1>
          <div
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: SV_HOT }}
          >
            <Flame className="mr-1 inline h-3 w-3" />
            stack ranked by alignment
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          {Math.min(index + 1, list.length || 1)} / {list.length}
        </div>
      </header>

      {matches.isLoading && (
        <div
          className="mx-auto h-[560px] w-full animate-pulse border-2"
          style={{ borderColor: SV_GRID, backgroundColor: "#11111A" }}
        />
      )}

      {/* empty state */}
      {!matches.isLoading && list.length === 0 && (
        <EmptyDeck headline="no matches yet" sub="be more specific in your intent — vague signals = quiet inbox." />
      )}

      {/* end of deck */}
      {!matches.isLoading && list.length > 0 && index >= list.length && (
        <EmptyDeck
          headline="that's everyone."
          sub="check back as new students drop their signal — or refine your intent to surface different cohorts."
          action={
            <button
              onClick={() => {
                setIndex(0);
                setHistory([]);
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
              style={{ backgroundColor: SV_HOT, color: SV_INK }}
            >
              <RotateCcw className="h-4 w-4" /> restart deck
            </button>
          }
        />
      )}

      {/* CARD STACK */}
      {visible.length > 0 && (
        <div className="relative mx-auto h-[560px] w-full">
          {visible
            .slice()
            .reverse()
            .map((m, revIdx) => {
              const stackPos = visible.length - 1 - revIdx; // 0 = top
              return (
                <SwipeCard
                  key={m.user.id}
                  match={m}
                  stackPos={stackPos}
                  isTop={stackPos === 0}
                  onConnect={() => handleConnect(m)}
                  onPass={() => advance("pass")}
                />
              );
            })}
        </div>
      )}

      {/* ACTION BAR */}
      {visible.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-5">
          <ActionButton
            label="pass"
            onClick={() => advance("pass")}
            color="#ffffff"
            border={SV_GRID}
            bg="transparent"
          >
            <X className="h-7 w-7" />
          </ActionButton>
          <ActionButton
            label="undo"
            onClick={undo}
            disabled={index === 0}
            color={SV_ACID}
            border={`${SV_ACID}55`}
            bg="transparent"
            small
          >
            <RotateCcw className="h-5 w-5" />
          </ActionButton>
          <ActionButton
            label="connect"
            onClick={() => visible[0] && handleConnect(visible[0])}
            color={SV_INK}
            border={SV_GREEN}
            bg={SV_GREEN}
          >
            <Check className="h-7 w-7" />
          </ActionButton>
        </div>
      )}

      {/* counters */}
      {history.length > 0 && (
        <div className="mt-5 flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.25em]">
          <span style={{ color: SV_GREEN }}>
            {history.filter((h) => h === "connect").length} connected
          </span>
          <span className="text-white/30">·</span>
          <span className="text-white/40">
            {history.filter((h) => h === "pass").length} passed
          </span>
        </div>
      )}

      {/* AI ICEBREAKER MODAL */}
      {icebreakerFor && userId && (
        <IcebreakerModal
          meId={userId}
          match={icebreakerFor}
          onClose={() => setIcebreakerFor(null)}
        />
      )}
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  color,
  border,
  bg,
  disabled = false,
  small = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  border: string;
  bg: string;
  disabled?: boolean;
  small?: boolean;
}) {
  const size = small ? "h-12 w-12" : "h-16 w-16";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex ${size} items-center justify-center rounded-full border-2 transition-transform active:scale-90 hover:scale-105 disabled:opacity-30`}
      style={{ borderColor: border, color, backgroundColor: bg }}
    >
      {children}
    </button>
  );
}

function SwipeCard({
  match,
  stackPos,
  isTop,
  onConnect,
  onPass,
}: {
  match: Match;
  stackPos: number;
  isTop: boolean;
  onConnect: () => void;
  onPass: () => void;
}) {
  const accent = useMemo(
    () => accentByIndex(match.user.name.length),
    [match.user.name],
  );
  const zoneHue = ZONE_HUE[match.user.zone] ?? SV_CYAN;

  // Stack visuals: each deeper card scales down + offsets
  const scale = 1 - stackPos * 0.04;
  const translateY = stackPos * 12;
  const opacity = stackPos === 2 ? 0.55 : stackPos === 1 ? 0.85 : 1;
  const rotate = stackPos === 0 ? 0 : (stackPos % 2 === 0 ? -1 : 1) * 1.5;

  // Drag state for top card
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setStart({ x: e.clientX, y: e.clientY });
    setDrag({ x: 0, y: 0 });
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTop || !start) return;
    setDrag({ x: e.clientX - start.x, y: e.clientY - start.y });
  };
  const onPointerUp = () => {
    if (!isTop || !drag) return;
    const threshold = 110;
    if (drag.x > threshold) onConnect();
    else if (drag.x < -threshold) onPass();
    setDrag(null);
    setStart(null);
  };

  const dragX = drag?.x ?? 0;
  const dragRot = dragX / 18;
  const decisionTint =
    dragX > 40 ? SV_GREEN : dragX < -40 ? SV_HOT : null;

  const transform = isTop
    ? `translate(${dragX}px, ${(drag?.y ?? 0) * 0.4}px) rotate(${dragRot}deg)`
    : `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`absolute inset-0 select-none overflow-hidden border-2 ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{
        borderColor: SV_GRID,
        backgroundColor: SV_INK,
        transform,
        transition: drag ? "none" : "transform 240ms cubic-bezier(0.2,0.8,0.2,1)",
        opacity,
        zIndex: 10 - stackPos,
        boxShadow: isTop
          ? `0 24px 60px -20px ${accent}55, 0 0 0 1px ${accent}22`
          : "none",
      }}
    >
      {/* Photo / gradient hero */}
      <div
        className="relative h-[62%] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${zoneHue} 100%)`,
        }}
      >
        {match.user.avatarUrl ? (
          <img
            src={match.user.avatarUrl}
            alt={match.user.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(${SV_INK}10 1px, transparent 1px), linear-gradient(90deg, ${SV_INK}10 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        )}

        {/* DARK OVERLAY at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${SV_INK}ee 90%)`,
          }}
        />

        {/* alignment % chip */}
        <div
          className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full border-2 font-mono text-sm font-black"
          style={{
            borderColor: accent,
            color: accent,
            backgroundColor: `${SV_INK}cc`,
            boxShadow: `0 0 20px ${accent}88`,
          }}
        >
          {match.alignmentScore}
        </div>

        {/* zone chip */}
        <div
          className="absolute left-4 top-4 inline-flex items-center px-2 py-1 font-mono text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: SV_INK, color: zoneHue }}
        >
          / {match.user.zone}
        </div>

        {/* swipe decision overlay */}
        {decisionTint && (
          <div
            className="absolute left-6 top-6 rotate-[-12deg] border-4 px-4 py-2 font-mono text-2xl font-black uppercase tracking-widest"
            style={{
              borderColor: decisionTint,
              color: decisionTint,
              opacity: Math.min(1, Math.abs(dragX) / 140),
            }}
          >
            {dragX > 0 ? "connect" : "pass"}
          </div>
        )}

        {/* name + meta */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
            {match.user.major} · {match.user.college}
          </div>
          <h2 className="mt-1 text-3xl font-black italic leading-tight tracking-tight">
            {match.user.name}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[38%] flex-col justify-between px-5 py-4">
        <p
          className="line-clamp-3 text-base font-bold italic leading-snug"
          style={{ color: "#fff" }}
        >
          "{match.user.intent}"
        </p>

        <div className="space-y-2">
          {/* shared signals */}
          {match.sharedSignals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {match.sharedSignals.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                  style={{ borderColor: accent, color: accent }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            <Link
              href={`/user/${match.user.id}`}
              className="hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              view full profile →
            </Link>
            <span>{match.user.timeframe} · {match.user.energyLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDeck({
  headline,
  sub,
  action,
}: {
  headline: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="mx-auto flex h-[560px] flex-col items-center justify-center border-2 border-dashed p-10 text-center"
      style={{ borderColor: SV_GRID }}
    >
      <Sparkles className="h-8 w-8" style={{ color: SV_CYAN }} />
      <h3 className="mt-4 text-2xl font-black italic tracking-tight">{headline}</h3>
      <p className="mt-2 max-w-xs font-mono text-[11px] uppercase tracking-widest text-white/50">
        {sub}
      </p>
      {action}
    </div>
  );
}

function IcebreakerModal({
  meId,
  match,
  onClose,
}: {
  meId: string;
  match: Match;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [draft, setDraft] = useState<string>("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [edited, setEdited] = useState(false);

  const gen = useGenerateIcebreaker({
    mutation: {
      onSuccess: (res) => {
        setGenerated(res.message);
        setDraft(res.message);
      },
    },
  });

  const send = useSendMessage({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListThreadsForUserQueryKey(meId) });
        qc.invalidateQueries({
          queryKey: getListMessagesBetweenQueryKey(meId, match.user.id),
        });
        onClose();
        setLocation(`/messages/${match.user.id}`);
      },
    },
  });

  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    gen.mutate({ data: { meId, otherId: match.user.id } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accent = SV_GREEN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden border-2"
        style={{ borderColor: accent, backgroundColor: SV_INK }}
      >
        {/* header */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: SV_GRID }}
        >
          <UserAvatar user={match.user} size="md" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{match.user.name}</div>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              <Sparkles className="mr-1 inline h-3 w-3" />
              ai-generated opener
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            className="rounded-full p-1.5 text-white/60 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* generated opener */}
        <div className="space-y-3 px-4 py-4">
          {gen.isPending && !generated && (
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: accent }} />
              claude is reading your shared signals...
            </div>
          )}
          {generated !== null && (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                <Edit3 className="mr-1 inline h-3 w-3" />
                tap to edit before sending
              </div>
              <textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setEdited(true);
                }}
                rows={4}
                className="w-full resize-none border-2 bg-transparent p-3 text-sm leading-snug focus:outline-none"
                style={{ borderColor: SV_GRID, color: "#fff" }}
              />
              {edited && (
                <button
                  onClick={() => {
                    setDraft(generated);
                    setEdited(false);
                  }}
                  className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white"
                >
                  ← reset to ai version
                </button>
              )}
            </>
          )}
        </div>

        {/* actions */}
        <div
          className="flex items-center gap-2 border-t px-4 py-3"
          style={{ borderColor: SV_GRID }}
        >
          <button
            onClick={() => {
              setGenerated(null);
              setDraft("");
              setEdited(false);
              gen.mutate({ data: { meId, otherId: match.user.id } });
            }}
            disabled={gen.isPending}
            className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> regen
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              if (!draft.trim()) return;
              send.mutate({
                data: {
                  fromUserId: meId,
                  toUserId: match.user.id,
                  content: draft.trim(),
                },
              });
            }}
            disabled={!draft.trim() || send.isPending || gen.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-40"
            style={{ backgroundColor: accent, color: SV_INK }}
          >
            {send.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            send & open chat
          </button>
        </div>
      </div>
    </div>
  );
}
