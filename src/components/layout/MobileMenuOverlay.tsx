import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, LayoutDashboard, LogOut, Sparkles, TrendingUp, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";


const NAV = [
  { label: "Explore", to: "/search", icon: Sparkles, desc: "Salons, spas & barbers near you" },
  { label: "Job Portal", to: "/jobs", icon: Briefcase, desc: "Find your next role in beauty" },
  { label: "Create Shop Website", to: "/owner/templates", icon: Building2, desc: "Launch your salon website in minutes" },
] as const;

export function MobileMenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const authResolved = mounted && isInitialized;
  const isAuthed = authResolved && !!user;
  const panelRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management + focus trap + Escape to close
  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move focus to close button once the panel mounts
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 30);

    const getFocusable = (): HTMLElement[] => {
      const root = panelRef.current;
      if (!root) return [];
      const nodes = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
      return Array.from(nodes).filter(
        (el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null,
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !panelRef.current?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      // Restore focus to the element that opened the menu
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === "function") {
        try {
          prev.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [open, onClose]);

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate({ to: "/", replace: true });
  };


  const displayName =
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Account");
  const email = user?.email ?? "";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-heading/50 backdrop-blur-sm md:hidden"
          />
          <motion.aside
            key="panel"
            ref={(node) => {
              panelRef.current = node as HTMLElement | null;
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="bg-card fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col shadow-[var(--shadow-float)] md:hidden pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            tabIndex={-1}
          >

            <div className="border-border flex items-center justify-between border-b px-4 py-4 sm:px-5">

              <div className="flex items-center gap-2">
                <div className="bg-gradient-cta grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-gradient-brand text-lg font-extrabold tracking-tight">
                  Nexora
                </span>
              </div>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close menu"
                className="hover:bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary grid h-11 w-11 place-items-center rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {NAV.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="group hover:bg-muted flex items-center gap-3 rounded-2xl px-3 py-3 transition"
                    >
                      <div className="bg-muted group-hover:bg-gradient-cta text-primary group-hover:text-primary-foreground grid h-11 w-11 shrink-0 place-items-center rounded-xl transition">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-heading truncate text-sm font-bold">
                          {item.label}
                        </div>
                        <div className="text-muted-foreground truncate text-xs">
                          {item.desc}
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-border bg-card flex flex-col gap-2 border-t p-4">
              {!authResolved ? (
                <>
                  <Skeleton className="h-11 w-full rounded-md" />
                  <Skeleton className="h-11 w-full rounded-md" />
                </>
              ) : isAuthed ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-2">
                    <div className="bg-gradient-cta grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-primary-foreground">
                      {(displayName[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-heading">{displayName}</div>
                      {email && (
                        <div className="truncate text-xs text-muted-foreground">{email}</div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" className="h-11 justify-start font-semibold" asChild>
                    <Link to="/dashboard" onClick={onClose}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-11 justify-start font-semibold" asChild>
                    <Link to="/profile" onClick={onClose}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-11 justify-start font-semibold text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="h-11 font-semibold" asChild>
                    <Link to="/login" onClick={onClose}>Login</Link>
                  </Button>
                  <Button className="bg-gradient-cta text-primary-foreground h-11 font-semibold shadow-[var(--shadow-glow)]" asChild>
                    <Link to="/register" onClick={onClose}>Register →</Link>
                  </Button>
                  <p className="text-muted-foreground mt-1 text-center text-[11px]">
                    Join 50k+ members getting their best looks on Nexora.
                  </p>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
