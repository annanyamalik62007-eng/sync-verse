import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListUsers,
  useGetZoneActivity,
  useGetUser,
  useListZonePosts,
  useCreatePost,
  useTogglePostReaction,
  useTogglePostJoin,
  getGetUserQueryKey,
  getListZonePostsQueryKey,
  type User,
  type Post,
  type CommunityZone,
} from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";
import {
  Activity,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  UserPlus,
  Send,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import {
  SV_INK,
  SV_HOT,
  SV_GREEN,
  ZONE_HUE,
  SV_CYAN,
} from "@/lib/theme";

const ZONE_LABELS: Record<CommunityZone, string> = {
  career: "Career",
  startup: "Startup",
  study: "Study",
  social: "Social",
  creative: "Creative",
  fitness: "Fitness",
  research: "Research",
};

const isZone = (s: string): s is CommunityZone => s in ZONE_LABELS;

const trendIcon: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  steady: Minus,
};

export default function Zone() {
  const [, params] = useRoute("/zone/:zone");
  const zone = params?.zone;
  const userId = useCurrentUserId();
  const { data: me } = useGetUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId ?? "") },
  });

  if (!zone || !isZone(zone)) {
    return (
      <div className="text-center text-sm text-white/50">
        unknown zone.
        <Link href="/feed" style={{ color: SV_CYAN }} className="ml-2 underline">
          back to feed
        </Link>
      </div>
    );
  }

  return <ZoneInner zone={zone} me={me} />;
}

