import { useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUser,
  getGetUserQueryKey,
  useListMessagesBetween,
  getListMessagesBetweenQueryKey,
  useSendMessage,
  getListThreadsForUserQueryKey,
  useGenerateIcebreakerSuggestions,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { ArrowLeft, Send, Phone, Video, Info, Smile, Image as ImageIcon, Heart, Mic, Sparkles, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_GREEN, ZONE_HUE } from "@/lib/theme";

export default function Chat() {
  const params = useParams<{ userId: string }>();
  const otherId = params.userId ?? "";
  const meId = useCurrentUserId();
  const [, setLocation] = useLocation();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const other = useGetUser(otherId, {
    query: { enabled: !!otherId, queryKey: getGetUserQueryKey(otherId) },
  });

  const messages = useListMessagesBetween(meId ?? "", otherId, {
    query: {
      enabled: !!meId && !!otherId,
      queryKey: getListMessagesBetweenQueryKey(meId ?? "", otherId),
      refetchInterval: 4000,
    },
  });

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: () => {
        setText("");
        if (meId) {
          qc.invalidateQueries({ queryKey: getListMessagesBetweenQueryKey(meId, otherId) });
          qc.invalidateQueries({ queryKey: getListThreadsForUserQueryKey(meId) });
        }
      },
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.data?.length]);

  // Generate AI icebreaker chips ONCE when chat is empty
  const [chips, setChips] = useState<string[]>([]);
  const chipsRequestedRef = useRef(false);
  const suggestMutation = useGenerateIcebreakerSuggestions({
    mutation: {
      onSuccess: (res) => setChips(res.suggestions),
    },
  });

  useEffect(() => {
    if (
      !chipsRequestedRef.current &&
      meId &&
      otherId &&
      messages.data &&
      messages.data.length === 0 &&
      other.data
    ) {
      chipsRequestedRef.current = true;
      suggestMutation.mutate({ data: { meId, otherId } });
    }
  }, [meId, otherId, messages.data, other.data, suggestMutation]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || !meId) return;
    sendMutation.mutate({
      data: { fromUserId: meId, toUserId: otherId, content: trimmed },
    });
  };

  if (!meId) return null;
  const otherHue = other.data ? ZONE_HUE[other.data.zone] ?? SV_CYAN : SV_CYAN;

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] w-full max-w-2xl flex-col md:h-[calc(100dvh-9rem)]">
      {/* IG-style chat header */}
      <div
        className="-mx-4 mb-3 flex items-center gap-3 border-b px-4 py-3 md:-mx-8 md:px-8"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => setLocation("/messages")}
          aria-label="Back"
          className="rounded-full p-1.5 transition-colors hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        {other.data && (
          <>
            <Link href={`/user/${other.data.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(from 200deg, ${otherHue}, ${SV_HOT}, ${otherHue})`,
                }}
              >
                <div className="rounded-full p-[2px]" style={{ backgroundColor: SV_INK }}>
                  <div className="overflow-hidden rounded-full">
                    <UserAvatar user={other.data} size="md" />
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">
                  {other.data.name.toLowerCase().replace(/\s+/g, ".")}
                </div>
                <div className="truncate text-[11px] text-white/50">
                  {other.data.major} · {other.data.college}
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <button className="rounded-full p-2 transition-colors hover:bg-white/5" aria-label="call">
                <Phone className="h-5 w-5 text-white" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-white/5" aria-label="video">
                <Video className="h-5 w-5 text-white" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-white/5" aria-label="info">
                <Info className="h-5 w-5 text-white" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Message list (no card frame — full bleed IG style) */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-1 py-2">
        {messages.isLoading && (
          <p className="py-8 text-center text-sm text-white/40">loading...</p>
        )}
        {messages.data && messages.data.length === 0 && other.data && (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <div
              className="rounded-full p-[3px]"
              style={{
                background: `conic-gradient(from 200deg, ${otherHue}, ${SV_HOT}, ${otherHue})`,
              }}
            >
              <div className="rounded-full p-[3px]" style={{ backgroundColor: SV_INK }}>
                <div className="overflow-hidden rounded-full">
                  <UserAvatar user={other.data} size="2xl" />
                </div>
              </div>
            </div>
            <h3 className="mt-4 text-xl font-bold">{other.data.name}</h3>
            <p className="mt-1 text-sm text-white/60">
              {other.data.major} · {other.data.college}
            </p>
            <Link href={`/user/${other.data.id}`}>
              <button
                className="mt-4 rounded-lg px-4 py-1.5 text-sm font-bold"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}
              >
                View profile
              </button>
            </Link>
            <p className="mt-6 max-w-xs text-xs text-white/40">
              you both showed up on each other's match list. make the first move.
            </p>
          </div>
        )}
        {messages.data?.map((m, i) => {
          const mine = m.fromUserId === meId;
          const prev = i > 0 ? messages.data![i - 1] : null;
          const isFirstInGroup = !prev || prev.fromUserId !== m.fromUserId;
          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <div className={`w-7 ${isFirstInGroup ? "" : "invisible"}`}>
                  {other.data && (
                    <div className="overflow-hidden rounded-full">
                      <UserAvatar user={other.data} size="xs" />
                    </div>
                  )}
                </div>
              )}
              <div
                className="max-w-[75%] rounded-3xl px-3.5 py-2 text-sm"
                style={
                  mine
                    ? { background: `linear-gradient(135deg, ${SV_HOT} 0%, #c91488 100%)`, color: "white" }
                    : { backgroundColor: "rgba(255,255,255,0.08)", color: "white" }
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI icebreaker chips — only on empty thread */}
      {messages.data && messages.data.length === 0 && other.data && (
        <div className="px-1 pb-2 pt-1">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3 w-3" style={{ color: SV_GREEN }} />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: SV_GREEN }}
            >
              ai openers tuned to your shared signals
            </span>
            {suggestMutation.isPending && (
              <Loader2 className="h-3 w-3 animate-spin text-white/40" />
            )}
          </div>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => setText(chip)}
                  className="max-w-full rounded-full border px-3 py-1.5 text-left text-xs leading-snug text-white/85 transition-colors hover:bg-white/5"
                  style={{
                    borderColor: `${SV_GREEN}55`,
                    backgroundColor: `${SV_GREEN}08`,
                  }}
                  title="tap to use"
                >
                  {chip}
                </button>
              ))}
            </div>
          ) : (
            !suggestMutation.isPending && (
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                claude is reading your signals...
              </div>
            )
          )}
        </div>
      )}

      {/* IG composer */}
      <div className="px-1 py-3">
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1.5"
          style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          <Smile className="h-5 w-5 shrink-0 text-white/70" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message ${other.data?.name.split(" ")[0] ?? ""}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          {text.trim() ? (
            <button
              onClick={send}
              disabled={sendMutation.isPending}
              className="text-sm font-bold disabled:opacity-40"
              style={{ color: SV_HOT }}
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-white/70">
              <Mic className="h-5 w-5" />
              <ImageIcon className="h-5 w-5" />
              <Heart className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
