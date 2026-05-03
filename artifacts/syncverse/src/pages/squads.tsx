import { useQueryClient } from "@tanstack/react-query";
import {
  useListSquads,
  useGetSquadSuggestionsForUser,
  useJoinSquad,
  getListSquadsQueryKey,
  getGetSquadSuggestionsForUserQueryKey,
  type Squad,
  type User,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Users, Rocket, MapPin, Target, Sparkles } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID, ZONE_HUE, accentByIndex } from "@/lib/theme";

function MemberDots({ members, accent }: { members: User[]; accent: string }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 5).map((m) => (
        <UserAvatar
          key={m.id}
          user={m}
          size="sm"
          square
          className="border-2"
          style={{ borderColor: SV_INK }}
        />
      ))}
      {members.length > 5 && (
        <div
          className="flex h-8 w-8 items-center justify-center border-2 font-mono text-[10px] font-black"
          style={{
            borderColor: SV_INK,
            backgroundColor: accent,
            color: SV_INK,
          }}
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
  onJoin,
  joining,
  accent,
}: {
  squad: Squad;
  isSuggested: boolean;
  onJoin: () => void;
  joining: boolean;
  accent: string;
}) {
  const zoneHue = ZONE_HUE[squad.zone] ?? SV_CYAN;
  return (
    <div
      className="border-2 transition-all hover:translate-x-[-3px] hover:translate-y-[-3px]"
      style={{
        borderColor: accent,
        backgroundColor: SV_INK,
        boxShadow: `5px 5px 0 0 ${SV_GRID}`,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: accent, color: SV_INK }}
      >
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.3em]">
          {isSuggested ? "/ suggested for you" : "/ active squad"}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest">
          / {squad.zone}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-2xl font-black italic tracking-tight">{squad.name}</h3>
        <p className="mt-1.5 text-sm text-white/70">{squad.purpose}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div
            className="flex items-start gap-2 border p-3"
            style={{ borderColor: SV_GRID }}
          >
            <Target className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: zoneHue }} />
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-[0.25em]"
                style={{ color: zoneHue }}
              >
                / first action
              </div>
              <div className="mt-0.5 text-sm">{squad.firstAction}</div>
            </div>
          </div>
          <div
            className="flex items-start gap-2 border p-3"
            style={{ borderColor: SV_GRID }}
          >
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: zoneHue }} />
            <div>
              <div
                className="font-mono text-[9px] uppercase tracking-[0.25em]"
                style={{ color: zoneHue }}
              >
                / meet
              </div>
              <div className="mt-0.5 text-sm">{squad.suggestedMeetup}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: SV_GRID }}>
          <div className="flex items-center gap-3">
            <MemberDots members={squad.members} accent={accent} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              {squad.members.length} {squad.members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <button
            onClick={onJoin}
            disabled={joining}
            className="inline-flex items-center gap-1.5 border-2 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-40"
            style={{
              backgroundColor: accent,
              borderColor: accent,
              color: SV_INK,
              boxShadow: `3px 3px 0 0 ${SV_INK}`,
            }}
          >
            <Rocket className="h-3 w-3" /> {isSuggested ? "form squad" : "join"}
          </button>
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

  return (
    <div className="space-y-8">
      <header className="border-b-2 pb-6" style={{ borderColor: SV_GREEN }}>
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: SV_GREEN }}
        >
          <Users className="h-3 w-3" /> / form your squad
        </div>
        <h1 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          rooms that <span className="sv-outline-text" style={{ color: SV_GREEN }}>ship</span>.
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/50">
          // 3-5 people · first action set · meet spot picked
        </p>
      </header>

      {(suggestions.data?.length ?? 0) > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" style={{ color: SV_HOT }} />
            <h2
              className="font-mono text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: SV_HOT }}
            >
              / for you
            </h2>
          </div>
          <div className="space-y-4">
            {suggestions.data!.map((s, i) => (
              <SquadCard
                key={s.id}
                squad={s}
                isSuggested
                accent={SV_HOT}
                joining={joinMutation.isPending}
                onJoin={() => handleJoin(s.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-3.5 w-3.5" style={{ color: SV_CYAN }} />
          <h2
            className="font-mono text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: SV_CYAN }}
          >
            / active squads
          </h2>
        </div>
        {squads.isLoading && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">
            // loading squads...
          </p>
        )}
        {squads.data?.length === 0 && (
          <div
            className="border-2 border-dashed p-8 text-center font-mono text-xs uppercase tracking-widest text-white/50"
            style={{ borderColor: SV_GRID }}
          >
            // no active squads yet. be the founder.
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
              onJoin={() => handleJoin(s.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
