import { useState } from "react";

type Sized = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_PX: Record<Sized, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  "2xl": 120,
};

const TEXT_CLS: Record<Sized, string> = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
  "2xl": "text-4xl",
};

interface UserLike {
  name: string;
  avatarColor?: string | null;
  avatarUrl?: string | null;
}

export interface UserAvatarProps {
  user: UserLike;
  size?: Sized;
  ring?: string;
  square?: boolean;
  fill?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  size = "md",
  ring,
  square,
  fill,
  className = "",
}: UserAvatarProps) {
  const [errored, setErrored] = useState(false);
  const px = SIZE_PX[size];
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const radius = fill ? "" : square ? "rounded-md" : "rounded-full";
  const bg = user.avatarColor || "#888";
  const showImg = !!user.avatarUrl && !errored;
  const sizeStyle = fill
    ? { width: "100%", height: "100%" }
    : { width: px, height: px };

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${radius} ${className}`}
      style={{
        ...sizeStyle,
        backgroundColor: bg,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    >
      {showImg ? (
        <img
          src={user.avatarUrl ?? undefined}
          alt={user.name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className={`relative font-bold text-white drop-shadow ${TEXT_CLS[size]}`}
        >
          {initials || "?"}
        </span>
      )}
    </div>
  );
}

export default UserAvatar;
