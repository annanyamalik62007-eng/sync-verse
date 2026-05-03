import { Link, useRoute } from "wouter";
import {
  useGetUser,
  useListUserPosts,
  getGetUserQueryKey,
  getListUserPostsQueryKey,
  type Post,
} from "@workspace/api-client-react";
import { ArrowLeft, Flame, UserPlus, MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import {
  SV_INK,
  SV_GRID,
  SV_HOT,
  SV_CYAN,
  SV_ACID,
  SV_GREEN,
  ZONE_HUE,
} from "@/lib/theme";

export default function Profile() {
  const [, params] = useRoute("/user/:userId");
  const userId = params?.userId ?? "";
  const { data: user, isLoading } = useGetUser(userId, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId) },
  });
  const { data: posts } = useListUserPosts(userId, {
    query: { enabled: !!userId, queryKey: getListUserPostsQueryKey(userId) },
  });

  if (isLoading) {
    return (
      <p className="font-mono text-xs uppercase tracking-widest text-white/50">
        // loading profile...
      </p>
    );
  }
  if (!user) {
    return (
      <div className="text-center font-mono text-xs uppercase tracking-widest text-white/50">
        // user not found.
        <Link href="/feed" style={{ color: SV_CYAN }} className="ml-2 underline">
          back to feed
        </Link>
      </div>
    );
  }

  const hue = ZONE_HUE[user.zone] ?? SV_HOT;
  const skills = (user.skills ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" /> / back
      </Link>

      <section
        className="border-2 p-6 md:p-8"
        style={{ borderColor: hue, boxShadow: `8px 8px 0 0 ${SV_GRID}` }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <UserAvatar user={user} size="2xl" square ring={hue} />
          <div className="min-w-0 flex-1">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.4em]"
              style={{ color: hue }}
            >
              / {user.zone} · {user.timeframe} · {user.energyLevel}
            </div>
            <h1 className="mt-2 text-4xl font-black italic leading-none tracking-tighter md:text-6xl">
              {user.name}
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-white/60">
              {user.major} · {user.college}
            </p>
            <p className="mt-4 max-w-xl text-base italic text-white/85 md:text-lg">
              "{user.intent}"
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {user.lookingFor && (
                <Tag color={SV_HOT}>looking for · {user.lookingFor}</Tag>
              )}
              {user.availability && (
                <Tag color={SV_ACID}>available · {user.availability}</Tag>
              )}
              {skills.map((s) => (
                <Tag key={s} color={SV_CYAN}>
                  {s}
                </Tag>
              ))}
            </div>
            <Link
              href={`/messages/${user.id}`}
              className="mt-6 inline-flex items-center gap-2 border-2 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.3em]"
              style={{
                borderColor: SV_GREEN,
                color: SV_GREEN,
                boxShadow: `4px 4px 0 0 ${SV_GRID}`,
              }}
            >
              <MessageCircle className="h-3 w-3" /> message
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2
          className="mb-4 font-mono text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: SV_HOT }}
        >
          / posts ({posts?.length ?? 0})
        </h2>
        {(!posts || posts.length === 0) && (
          <div
            className="border-2 border-dashed p-8 text-center font-mono text-xs uppercase tracking-widest text-white/50"
            style={{ borderColor: SV_GRID }}
          >
            // no posts yet.
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((p: Post) => (
            <ProfilePostTile key={p.id} post={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfilePostTile({ post }: { post: Post }) {
  const hue = ZONE_HUE[post.zone] ?? SV_HOT;
  return (
    <div
      className="flex flex-col gap-3 border-2 p-4"
      style={{
        borderColor: SV_GRID,
        backgroundColor: SV_INK,
        boxShadow: `3px 3px 0 0 ${SV_GRID}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: hue }}
        >
          / {post.zone}
        </span>
        {post.activityTag && (
          <span
            className="border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{ borderColor: SV_ACID, color: SV_ACID }}
          >
            {post.activityTag}
          </span>
        )}
      </div>
      <p className="text-sm leading-snug text-white/90">{post.body}</p>
      <div className="mt-auto flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/60">
        <span className="inline-flex items-center gap-1" style={{ color: SV_HOT }}>
          <Flame className="h-3 w-3" /> {post.reactionCount}
        </span>
        <span className="inline-flex items-center gap-1" style={{ color: SV_GREEN }}>
          <UserPlus className="h-3 w-3" /> {post.joinCount}
        </span>
      </div>
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em]"
      style={{ borderColor: color, color }}
    >
      {children}
    </span>
  );
}
