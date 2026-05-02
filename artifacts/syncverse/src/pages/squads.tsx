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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Rocket, MapPin, Target } from "lucide-react";

function MemberDots({ members }: { members: User[] }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 5).map((m) => (
        <div
          key={m.id}
          title={m.name}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-bold text-background"
          style={{ backgroundColor: m.avatarColor }}
        >
          {m.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
      ))}
      {members.length > 5 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-foreground">
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
}: {
  squad: Squad;
  isSuggested: boolean;
  onJoin: () => void;
  joining: boolean;
}) {
  return (
    <Card className="border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isSuggested && (
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                  Suggested
                </span>
              )}
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {squad.zone}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-bold">{squad.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{squad.purpose}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
            <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First action</div>
              <div className="text-sm">{squad.firstAction}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meet</div>
              <div className="text-sm">{squad.suggestedMeetup}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MemberDots members={squad.members} />
            <span className="text-xs text-muted-foreground">
              {squad.members.length} {squad.members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <Button onClick={onJoin} disabled={joining} size="sm" className="gap-1.5">
            <Rocket className="h-3.5 w-3.5" /> {isSuggested ? "Form squad" : "Join"}
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Users className="h-3 w-3" /> Squads
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tighter md:text-5xl">Form your squad</h1>
        <p className="mt-2 text-muted-foreground">
          Join an active squad or spin up a suggested one with people on your exact wavelength.
        </p>
      </div>

      {(suggestions.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">For you</h2>
          <div className="space-y-3">
            {suggestions.data!.map((s) => (
              <SquadCard
                key={s.id}
                squad={s}
                isSuggested
                joining={joinMutation.isPending}
                onJoin={() => handleJoin(s.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Active squads</h2>
        {squads.isLoading && <p className="text-sm text-muted-foreground">Loading squads...</p>}
        {squads.data?.length === 0 && (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No active squads yet. Be the founder.
            </CardContent>
          </Card>
        )}
        <div className="space-y-3">
          {squads.data?.map((s) => (
            <SquadCard
              key={s.id}
              squad={s}
              isSuggested={false}
              joining={joinMutation.isPending}
              onJoin={() => handleJoin(s.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
