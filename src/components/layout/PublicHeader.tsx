import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LayoutDashboard, LogOut, Menu, Search, Settings, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { LocationChip } from "./LocationChip";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Explore" },
  { to: "/for-owners", label: "Become Owner" },
] as const;

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  // Only trust auth state after the component is mounted AND the auth store
  // has finished bootstrapping the session from storage.
  const authResolved = mounted && isInitialized;
  const isAuthed = authResolved && !!user;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  const displayName =
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Account");
  const email = user?.email ?? "";
  const avatarUrl =
    profile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    "";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass-panel border-b border-border/60 shadow-[var(--shadow-card)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-cta grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-gradient-brand text-xl font-extrabold tracking-tight">
            Nexora
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center justify-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-body transition hover:bg-muted hover:text-heading [&.active]:bg-muted [&.active]:text-heading"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link to="/search"><Search className="h-5 w-5" /></Link>
          </Button>
          {isAuthed && (
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
            </Button>
          )}
          <LocationChip className="mr-1 hidden lg:inline-flex" />

          {!authResolved ? (
            <div className="flex items-center gap-2 px-1">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 flex items-center gap-2 rounded-full bg-muted px-2 py-1 pr-3 text-heading ring-1 ring-border transition hover:bg-card hover:shadow-[var(--shadow-card)]"
                  aria-label="Open account menu"
                >
                  <span className="bg-gradient-cta grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-primary-foreground">
                    {initials}
                  </span>
                  <Avatar className="h-7 w-7">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                    <AvatarFallback className="bg-gradient-cta text-[11px] font-bold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm font-semibold">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-heading">{displayName}</span>
                  {email && (
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {email}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="font-semibold" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button
                className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-glow)] hover:opacity-95"
                asChild
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link to="/search"><Search className="h-5 w-5" /></Link>
          </Button>
          {isAuthed && (
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
