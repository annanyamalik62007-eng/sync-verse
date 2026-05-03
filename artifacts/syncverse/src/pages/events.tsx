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
import { Button } from "@/components/ui/button";
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
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID, ZONE_HUE, accentByIndex } from "@/lib/theme";

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
          / {event.zone}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest">
          {countdown(event.startsAt)}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="flex flex-shrink-0 flex-col items-center border-2 px-3 py-2"
            style={{ borderColor: SV_GRID, minWidth: 70 }}
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
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-white/50">
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
          style={{ borderColor: SV_GRID }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {event.attendees.slice(0, 5).map((a) => (
                <UserAvatar
                  key={a.id}
                  user={a}
                  size="xs"
                  square
                  className="border-2"
                  style={{ borderColor: SV_INK }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span style={{ color: accent }}>{event.attendeeCount}</span> going
            </span>
          </div>
          <button
            disabled={isPending}
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 border-2 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-40"
            style={{
              backgroundColor: event.isAttending ? "transparent" : accent,
              borderColor: accent,
              color: event.isAttending ? accent : SV_INK,
              boxShadow: `3px 3px 0 0 ${SV_INK}`,
            }}
          >
            {event.isAttending ? (
              <>
                <Check className="h-3 w-3" /> going
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
    <div className="space-y-8">
      <header
        className="flex flex-wrap items-end justify-between gap-4 border-b-2 pb-6"
        style={{ borderColor: SV_HOT }}
      >
        <div>
          <div
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ color: SV_HOT }}
          >
            <CalendarDays className="h-3 w-3" /> / {college ?? "your campus"}
          </div>
          <h1 className="mt-3 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
            <span className="sv-outline-text" style={{ color: SV_HOT }}>events</span>
          </h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/50">
            // handpicked for you · rsvp to lock it in
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center gap-2 border-2 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                backgroundColor: SV_HOT,
                borderColor: SV_HOT,
                color: SV_INK,
                boxShadow: `4px 4px 0 0 ${SV_INK}`,
              }}
            >
              <Plus className="h-3.5 w-3.5" /> host an event
            </button>
          </DialogTrigger>
          <DialogContent
            className="border-2 text-white"
            style={{ backgroundColor: SV_INK, borderColor: SV_HOT }}
          >
            <DialogHeader>
              <DialogTitle className="font-black italic tracking-tight">
                host a new event at {college}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: SV_ACID }}>title</Label>
                <Input
                  id="title"
                  placeholder="founders friday: demo night"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border-2 bg-transparent text-white"
                  style={{ borderColor: SV_GRID }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: SV_ACID }}>description</Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="bring a working demo, get 90 seconds + raw feedback."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border-2 bg-transparent text-white"
                  style={{ borderColor: SV_GRID }}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: SV_ACID }}>zone</Label>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((z) => {
                      const active = form.zone === z;
                      const hue = ZONE_HUE[z] ?? SV_CYAN;
                      return (
                        <button
                          key={z}
                          type="button"
                          onClick={() => setForm({ ...form, zone: z })}
                          className="border-2 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest transition-all"
                          style={{
                            borderColor: hue,
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
                  <Label htmlFor="loc" className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: SV_ACID }}>location</Label>
                  <Input
                    id="loc"
                    placeholder="innovation hub"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="border-2 bg-transparent text-white"
                    style={{ borderColor: SV_GRID }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="when" className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: SV_ACID }}>when</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={form.startsAt || defaultDate}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="border-2 bg-transparent text-white"
                  style={{ borderColor: SV_GRID }}
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
                className="inline-flex items-center gap-2 border-2 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-[0.25em] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                style={{
                  backgroundColor: SV_GREEN,
                  borderColor: SV_GREEN,
                  color: SV_INK,
                  boxShadow: `4px 4px 0 0 ${SV_INK}`,
                }}
              >
                {createEvent.isPending ? "creating..." : "create event"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {yours.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" style={{ color: SV_GREEN }} />
            <h2
              className="font-mono text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: SV_GREEN }}
            >
              / your lineup
            </h2>
          </div>
          {yours.map((e, i) => (
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
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" style={{ color: SV_CYAN }} />
            <h2
              className="font-mono text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: SV_CYAN }}
            >
              / more at {college}
            </h2>
          </div>
        )}
        {eventsQuery.isLoading && (
          <p className="font-mono text-xs uppercase tracking-widest text-white/50">
            // loading events...
          </p>
        )}
        {others.length === 0 && yours.length === 0 && !eventsQuery.isLoading && (
          <div
            className="border-2 border-dashed p-10 text-center"
            style={{ borderColor: SV_GRID }}
          >
            <CalendarDays className="mx-auto h-8 w-8" style={{ color: SV_CYAN }} />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-white/60">
              // no events on the calendar yet. be the first to host one.
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
