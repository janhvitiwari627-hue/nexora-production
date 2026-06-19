import { Link } from "@tanstack/react-router";
import { Bell, Heart, MapPin, Menu, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileMenuOverlay } from "./MobileMenuOverlay";

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
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-cta grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-gradient-brand text-xl font-extrabold tracking-tight">
            Nexora
          </span>
        </Link>

        <div className="hidden min-w-0 items-center justify-center gap-2 md:flex">
          <button className="text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition">
            <MapPin className="text-primary h-4 w-4" />
            Jaipur
            <span className="text-muted-foreground">▾</span>
          </button>
          <Link
            to="/search"
            className="text-muted-foreground hover:text-foreground hover:bg-muted ml-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition"
          >
            <Search className="h-4 w-4" /> Search salons, services…
          </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" className="font-semibold">
            Login
          </Button>
          <Button className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-glow)] hover:opacity-95">
            Register →
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button className="bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium">
            <MapPin className="text-primary h-3.5 w-3.5" /> Jaipur
          </button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
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
