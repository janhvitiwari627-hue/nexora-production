import { Link } from "@tanstack/react-router";
import { Bell, Crown, Menu, Search, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { LocationChip } from "./LocationChip";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Explore" },
  { to: "/membership", label: "Membership" },
  { to: "/for-owners", label: "Become Owner" },
] as const;

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
            <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
          </Button>
          <LocationChip className="mr-1 hidden lg:inline-flex" />
          <Button variant="ghost" className="gap-1.5 font-semibold" asChild>
            <Link to="/membership">
              <Crown className="h-4 w-4 text-primary" />
              Membership
            </Link>
          </Button>
          <Button variant="ghost" className="font-semibold" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button
            className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-glow)] hover:opacity-95"
            asChild
          >
            <Link to="/register">Register</Link>
          </Button>
          <Link
            to="/dashboard"
            aria-label="Profile"
            className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-muted text-heading ring-1 ring-border transition hover:bg-card hover:shadow-[var(--shadow-card)]"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link to="/search"><Search className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
            <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
          </Button>
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
