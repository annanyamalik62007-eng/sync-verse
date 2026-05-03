import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home,
  Search,
  Compass,
  Heart,
  MessageCircle,
  Users,
  CalendarDays,
  GraduationCap,
  Asterisk,
  PlusSquare,
  LogOut,
} from "lucide-react";
import {
  useGetUser,
  getGetUserQueryKey,
} from "@workspace/api-client-react";
import {
  clearCurrentUserId,
  useCurrentUserId,
} from "@/hooks/use-current-user";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID } from "@/lib/theme";

interface LayoutProps {
  children: React.ReactNode;
}

const PRIMARY_NAV = [
  { name: "Home", href: "/feed", icon: Home, hue: SV_HOT },
  { name: "Explore", href: "/squads", icon: Compass, hue: SV_CYAN },
  { name: "Matches", href: "/matches", icon: Heart, hue: SV_HOT },
  { name: "Messages", href: "/messages", icon: MessageCircle, hue: SV_ACID },
  { name: "Events", href: "/events", icon: CalendarDays, hue: SV_GREEN },
  { name: "Major", href: "/major", icon: GraduationCap, hue: SV_CYAN },
];

const MOBILE_NAV = [
  { name: "Home", href: "/feed", icon: Home, hue: SV_HOT },
  { name: "Search", href: "/squads", icon: Search, hue: SV_CYAN },
  { name: "Matches", href: "/matches", icon: Heart, hue: SV_HOT },
  { name: "DMs", href: "/messages", icon: MessageCircle, hue: SV_ACID },
];

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const userId = useCurrentUserId();
  const { data: me, error } = useGetUser(userId ?? "", {
    query: {
      enabled: !!userId,
      queryKey: getGetUserQueryKey(userId ?? ""),
      retry: false,
    },
  });

  useEffect(() => {
    const status = (error as { status?: number } | null)?.status;
    if (userId && status === 404) {
      clearCurrentUserId();
      setLocation("/");
    }
  }, [error, userId, setLocation]);

  useEffect(() => {
    if (!userId && location !== "/") {
      setLocation("/");
    }
  }, [userId, location, setLocation]);

  if (!userId && location === "/") {
    return <>{children}</>;
  }

  const isActive = (href: string) => {
    if (href === "/feed") return location === "/feed" || location.startsWith("/zone");
    if (href === "/messages") return location.startsWith("/messages");
    if (href === "/matches") return location === "/matches" || location.startsWith("/user");
    return location === href || (href !== "/" && location.startsWith(href + "/"));
  };

  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col text-white md:flex-row"
      style={{ backgroundColor: SV_INK }}
    >
      {/* Mobile top bar — IG-style */}
      <header
        className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 md:hidden"
        style={{ borderColor: SV_GRID, backgroundColor: SV_INK }}
      >
        <Link href="/feed" className="flex items-center gap-2">
          <Asterisk className="h-5 w-5 sv-spin-slow" style={{ color: SV_HOT }} />
          <span
            className="text-xl font-black italic tracking-tighter"
            style={{ color: SV_HOT }}
          >
            SYNCVERSE
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="relative"
            aria-label="messages"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Link>
          {me && (
            <Link href={`/user/${me.id}`} aria-label="profile">
              <div className="overflow-hidden rounded-full">
                <UserAvatar user={me} size="sm" />
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Desktop sidebar — IG-style */}
      <aside
        className="hidden w-[244px] shrink-0 flex-col border-r md:flex"
        style={{ borderColor: SV_GRID, backgroundColor: SV_INK }}
      >
        <Link
          href="/feed"
          className="flex h-20 items-center gap-3 px-6"
        >
          <Asterisk className="h-7 w-7 sv-spin-slow" style={{ color: SV_HOT }} />
          <span
            className="text-2xl font-black italic tracking-tighter"
            style={{ color: SV_HOT }}
          >
            SYNCVERSE
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
              >
                <Icon
                  className={`h-6 w-6 transition-transform group-hover:scale-110 ${active ? "" : ""}`}
                  style={{
                    color: active ? item.hue : "white",
                    fill: active ? item.hue : "transparent",
                    strokeWidth: active ? 2.5 : 1.75,
                  }}
                />
                <span
                  className={`text-base ${active ? "font-black" : "font-normal"}`}
                  style={{ color: active ? item.hue : "white" }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          <button
            className="group mt-1 flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
            onClick={() => setLocation("/feed")}
          >
            <PlusSquare
              className="h-6 w-6 transition-transform group-hover:scale-110"
              style={{ color: "white", strokeWidth: 1.75 }}
            />
            <span className="text-base">Create</span>
          </button>

          {me && (
            <Link
              href={`/user/${me.id}`}
              className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
            >
              <div
                className={`overflow-hidden rounded-full ${isActive(`/user/${me.id}`) ? "ring-2" : ""}`}
                style={{ ["--tw-ring-color" as string]: SV_HOT } as React.CSSProperties}
              >
                <UserAvatar user={me} size="sm" />
              </div>
              <span className="text-base">Profile</span>
            </Link>
          )}
        </nav>

        {me && (
          <div className="border-t px-3 py-3" style={{ borderColor: SV_GRID }}>
            <div className="mb-2 flex items-center gap-2 px-3 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: SV_GREEN }}>
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full"
                  style={{ backgroundColor: SV_GREEN, opacity: 0.6 }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: SV_GREEN }}
                />
              </span>
              live · {me.college}
            </div>
            <button
              onClick={() => {
                clearCurrentUserId();
                setLocation("/");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <main
        className="flex-1 overflow-auto pb-20 md:pb-0"
        style={{ backgroundColor: SV_INK }}
      >
        <div className="mx-auto w-full max-w-[975px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — IG-style */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t md:hidden"
        style={{ borderColor: SV_GRID, backgroundColor: SV_INK }}
      >
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 items-center justify-center"
              aria-label={item.name}
            >
              <Icon
                className="h-6 w-6 transition-transform active:scale-90"
                style={{
                  color: active ? item.hue : "white",
                  fill: active ? item.hue : "transparent",
                  strokeWidth: active ? 2.5 : 1.75,
                }}
              />
            </Link>
          );
        })}
        {me && (
          <Link
            href={`/user/${me.id}`}
            className="flex flex-1 items-center justify-center"
            aria-label="profile"
          >
            <div
              className={`overflow-hidden rounded-full ${isActive(`/user/${me.id}`) ? "ring-2" : ""}`}
              style={{ ["--tw-ring-color" as string]: SV_HOT } as React.CSSProperties}
            >
              <UserAvatar user={me} size="xs" />
            </div>
          </Link>
        )}
      </nav>
    </div>
  );
}
