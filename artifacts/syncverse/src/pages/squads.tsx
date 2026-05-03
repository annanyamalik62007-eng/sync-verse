import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSquads,
  useGetSquadSuggestionsForUser,
  useJoinSquad,
  getListSquadsQueryKey,
  getGetSquadSuggestionsForUserQueryKey,
  getListThreadsForUserQueryKey,
  type Squad,
  type User,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import {
  Users,
  Rocket,
  MapPin,
  Target,
  Sparkles,
  X,
  Loader2,
  Send,
  Check,
  RotateCcw,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_GREEN, SV_GRID, ZONE_HUE, accentByIndex } from "@/lib/theme";

function MemberDots({ members, accent }: { members: User[]; accent: string }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 5).map((m) => (
        <div
          key={m.id}
          className="rounded-full ring-2"
          style={{ ["--tw-ring-color" as string]: SV_INK } as React.CSSProperties}
        >
          <UserAvatar user={m} size="sm" />
        </div>
      ))}
      {members.length > 5 && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full ring-2 font-mono text-[10px] font-black"
          style={{
            ["--tw-ring-color" as string]: SV_INK,
            backgroundColor: accent,
            color: SV_INK,
          } as React.CSSProperties}
        >
          +{members.length - 5}
        </div>
      )}
    </div>
  );
}

