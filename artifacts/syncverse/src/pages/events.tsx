import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUser,
  getGetUserQueryKey,
  useListEvents,
  getListEventsQueryKey,
  useCreateEvent,
  useToggleEventRsvp,
  type CommunityZone,
  type CampusEvent,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  MapPin,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, ZONE_HUE, accentByIndex } from "@/lib/theme";

const ZONES: CommunityZone[] = [
  "career",
  "startup",
  "study",
  "social",
  "creative",
  "fitness",
  "research",
];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "started";
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `in ${Math.max(1, Math.floor(diff / 60000))}m`;
  if (h < 24) return `in ${h}h`;
  return `in ${Math.floor(h / 24)}d`;
}

function EventCard({
  event,
  onToggle,
  isPending,
  accent,
}: {
  event: CampusEvent;
  onToggle: () => void;
  isPending: boolean;
  accent: string;
}) {
  const zoneHue = ZONE_HUE[event.zone] ?? SV_CYAN;
  return (
    <article
      className="overflow-hidden rounded-3xl border transition-all hover:-translate-y-0.5"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: `linear-gradient(135deg, ${accent}10 0%, transparent 60%), rgba(255,255,255,0.02)`,
        boxShadow: `0 16px 40px -20px ${accent}44`,
      }}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div
          className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em]"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          {event.zone}
        </div>
        <div
          className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderColor: `${SV_GREEN}55`, color: SV_GREEN, backgroundColor: `${SV_GREEN}10` }}
        >
          {countdown(event.startsAt)}
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-start gap-4">
          <div
            className="flex flex-shrink-0 flex-col items-center rounded-2xl border px-3 py-2"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.02)",
              minWidth: 70,
            }}
          >
            <span
              className="font-mono text-[9px] font-black uppercase tracking-widest"
              style={{ color: zoneHue }}
            >
              {new Date(event.startsAt).toLocaleString([], { month: "short" })}
            </span>
            <span
              className="text-3xl font-black italic leading-none tracking-tighter"
              style={{ color: accent }}
            >
              {new Date(event.startsAt).getDate()}
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/50">
              {new Date(event.startsAt).toLocaleString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black italic leading-tight tracking-tight">
              {event.title}
            </h3>
            <p className="mt-1.5 text-sm text-white/70">{event.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {fmtDate(event.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            </div>
          </div>
        </div>
        <div
          className="mt-4 flex items-center justify-between border-t pt-4"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {event.attendees.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="rounded-full ring-2"
                  style={{ ["--tw-ring-color" as string]: SV_INK } as React.CSSProperties}
                >
                  <UserAvatar user={a} size="xs" />
                </div>
              ))}
            </div>
            <span className="text-xs text-white/60">
              <span style={{ color: accent }}>{event.attendeeCount}</span> going
            </span>
          </div>
          <button
            disabled={isPending}
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.04] disabled:opacity-40"
            style={{
              backgroundColor: event.isAttending ? "transparent" : accent,
              borderWidth: event.isAttending ? 1 : 0,
              borderStyle: "solid",
              borderColor: accent,
              color: event.isAttending ? accent : SV_INK,
            }}
          >
            {event.isAttending ? (
              <>
                <Check className="h-3.5 w-3.5" /> going
              </>
            ) : (
              "rsvp"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Events() {
  const userId = useCurrentUserId();
  const me = useGetUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId ?? "") },
  });
  const college = me.data?.college;
  const qc = useQueryClient();

  const eventsQuery = useListEvents(
    { college, userId: userId ?? undefined },
    {
      query: {
        enabled: !!college && !!userId,
        queryKey: getListEventsQueryKey({ college, userId: userId ?? undefined }),
        refetchInterval: 10000,
      },
    },
  );

  const toggleRsvp = useToggleEventRsvp({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: getListEventsQueryKey({ college, userId: userId ?? undefined }),
        });
      },
    },
  });

  const createEvent = useCreateEvent({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({
          queryKey: getListEventsQueryKey({ college, userId: userId ?? undefined }),
        });
        setOpen(false);
        setForm({ title: "", description: "", zone: "social", location: "", startsAt: "" });
      },
    },
  });

  const [open, setOpen] = useState(false);
  const defaultDate = (() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();
  const [form, setForm] = useState({
    title: "",
    description: "",
    zone: "social" as CommunityZone,
    location: "",
    startsAt: "",
  });

  const submitEvent = () => {
    if (!userId) return;
    createEvent.mutate({
      data: {
        hostUserId: userId,
        title: form.title,
        description: form.description,
        zone: form.zone,
        location: form.location,
        startsAt: new Date(form.startsAt || defaultDate).toISOString(),
      },
    });
  };

  const events = eventsQuery.data ?? [];
  const yours = events.filter((e) => e.isAttending);
  const others = events.filter((e) => !e.isAttending);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ borderColor: `${SV_HOT}55`, color: SV_HOT, backgroundColor: `${SV_HOT}10` }}
          >
            <CalendarDays className="h-3 w-3" /> {college ?? "your campus"}
          </div>
          <h1 className="mt-4 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
            <span className="sv-outline-text" style={{ color: SV_HOT }}>events</span>
          </h1>
          <p className="mt-3 text-sm text-white/60">
            handpicked for you · rsvp to lock it in
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.04]"
              style={{ backgroundColor: SV_HOT, color: SV_INK }}
            >
              <Plus className="h-4 w-4" /> host an event
            </button>
          </DialogTrigger>
          <DialogContent
            className="rounded-2xl border text-white"
            style={{ backgroundColor: SV_INK, borderColor: "rgba(255,255,255,0.1)" }}
          >
            <DialogHeader>
              <DialogTitle className="font-black italic tracking-tight">
                host a new event at {college}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase tracking-widest" style={{ color: SV_ACID }}>title</Label>
                <Input
                  id="title"
                  placeholder="founders friday: demo night"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl border bg-transparent text-white"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-xs uppercase tracking-widest" style={{ color: SV_ACID }}>description</Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="bring a working demo, get 90 seconds + raw feedback."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl border bg-transparent text-white"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest" style={{ color: SV_ACID }}>zone</Label>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((z) => {
                      const active = form.zone === z;
                      const hue = ZONE_HUE[z] ?? SV_CYAN;
                      return (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setForm({ ...form, zone: z })}
                          className="rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors"
                          style={{
                            borderColor: `${hue}66`,
                            backgroundColor: active ? hue : "transparent",
                            color: active ? SV_INK : hue,
                          }}
                        >
                          {z}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc" className="text-xs uppercase tracking-widest" style={{ color: SV_ACID }}>location</Label>
                  <Input
                    id="loc"
                    placeholder="innovation hub"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="rounded-xl border bg-transparent text-white"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="when" className="text-xs uppercase tracking-widest" style={{ color: SV_ACID }}>when</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={form.startsAt || defaultDate}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="rounded-xl border bg-transparent text-white"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={submitEvent}
                disabled={
                  createEvent.isPending ||
                  form.title.trim().length < 3 ||
                  form.description.trim().length < 3 ||
                  form.location.trim().length < 2
                }
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.04] disabled:opacity-40"
                style={{ backgroundColor: SV_GREEN, color: SV_INK }}
              >
                {createEvent.isPending ? "creating..." : "create event"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {yours.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-3.5 w-3.5" style={{ color: SV_GREEN }} />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: SV_GREEN }}>
              your lineup
            </h2>
          </div>
          {yours.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              accent={SV_GREEN}
              isPending={toggleRsvp.isPending}
              onToggle={() =>
                userId && toggleRsvp.mutate({ eventId: e.id, data: { userId } })
              }
            />
          ))}
        </section>
      )}

      <section className="space-y-4">
        {yours.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <CalendarDays className="h-3.5 w-3.5" style={{ color: SV_CYAN }} />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: SV_CYAN }}>
              more at {college}
            </h2>
          </div>
        )}
        {eventsQuery.isLoading && (
          <p className="text-sm text-white/50">loading events...</p>
        )}
        {others.length === 0 && yours.length === 0 && !eventsQuery.isLoading && (
          <div
            className="rounded-2xl border border-dashed p-10 text-center"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <CalendarDays className="mx-auto h-8 w-8" style={{ color: SV_CYAN }} />
            <p className="mt-4 text-sm text-white/60">
              no events on the calendar yet. be the first to host one.
            </p>
          </div>
        )}
        {others.map((e, i) => (
          <EventCard
            key={e.id}
            event={e}
            accent={accentByIndex(i + 1)}
            isPending={toggleRsvp.isPending}
            onToggle={() =>
              userId && toggleRsvp.mutate({ eventId: e.id, data: { userId } })
            }
          />
        ))}
      </section>
    </div>
  );
}
