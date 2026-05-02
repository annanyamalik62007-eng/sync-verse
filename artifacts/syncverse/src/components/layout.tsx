import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Activity, Users, Flame, LayoutGrid, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const userId = localStorage.getItem("syncverse_user_id");

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
    { name: "Squads", href: "/squads", icon: Users },
  ];

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
          <SheetContent side="left" className="w-[240px] border-border bg-card p-0">
            <div className="flex h-16 items-center px-6">
              <Activity className="mr-2 h-6 w-6 text-primary" />
              <span className="font-bold tracking-tight text-primary">SYNCVERSE</span>
            </div>
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (location.startsWith("/zone") && item.href === "/feed");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight text-primary">SYNCVERSE</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-20 items-center px-6 border-b border-border">
          <Activity className="mr-3 h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl font-bold tracking-tighter text-primary">SYNCVERSE</span>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location.startsWith("/zone") && item.href === "/feed");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Connected
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-5xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
