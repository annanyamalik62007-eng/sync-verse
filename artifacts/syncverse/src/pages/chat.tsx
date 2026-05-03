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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

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

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col md:h-[calc(100dvh-9rem)]">
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/messages")}
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {other.data && (
          <>
            <UserAvatar user={other.data} size="md" />
            <div>
              <div className="font-bold">{other.data.name}</div>
              <Link
                href="/major"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {other.data.major} · {other.data.college}
              </Link>
            </div>
          </>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border bg-card">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.isLoading && (
            <p className="text-center text-sm text-muted-foreground">Loading...</p>
          )}
          {messages.data && messages.data.length === 0 && (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm font-semibold">Say hi to {other.data?.name.split(" ")[0]}.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You both showed up on each other's match list. Make the first move.
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
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
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
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${other.data?.name.split(" ")[0] ?? ""}...`}
              rows={1}
              className="max-h-32 min-h-[44px] resize-none"
            />
            <Button
              onClick={send}
              disabled={!text.trim() || sendMutation.isPending}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
