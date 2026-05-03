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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

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

function EventCard({ event, onToggle, isPending }: { event: CampusEvent; onToggle: () => void; isPending: boolean }) {
  return (
    <Card className="overflow-hidden border-border bg-card transition-all hover:border-primary/40">
      <div className={`h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent`} />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-shrink-0 flex-col items-center rounded-lg border border-border bg-background px-3 py-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {new Date(event.startsAt).toLocaleString([], { month: "short" })}
            </span>
            <span className="text-2xl font-black leading-none tracking-tighter text-primary">
              {new Date(event.startsAt).getDate()}
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {countdown(event.startsAt)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold leading-tight">{event.title}</h3>
              <Badge variant="outline" className="border-primary/30 text-[10px] uppercase text-primary">
                {event.zone}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{event.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {fmtDate(event.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {event.attendees.slice(0, 5).map((a) => (
                    <UserAvatar key={a.id} user={a} size="xs" className="ring-2 ring-card" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{event.attendeeCount}</span> going
                </span>
              </div>
              <Button
                size="sm"
                variant={event.isAttending ? "secondary" : "default"}
                disabled={isPending}
                onClick={onToggle}
              >
                {event.isAttending ? (
                  <>
                    <Check className="mr-1 h-3 w-3" /> Going
                  </>
                ) : (
                  "RSVP"
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <CalendarDays className="h-3 w-3" /> {college ?? "Your campus"}
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tighter md:text-5xl">Events</h1>
          <p className="mt-2 text-muted-foreground">
            What's happening on campus this week. RSVP to lock it in.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" /> Host an event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Host a new event at {college}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Founders Friday: Demo Night"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="Bring a working demo, get 90 seconds + raw feedback."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Zone</Label>
                  <div className="flex flex-wrap gap-2">
                    {ZONES.map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setForm({ ...form, zone: z })}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                          form.zone === z
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loc">Location</Label>
                  <Input
                    id="loc"
                    placeholder="Innovation Hub"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="when">When</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={form.startsAt || defaultDate}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={submitEvent}
                disabled={
                  createEvent.isPending ||
                  form.title.trim().length < 3 ||
                  form.description.trim().length < 3 ||
                  form.location.trim().length < 2
                }
              >
                {createEvent.isPending ? "Creating..." : "Create event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {yours.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> Your lineup
          </div>
          {yours.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isPending={toggleRsvp.isPending}
              onToggle={() =>
                userId &&
                toggleRsvp.mutate({ eventId: e.id, data: { userId } })
              }
            />
          ))}
        </section>
      )}

      <section className="space-y-3">
        {yours.length > 0 && (
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            More at {college}
          </div>
        )}
        {eventsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading events...</p>}
        {others.length === 0 && yours.length === 0 && !eventsQuery.isLoading && (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No events on the calendar yet. Be the first to host one.
              </p>
            </CardContent>
          </Card>
        )}
        {others.map((e) => (
          <EventCard
            key={e.id}
            event={e}
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