function ZoneInner({ zone, me }: { zone: CommunityZone; me?: User }) {
  const hue = ZONE_HUE[zone] ?? SV_CYAN;
  const college = me?.college;
  const users = useListUsers({ zone, ...(college ? { college } : {}) });
  const activity = useGetZoneActivity();
  const posts = useListZonePosts(zone, {
    query: { queryKey: getListZonePostsQueryKey(zone) },
  });
  const z = activity.data?.find((a) => a.zone === zone);
  const TrendI = z ? trendIcon[z.trendDirection] : Minus;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> live feed
      </Link>

      <section
        className="relative overflow-hidden rounded-3xl border p-8 md:p-10"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: `radial-gradient(ellipse at top right, ${hue}33 0%, transparent 60%), ${SV_INK}`,
        }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${hue}55`, color: hue, backgroundColor: `${hue}15` }}
        >
          <Activity className="h-3 w-3 animate-pulse" /> zone
        </div>
        <h1 className="mt-4 text-5xl font-black italic leading-none tracking-tighter md:text-7xl">
          <span className="sv-outline-text" style={{ color: hue }}>
            {ZONE_LABELS[zone]}
          </span>
        </h1>
        {z && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat hue={hue} label="active" value={z.activeUsers} />
            <Stat hue={hue} label="living now" value={z.livingNow} />
            <Stat hue={hue} label="squads" value={z.squads} />
            <Stat
              hue={hue}
              label="trend"
              value={
                <span className="inline-flex items-center gap-1">
                  <TrendI className="h-5 w-5" />
                  <span className="capitalize">{z.trendDirection}</span>
                </span>
              }
            />
          </div>
        )}
      </section>

      {me && <PostComposer zone={zone} hue={hue} me={me} />}

      <section>
        <h2
          className="mb-3 px-1 font-mono text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: hue }}
        >
          what people are doing
        </h2>
        {posts.isLoading && (
          <p className="text-sm text-white/50">loading...</p>
        )}
        {posts.data?.length === 0 && (
          <div
            className="rounded-2xl border border-dashed p-8 text-center text-sm text-white/50"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            no posts yet. drop the first signal.
          </div>
        )}
        <div className="space-y-3">
          {posts.data?.map((p) => (
            <PostCard key={p.id} post={p} hue={hue} viewerId={me?.id ?? ""} zone={zone} />
          ))}
        </div>
      </section>

      <section>
        <h2
          className="mb-3 px-1 font-mono text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: hue }}
        >
          people in this zone {college ? `at ${college}` : ""}
        </h2>
        {users.isLoading && (
          <p className="text-sm text-white/50">loading...</p>
        )}
        {users.data?.length === 0 && (
          <div
            className="rounded-2xl border border-dashed p-8 text-center text-sm text-white/50"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            no one here yet. you could be the first signal.
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {users.data?.map((u: User) => (
            <Link
              key={u.id}
              href={`/user/${u.id}`}
              className="flex items-start gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.03]"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                className="rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(from 200deg, ${hue}, ${SV_HOT}, ${hue})`,
                }}
              >
                <div className="rounded-full p-[2px]" style={{ backgroundColor: SV_INK }}>
                  <div className="overflow-hidden rounded-full">
                    <UserAvatar user={u} size="md" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{u.name}</h3>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest text-white/50"
                  >
                    {u.timeframe} · {u.energyLevel}
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  {u.major} · {u.college}
                </p>
                <p className="mt-1.5 text-sm italic text-white/80">"{u.intent}"</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function PostComposer({
  zone,
  hue,
  me,
}: {
  zone: CommunityZone;
  hue: string;
  me: User;
}) {
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const qc = useQueryClient();
  const create = useCreatePost({
    mutation: {
      onSuccess: () => {
        setBody("");
        setTag("");
        qc.invalidateQueries({ queryKey: getListZonePostsQueryKey(zone) });
      },
    },
  });

  const submit = () => {
    const text = body.trim();
    if (!text || create.isPending) return;
    create.mutate({
      data: {
        authorId: me.id,
        zone,
        body: text,
        ...(tag.trim() ? { activityTag: tag.trim() } : {}),
      },
    });
  };

  return (
    <section
      className="rounded-2xl border p-4 md:p-5"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="overflow-hidden rounded-full">
          <UserAvatar user={me} size="md" />
        </div>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`What are you doing in ${ZONE_LABELS[zone].toLowerCase()} right now?`}
            rows={3}
            className="w-full resize-none rounded-xl border bg-transparent p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              ["--tw-ring-color" as string]: hue,
            } as React.CSSProperties}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="activity tag (optional)"
              className="w-48 rounded-full border bg-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-widest placeholder:text-white/30 focus:outline-none"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: hue }}
            />
            <span className="text-[10px] text-white/40">
              · {body.length}/500
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!body.trim() || create.isPending}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-transform hover:scale-[1.04] disabled:opacity-40"
              style={{ backgroundColor: hue, color: SV_INK }}
            >
              <Send className="h-3.5 w-3.5" />
              {create.isPending ? "posting..." : "post"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PostCard({
  post,
  hue,
  viewerId,
  zone,
}: {
  post: Post;
  hue: string;
  viewerId: string;
  zone: CommunityZone;
}) {
  const qc = useQueryClient();
  const reacted = !!viewerId && post.reactorIds.includes(viewerId);
  const joined = !!viewerId && post.joinerIds.includes(viewerId);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListZonePostsQueryKey(zone) });

  const react = useTogglePostReaction({
    mutation: { onSuccess: invalidate },
  });
  const join = useTogglePostJoin({ mutation: { onSuccess: invalidate } });

  const onReact = () => {
    if (!viewerId || react.isPending) return;
    react.mutate({ postId: post.id, data: { userId: viewerId, kind: "fire" } });
  };
  const onJoin = () => {
    if (!viewerId || join.isPending) return;
    join.mutate({ postId: post.id, data: { userId: viewerId } });
  };

  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(post.createdAt).getTime()) / 60000),
  );
  const ago =
    minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.round(minutes / 60)}h` : `${Math.round(minutes / 1440)}d`;

  return (
    <article
      className="rounded-2xl border p-4 md:p-5"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex items-start gap-3">
        <Link href={`/user/${post.author.id}`}>
          <div
            className="rounded-full p-[2px]"
            style={{ background: `conic-gradient(from 200deg, ${hue}, ${SV_HOT}, ${hue})` }}
          >
            <div className="rounded-full p-[2px]" style={{ backgroundColor: SV_INK }}>
              <div className="overflow-hidden rounded-full">
                <UserAvatar user={post.author} size="md" />
              </div>
            </div>
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/user/${post.author.id}`}
              className="font-bold hover:underline"
            >
              {post.author.name}
            </Link>
            <span className="text-xs text-white/50">{post.author.major}</span>
            <span className="text-xs text-white/40">· {ago} ago</span>
            {post.activityTag && (
              <span
                className="ml-auto rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                style={{ borderColor: `${hue}55`, color: hue, backgroundColor: `${hue}10` }}
              >
                {post.activityTag}
              </span>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
            {post.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onReact}
              disabled={!viewerId || react.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40"
              style={{
                borderColor: `${SV_HOT}66`,
                backgroundColor: reacted ? SV_HOT : "transparent",
                color: reacted ? SV_INK : SV_HOT,
              }}
            >
              <Flame className="h-3.5 w-3.5" />
              {post.reactionCount} fire
            </button>
            <button
              type="button"
              onClick={onJoin}
              disabled={!viewerId || join.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40"
              style={{
                borderColor: `${SV_GREEN}66`,
                backgroundColor: joined ? SV_GREEN : "transparent",
                color: joined ? SV_INK : SV_GREEN,
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              {joined ? "joined" : "join"} · {post.joinCount}
            </button>
            {post.joiners.length > 0 && (
              <div className="ml-1 flex -space-x-2">
                {post.joiners.slice(0, 5).map((j) => (
                  <Link key={j.id} href={`/user/${j.id}`}>
                    <div
                      className="rounded-full ring-2"
                      style={{ ["--tw-ring-color" as string]: SV_INK } as React.CSSProperties}
                    >
                      <UserAvatar user={j} size="xs" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Stat({ hue, label, value }: { hue: string; label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="text-3xl font-black italic leading-none tracking-tighter"
        style={{ color: hue }}
      >
        {value}
      </div>
      <div
        className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em]"
        style={{ color: hue }}
      >
        {label}
      </div>
    </div>
  );
}
