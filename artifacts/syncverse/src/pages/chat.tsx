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
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { ArrowLeft, Send } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GRID, ZONE_HUE } from "@/lib/theme";

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
    <div className="flex h-[calc(100dvh-7rem)] flex-col md:h-[calc(100dvh-9rem)]">
      <div
        className="mb-4 flex items-center gap-3 border-b-2 pb-4"
        style={{ borderColor: otherHue }}
      >
        <button
          onClick={() => setLocation("/messages")}
          aria-label="Back to messages"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
          style={{
            borderColor: SV_GRID,
            color: "white",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {other.data && (
          <>
            <UserAvatar user={other.data} size="md" square />
            <div className="min-w-0 flex-1">
              <div className="text-base font-black">{other.data.name}</div>
              <Link
                href="/major"
                className="font-mono text-[10px] uppercase tracking-[0.25em]"
                style={{ color: otherHue }}
              >
                / {other.data.major} · {other.data.college}
              </Link>
            </div>
          </>
        )}
      </div>

      <div
        className="flex flex-1 flex-col overflow-hidden border-2"
        style={{ borderColor: SV_GRID, backgroundColor: SV_INK }}
      >
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.isLoading && (
            <p className="text-center font-mono text-xs uppercase tracking-widest text-white/40">
              // loading...
            </p>
          )}
          {messages.data && messages.data.length === 0 && (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm font-black">
                  say hi to {other.data?.name.split(" ")[0]}.
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
                  // you both showed up on each other's match list. make the first move.
                </p>
              </div>
            </div>
          )}
          {messages.data?.map((m) => {
            const mine = m.fromUserId === meId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[75%] border-2 px-3.5 py-2.5 text-sm"
                  style={{
                    backgroundColor: mine ? SV_HOT : SV_INK,
                    borderColor: mine ? SV_HOT : otherHue,
                    color: mine ? SV_INK : "white",
                    boxShadow: mine
                      ? `3px 3px 0 0 ${SV_INK}`
                      : `3px 3px 0 0 ${otherHue}33`,
                  }}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className="mt-1 font-mono text-[9px] uppercase tracking-widest"
                    style={{ opacity: 0.6 }}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="border-t-2 p-3"
          style={{ borderColor: SV_GRID, backgroundColor: "#0d0d14" }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`message ${other.data?.name.split(" ")[0] ?? ""}...`}
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none border-2 bg-transparent px-3 py-2.5 text-sm text-white placeholder:font-mono placeholder:text-xs placeholder:uppercase placeholder:tracking-widest placeholder:text-white/40 focus:outline-none"
              style={{ borderColor: SV_GRID }}
              onFocus={(e) => (e.currentTarget.style.borderColor = otherHue)}
              onBlur={(e) => (e.currentTarget.style.borderColor = SV_GRID)}
            />
            <button
              onClick={send}
              disabled={!text.trim() || sendMutation.isPending}
              aria-label="Send"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center border-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              style={{
                backgroundColor: SV_HOT,
                borderColor: SV_HOT,
                color: SV_INK,
                boxShadow: `3px 3px 0 0 ${SV_INK}`,
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
