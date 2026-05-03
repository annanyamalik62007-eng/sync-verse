import { Link } from "wouter";
import { useGetMatchesForUser, getGetMatchesForUserQueryKey, type Match } from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Flame, Sparkles, MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID, ZONE_HUE, accentByIndex } from "@/lib/theme";

export default function Matches() {
  const userId = useCurrentUserId();
  const matches = useGetMatchesForUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetMatchesForUserQueryKey(userId ?? "") },
  });

  return (
    <div className="space-y-8">
      <header className="border-b-2 pb-6" style={{ borderColor: SV_HOT }}>
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em]"
          style={{ color: SV_HOT }}
        >
          <Flame className="h-3 w-3" /> / real-time match detection
        </div>
        <h1 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
          your <span className="sv-outline-text" style={{ color: SV_HOT }}>matches</span>
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/50">
          // people on your wavelength · ranked by alignment
        </p>
      </header>

      {matches.isLoading && (
        <p className="font-mono text-xs uppercase tracking-widest text-white/50">
          // scanning campus signals...
        </p>
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

      <div className="space-y-4">
        {matches.data?.map((m: Match, i: number) => {
          const accent = accentByIndex(i);
          const zoneHue = ZONE_HUE[m.user.zone] ?? SV_CYAN;
          return (
            <article
              key={m.user.id}
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
                  / match · 0{i + 1}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest">
                  align {m.alignmentScore}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <UserAvatar user={m.user} size="xl" square />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-black italic tracking-tight">{m.user.name}</h3>
                    <div
                      className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: zoneHue }}
                    >
                      / {m.user.major} · {m.user.college}
                    </div>
                    <p className="mt-3 text-sm italic text-white/80">"{m.user.intent}"</p>
                    <p
                      className="mt-2 font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: accent }}
                    >
                      // {m.reason}
                    </p>
                    {m.sharedSignals.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {m.sharedSignals.map((s: string, idx: number) => (
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
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: SV_GRID }}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
                    anonymous until you say hi
                  </div>
                  <Link
                    href={`/messages/${m.user.id}`}
                    className="inline-flex items-center gap-1.5 border-2 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: accent,
                      borderColor: accent,
                      color: SV_INK,
                      boxShadow: `3px 3px 0 0 ${SV_INK}`,
                    }}
                  >
                    <MessageCircle className="h-3 w-3" /> message
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
