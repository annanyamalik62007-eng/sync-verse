import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Activity,
  Users,
  Flame,
  MessageCircle,
  CalendarDays,
  GraduationCap,
  Menu,
  Asterisk,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGetUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { clearCurrentUserId, useCurrentUserId } from "@/hooks/use-current-user";
import { UserAvatar } from "@/components/user-avatar";
import { SV_INK, SV_HOT, SV_CYAN, SV_ACID, SV_GREEN, SV_GRID } from "@/lib/theme";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV = [
  { name: "Live Feed", href: "/feed", icon: Activity, hue: SV_CYAN },
  { name: "Matches", href: "/matches", icon: Flame, hue: SV_HOT },
  { name: "Messages", href: "/messages", icon: MessageCircle, hue: SV_ACID },
  { name: "Squads", href: "/squads", icon: Users, hue: SV_GREEN },
  { name: "Events", href: "/events", icon: CalendarDays, hue: SV_HOT },
  { name: "My Major", href: "/major", icon: GraduationCap, hue: SV_CYAN },
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
    return location === href || (href !== "/" && location.startsWith(href + "/"));
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1.5 p-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className="group relative flex items-center gap-3 border-2 px-3 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.25em] transition-all"
            style={{
              borderColor: active ? item.hue : SV_GRID,
              backgroundColor: active ? item.hue : "transparent",
              color: active ? SV_INK : "rgba(255,255,255,0.7)",
              boxShadow: active ? `4px 4px 0 0 ${SV_INK}` : "none",
            }}
          >
            <Icon className="h-4 w-4" />
            {item.name}
            {active && <span className="ml-auto">/</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div
      className="flex min-h-[100dvh] w-full flex-col text-white md:flex-row"
      style={{ backgroundColor: SV_INK }}
    >
      {/* Mobile Nav Header */}
      <header
        className="sticky top-0 z-50 flex h-14 items-center border-b-2 px-4 md:hidden"
        style={{ borderColor: SV_HOT, backgroundColor: SV_INK }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 mr-2 text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] border-0 p-0"
            style={{ backgroundColor: SV_INK, color: "white" }}
          >
            <div
              className="flex h-16 items-center border-b-2 px-5"
              style={{ borderColor: SV_HOT }}
            >
              <Asterisk
                className="mr-2 h-5 w-5"
                style={{ color: SV_HOT }}
              />
              <span
                className="font-black italic tracking-tighter"
                style={{ color: SV_HOT }}
              >
                SYNCVERSE
              </span>
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-center">
          <Asterisk className="mr-2 h-4 w-4 sv-spin-slow" style={{ color: SV_HOT }} />
          <span
            className="font-black italic tracking-tighter"
            style={{ color: SV_HOT }}
          >
            SYNCVERSE
          </span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className="hidden w-64 flex-col border-r-2 md:flex"
        style={{ borderColor: SV_HOT, backgroundColor: SV_INK }}
      >
        <Link
          href="/feed"
          className="flex h-20 items-center border-b-2 px-5"
          style={{ borderColor: SV_HOT }}
        >
          <Asterisk
            className="mr-3 h-6 w-6 sv-spin-slow"
            style={{ color: SV_HOT }}
          />
          <div>
            <div
              className="text-xl font-black italic leading-none tracking-tighter"
              style={{ color: SV_HOT }}
            >
              SYNCVERSE
            </div>
            <div
              className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em]"
              style={{ color: SV_ACID }}
            >
              / live · {me?.college ?? "—"}
            </div>
          </div>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        {me && (
          <div
            className="border-t-2 p-3"
            style={{ borderColor: SV_GRID }}
          >
            <Link
              href="/major"
              className="flex items-center gap-3 border-2 p-2.5 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                borderColor: SV_CYAN,
                boxShadow: `3px 3px 0 0 ${SV_CYAN}`,
              }}
            >
              <UserAvatar user={me} size="md" square />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">{me.name}</div>
                <div
                  className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: SV_CYAN }}
                >
                  / {me.major}
                </div>
              </div>
            </Link>
            <div
              className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ color: SV_GREEN }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping"
                  style={{ backgroundColor: SV_GREEN, opacity: 0.6 }}
                />
                <span
                  className="relative inline-flex h-2 w-2"
                  style={{ backgroundColor: SV_GREEN }}
                />
              </span>
              syncing live
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: SV_INK }}>
        <div className="mx-auto max-w-5xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
