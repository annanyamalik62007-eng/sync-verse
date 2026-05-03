import { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  useGetUser,
  useListUserPosts,
  getGetUserQueryKey,
  getListUserPostsQueryKey,
  type Post,
} from "@workspace/api-client-react";
import {
  ArrowLeft,
  Flame,
  UserPlus,
  MessageCircle,
  Grid3x3,
  Bookmark,
  Tag as TagIcon,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { useCurrentUserId } from "@/hooks/use-current-user";
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
  const meId = useCurrentUserId();
  const isMe = userId === meId;
  const { data: user, isLoading } = useGetUser(userId, {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId) },
  });
  const { data: posts } = useListUserPosts(userId, {
    query: { enabled: !!userId, queryKey: getListUserPostsQueryKey(userId) },
  });
  const [tab, setTab] = useState<"posts" | "saved" | "tagged">("posts");
  const [following, setFollowing] = useState(false);

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
  const handle = user.name.toLowerCase().replace(/\s+/g, ".");
  const postCount = posts?.length ?? 0;
  const matchCount = 12 + (postCount * 7) % 240;
  const squadCount = 3 + (postCount % 9);

  return (
    <div className="mx-auto w-full max-w-[935px]">
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1 text-xs text-white/40 hover:text-white md:hidden"
      >
        <ArrowLeft className="h-3 w-3" /> back
      </Link>

      {/* IG-style profile header */}
      <header className="flex flex-col gap-6 pb-8 md:flex-row md:items-start md:gap-12">
        {/* Avatar with story ring */}
        <div className="flex justify-center md:w-[290px] md:justify-end">
          <div
            className="rounded-full p-[3px]"
            style={{
              background: `conic-gradient(from 200deg, ${SV_HOT}, ${hue}, ${SV_CYAN}, ${SV_ACID}, ${SV_HOT})`,
            }}
          >
            <div className="rounded-full p-[3px]" style={{ backgroundColor: SV_INK }}>
              <div className="overflow-hidden rounded-full">
                <UserAvatar user={user} size="2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Username row */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-light tracking-tight text-white">
              {handle}
            </h1>
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full"
              style={{ backgroundColor: SV_CYAN, color: SV_INK }}
              title="verified campus member"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3">
                <path
                  d="M3 6l2 2 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {isMe ? (
              <>
                <button
                  className="rounded-md border-0 px-4 py-1.5 text-sm font-bold transition-colors"
                  style={{ backgroundColor: SV_GRID, color: "white" }}
                >
                  Edit profile
                </button>
                <button
                  className="rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                  aria-label="settings"
                >
                  <Settings className="h-5 w-5 text-white" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFollowing((v) => !v)}
                  className="rounded-md px-4 py-1.5 text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: following ? SV_GRID : SV_HOT,
                    color: following ? "white" : SV_INK,
                  }}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <Link
                  href={`/messages/${user.id}`}
                  className="rounded-md px-4 py-1.5 text-sm font-bold transition-colors"
                  style={{ backgroundColor: SV_GRID, color: "white" }}
                >
                  Message
                </Link>
                <button
                  className="rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                  aria-label="more"
                >
                  <MoreHorizontal className="h-5 w-5 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 text-sm">
            <span>
              <span className="font-bold">{postCount}</span>{" "}
              <span className="text-white/70">posts</span>
            </span>
            <Link href="/matches" className="hover:opacity-80">
              <span className="font-bold">{matchCount}</span>{" "}
              <span className="text-white/70">matches</span>
            </Link>
            <Link href="/squads" className="hover:opacity-80">
              <span className="font-bold">{squadCount}</span>{" "}
              <span className="text-white/70">squads</span>
            </Link>
          </div>

          {/* Bio */}
          <div className="text-sm leading-snug">
            <div className="font-bold">{user.name}</div>
            <div className="text-white/70">
              {user.major} · {user.college}
            </div>
            <p className="mt-1 italic text-white/85">"{user.intent}"</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span style={{ color: hue }}>#{user.zone}</span>
              <span style={{ color: SV_ACID }}>#{user.timeframe}</span>
              <span style={{ color: SV_GREEN }}>#{user.energyLevel}</span>
            </div>
          </div>

          {/* Tag chips */}
          {(user.lookingFor || user.availability || skills.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {user.lookingFor && (
                <Tag color={SV_HOT}>looking for · {user.lookingFor}</Tag>
              )}
              {user.availability && (
                <Tag color={SV_ACID}>free · {user.availability}</Tag>
              )}
              {skills.slice(0, 6).map((s) => (
                <Tag key={s} color={SV_CYAN}>
                  {s}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Story highlights row */}
      <div className="mb-6 flex gap-6 overflow-x-auto border-b pb-6" style={{ borderColor: SV_GRID }}>
        {[
          { label: "intent", hue: SV_HOT, icon: Flame },
          { label: "squads", hue: SV_GREEN, icon: UserPlus },
          { label: "events", hue: SV_ACID, icon: TagIcon },
          { label: "saved", hue: SV_CYAN, icon: Bookmark },
        ].map(({ label, hue: h, icon: Icon }) => (
          <div key={label} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border"
              style={{ borderColor: SV_GRID, backgroundColor: "#11111A", color: h }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-[11px] text-white/80">{label}</span>
          </div>
        ))}
      </div>

      {/* Tab strip */}
      <div
        className="flex justify-center gap-12 border-t"
        style={{ borderColor: SV_GRID }}
      >
        {[
          { key: "posts" as const, icon: Grid3x3, label: "POSTS" },
          { key: "saved" as const, icon: Bookmark, label: "SAVED" },
          { key: "tagged" as const, icon: TagIcon, label: "TAGGED" },
        ].map(({ key, icon: Icon, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="-mt-px flex items-center gap-2 border-t-2 py-3.5 font-mono text-[11px] tracking-[0.3em] transition-colors"
              style={{
                borderColor: active ? "white" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.4)",
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Post grid */}
      {tab === "posts" && (
        <div className="mt-1 grid grid-cols-3 gap-1">
          {(!posts || posts.length === 0) && (
            <div className="col-span-3 py-16 text-center text-sm text-white/50">
              no posts yet.
            </div>
          )}
          {posts?.map((p, i) => (
            <ProfilePostTile key={p.id} post={p} index={i} />
          ))}
        </div>
      )}
      {tab === "saved" && (
        <div className="mt-1 py-16 text-center text-sm text-white/50">
          only you can see what you've saved.
        </div>
      )}
      {tab === "tagged" && (
        <div className="mt-1 py-16 text-center text-sm text-white/50">
          no posts you're tagged in yet.
        </div>
      )}
    </div>
  );
}

function ProfilePostTile({ post, index }: { post: Post; index: number }) {
  const hue = ZONE_HUE[post.zone] ?? SV_HOT;
  const accents = [SV_HOT, SV_CYAN, SV_ACID, SV_GREEN];
  const second = accents[index % accents.length];
  return (
    <div
      className="group relative aspect-square cursor-pointer overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${hue} 0%, ${second} 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `linear-gradient(${SV_INK}10 1px, transparent 1px), linear-gradient(90deg, ${SV_INK}10 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <p
          className="line-clamp-5 text-center text-sm font-black italic leading-tight tracking-tight md:text-base"
          style={{ color: SV_INK }}
        >
          {post.body}
        </p>
      </div>
      {post.activityTag && (
        <div
          className="absolute left-2 top-2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
          style={{ backgroundColor: SV_INK, color: hue }}
        >
          {post.activityTag}
        </div>
      )}
      {/* IG hover overlay with stats */}
      <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5 text-sm font-black text-white">
          <Flame className="h-5 w-5" style={{ fill: "white" }} />
          {post.reactionCount}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-black text-white">
          <UserPlus className="h-5 w-5" />
          {post.joinCount}
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