function SquadCard({
  squad,
  isSuggested,
  onForm,
  onJoin,
  joining,
  accent,
}: {
  squad: Squad;
  isSuggested: boolean;
  onForm: () => void;
  onJoin: () => void;
  joining: boolean;
  accent: string;
}) {
  const zoneHue = ZONE_HUE[squad.zone] ?? SV_CYAN;
  return (
    <div
      className="overflow-hidden rounded-3xl border transition-all hover:-translate-y-0.5"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: `linear-gradient(135deg, ${accent}12 0%, transparent 60%), rgba(255,255,255,0.02)`,
        boxShadow: `0 16px 40px -20px ${accent}66`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ borderColor: `${accent}55`, color: accent, backgroundColor: `${accent}10` }}
        >
          {isSuggested && <Sparkles className="h-3 w-3" />}
          {isSuggested ? "for you" : "active"}
        </div>
        <div
          className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
          style={{ color: zoneHue, backgroundColor: `${zoneHue}15` }}
        >
          {squad.zone}
        </div>
      </div>
      <div className="px-5 pb-5">
        <h3 className="text-2xl font-black italic tracking-tight">{squad.name}</h3>
        <p className="mt-1.5 text-sm text-white/70">{squad.purpose}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div
            className="flex items-start gap-2 rounded-xl border p-3"
            style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}
          >
            <Target className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: zoneHue }} />
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-[0.25em]"
                style={{ color: zoneHue }}
              >
                first action
              </div>
              <div className="mt-0.5 text-sm">{squad.firstAction}</div>
            </div>
          </div>
          <div
            className="flex items-start gap-2 rounded-xl border p-3"
            style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}
          >
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: zoneHue }} />
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-[0.25em]"
                style={{ color: zoneHue }}
              >
                meet
              </div>
              <div className="mt-0.5 text-sm">{squad.suggestedMeetup}</div>
            </div>
          </div>
        </div>

        <div
          className="mt-4 flex items-center justify-between border-t pt-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <MemberDots members={squad.members} accent={accent} />
            <span className="text-xs text-white/60">
              {squad.members.length} {squad.members.length === 1 ? "member" : "members"}
            </span>
          </div>
          {isSuggested ? (
            <button
              onClick={onForm}
              disabled={joining}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.04] disabled:opacity-40"
              style={{ backgroundColor: accent, color: SV_INK }}
            >
              <Sparkles className="h-3.5 w-3.5" /> form with ai
            </button>
          ) : (
            <button
              onClick={onJoin}
              disabled={joining}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.04] disabled:opacity-40"
              style={{ backgroundColor: accent, color: SV_INK }}
            >
              <Rocket className="h-3.5 w-3.5" /> join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Squads() {
  const userId = useCurrentUserId();
  const qc = useQueryClient();
  const squads = useListSquads();
  const suggestions = useGetSquadSuggestionsForUser(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getGetSquadSuggestionsForUserQueryKey(userId ?? ""),
    },
  });

  const joinMutation = useJoinSquad({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListSquadsQueryKey() });
        if (userId) qc.invalidateQueries({ queryKey: getGetSquadSuggestionsForUserQueryKey(userId) });
      },
    },
  });

  const handleJoin = (squadId: string) => {
    if (!userId) return;
    joinMutation.mutate({ squadId, data: { userId } });
  };

  const [pitchSquad, setPitchSquad] = useState<Squad | null>(null);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${SV_GREEN}55`, color: SV_GREEN, backgroundColor: `${SV_GREEN}10` }}
        >
          <Users className="h-3 w-3" /> form your squad
        </div>
        <h1 className="mt-4 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          rooms that <span className="sv-outline-text" style={{ color: SV_GREEN }}>ship</span>.
        </h1>
        <p className="mt-3 text-sm text-white/60">
          3–5 people · first action set · meet spot picked · ai writes the invite
        </p>
      </header>

      {(suggestions.data?.length ?? 0) > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2 px-1">
            <Sparkles className="h-3.5 w-3.5" style={{ color: SV_HOT }} />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: SV_HOT }}>
              for you
            </h2>
          </div>
          <div className="space-y-4">
            {suggestions.data!.map((s) => (
              <SquadCard
                key={s.id}
                squad={s}
                isSuggested
                accent={SV_HOT}
                joining={joinMutation.isPending}
                onForm={() => setPitchSquad(s)}
                onJoin={() => handleJoin(s.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2 px-1">
          <Users className="h-3.5 w-3.5" style={{ color: SV_CYAN }} />
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: SV_CYAN }}>
            active squads
          </h2>
        </div>
        {squads.isLoading && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">
            loading squads...
          </p>
        )}
        {squads.data?.length === 0 && (
          <div
            className="rounded-2xl border border-dashed p-8 text-center text-sm text-white/50"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            no active squads yet. be the founder.
          </div>
        )}
        <div className="space-y-4">
          {squads.data?.map((s, i) => (
            <SquadCard
              key={s.id}
              squad={s}
              isSuggested={false}
              accent={accentByIndex(i + 1)}
              joining={joinMutation.isPending}
              onForm={() => {}}
              onJoin={() => handleJoin(s.id)}
            />
          ))}
        </div>
      </section>

      {pitchSquad && userId && (
        <SquadPitchModal
          meId={userId}
          squad={pitchSquad}
          onClose={() => setPitchSquad(null)}
        />
      )}
    </div>
  );
}

type PitchState = {
  member: User;
  message: string | null;
  loading: boolean;
  sent: boolean;
};

function SquadPitchModal({
  meId,
  squad,
  onClose,
}: {
  meId: string;
  squad: Squad;
  onClose: () => void;
}) {
  // Recipients = everyone except me
  const recipients = squad.members.filter((m) => m.id !== meId);

  const [pitches, setPitches] = useState<PitchState[]>(
    () => recipients.map((m) => ({ member: m, message: null, loading: true, sent: false })),
  );
  const triggeredRef = useRef(false);

  const qc = useQueryClient();

  // Generate all pitches in parallel on mount via direct fetch (one
  // useMutation hook can only track a single in-flight request, so
  // parallel calls would lose callbacks — fetch keeps each call isolated).
  useEffect(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    recipients.forEach((m, idx) => {
      const fallback = `forming a squad to ship "${squad.purpose}". your energy would slot in perfect — down?`;
      fetch(`${import.meta.env.BASE_URL}api/ai/squad-pitch`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fromUserId: meId,
          toUserId: m.id,
          squadIntent: squad.purpose,
        }),
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`http ${r.status}`);
          const data = (await r.json()) as { message?: string };
          return data.message?.trim() || fallback;
        })
        .catch(() => fallback)
        .then((message) => {
          setPitches((arr) => {
            const next = arr.slice();
            next[idx] = { ...next[idx], message, loading: false };
            return next;
          });
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMessage = (idx: number, val: string) => {
    setPitches((arr) => {
      const next = arr.slice();
      next[idx] = { ...next[idx], message: val };
      return next;
    });
  };

  const [sending, setSending] = useState(false);

  const sendPitch = async (idx: number) => {
    const p = pitches[idx];
    if (!p || !p.message?.trim() || p.sent) return;
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}api/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fromUserId: meId,
          toUserId: p.member.id,
          content: p.message.trim(),
        }),
      });
      if (!r.ok) throw new Error(`http ${r.status}`);
      setPitches((arr) => {
        const next = arr.slice();
        next[idx] = { ...next[idx], sent: true };
        return next;
      });
    } catch {
      /* leave as not-sent so user can retry */
    }
  };

  const sendOne = async (idx: number) => {
    setSending(true);
    await sendPitch(idx);
    qc.invalidateQueries({ queryKey: getListThreadsForUserQueryKey(meId) });
    setSending(false);
  };

  const sendAll = async () => {
    setSending(true);
    await Promise.all(
      pitches.map((p, i) =>
        p.message?.trim() && !p.sent && !p.loading ? sendPitch(i) : Promise.resolve(),
      ),
    );
    qc.invalidateQueries({ queryKey: getListThreadsForUserQueryKey(meId) });
    setSending(false);
  };

  const allSent = pitches.length > 0 && pitches.every((p) => p.sent);
  const anyLoading = pitches.some((p) => p.loading);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.78)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden border-2"
        style={{ borderColor: SV_HOT, backgroundColor: SV_INK }}
      >
        {/* header */}
        <div
          className="flex items-start gap-3 border-b px-5 py-4"
          style={{ borderColor: SV_GRID }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${SV_HOT}22`, color: SV_HOT }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: SV_HOT }}
            >
              ai-pitched squad invite
            </p>
            <h3 className="mt-1 truncate text-xl font-black italic tracking-tight">
              {squad.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-white/60">{squad.purpose}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="close"
            className="rounded-full p-1.5 text-white/60 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* per-member pitches */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {pitches.length === 0 && (
            <p className="text-center text-sm text-white/50">
              no other members to invite yet.
            </p>
          )}
          {pitches.map((p, i) => (
            <div
              key={p.member.id}
              className="space-y-2 border p-3"
              style={{
                borderColor: p.sent ? SV_GREEN : SV_GRID,
                backgroundColor: p.sent ? `${SV_GREEN}08` : "transparent",
              }}
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={p.member} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{p.member.name}</div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                    {p.member.major} · / {p.member.zone}
                  </div>
                </div>
                {p.sent && (
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: SV_GREEN }}
                  >
                    <Check className="h-3.5 w-3.5" /> sent
                  </span>
                )}
              </div>
              {p.loading ? (
                <div className="flex items-center gap-2 px-1 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                  <Loader2 className="h-3 w-3 animate-spin" style={{ color: SV_HOT }} />
                  claude is writing a personalized pitch...
                </div>
              ) : (
                <textarea
                  value={p.message ?? ""}
                  onChange={(e) => updateMessage(i, e.target.value)}
                  rows={3}
                  disabled={p.sent}
                  className="w-full resize-none border bg-transparent p-2.5 text-sm leading-snug focus:outline-none disabled:opacity-60"
                  style={{ borderColor: SV_GRID, color: "#fff" }}
                />
              )}
              {!p.sent && !p.loading && (
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => sendOne(i)}
                    disabled={!p.message?.trim() || sending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] disabled:opacity-40"
                    style={{ color: SV_GREEN }}
                  >
                    <Send className="h-3 w-3" /> send to {p.member.name.split(" ")[0].toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* footer */}
        <div
          className="flex items-center gap-2 border-t px-5 py-3"
          style={{ borderColor: SV_GRID }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            {pitches.filter((p) => p.sent).length} / {pitches.length} sent
          </span>
          <div className="flex-1" />
          {allSent ? (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold"
              style={{ backgroundColor: SV_GREEN, color: SV_INK }}
            >
              <Check className="h-4 w-4" /> done
            </button>
          ) : (
            <button
              onClick={sendAll}
              disabled={anyLoading || sending || pitches.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-40"
              style={{ backgroundColor: SV_HOT, color: SV_INK }}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              send all invites
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// keep RotateCcw import side-effect-free in case unused later
void RotateCcw;
