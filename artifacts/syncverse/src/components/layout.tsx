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
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGetUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { useCurrentUserId } from "@/hooks/use-current-user";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const userId = useCurrentUserId();
  const { data: me } = useGetUser(userId ?? "", {
    query: { enabled: !!userId, queryKey: getGetUserQueryKey(userId ?? "") },
  });

  useEffect(() => {
    if (!userId && location !== "/") {
      setLocation("/");
    }
  }, [userId, location, setLocation]);

  if (!userId && location === "/") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Live Feed", href: "/feed", icon: Activity },
    { name: "Matches", href: "/matches", icon: Flame },
    { name: "Messages", href: "/messages", icon: MessageCircle },
    { name: "Squads", href: "/squads", icon: Users },
    { name: "Events", href: "/events", icon: CalendarDays },
    { name: "My Major", href: "/major", icon: GraduationCap },
  ];

  const isActive = (href: string) => {
    if (href === "/feed") return location === "/feed" || location.startsWith("/zone");
    if (href === "/messages") return location.startsWith("/messages");
    return location === href || (href !== "/" && location.startsWith(href + "/"));
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              active
                ? "bg-primary/15 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground md:flex-row">
      {/* Mobile Nav Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2 mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] border-border bg-card p-0">
            <div className="flex h-16 items-center px-5">
              <Activity className="mr-2 h-6 w-6 text-primary" />
              <span className="font-black tracking-tighter text-primary">SYNCVERSE</span>
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          <span className="font-black tracking-tighter text-primary">SYNCVERSE</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-20 items-center px-6 border-b border-border">
          <Activity className="mr-3 h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl font-black tracking-tighter text-primary">SYNCVERSE</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        {me && (
          <div className="border-t border-border p-4">
            <Link href="/major" className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-background"
                style={{ backgroundColor: me.avatarColor }}
              >
                {me.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{me.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {me.major} · {me.college}
                </div>
              </div>
            </Link>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Live
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-5xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
