import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Handshake, LogOut, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { label: "Explore", to: "/search", icon: Sparkles, desc: "Salons, spas & barbers near you" },
  { label: "For Owners", to: "/", icon: Building2, desc: "Run your salon on Nexora" },
  { label: "Partners", to: "/", icon: Handshake, desc: "Grow with our partner network" },
  { label: "Jobs", to: "/", icon: Briefcase, desc: "Find your next role in beauty" },
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
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const isAuthed = mounted && !!user;

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

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate({ to: "/" });
  };

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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="bg-card fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col shadow-[var(--shadow-float)] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
          >
            <div className="border-border flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-cta grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-gradient-brand text-lg font-extrabold tracking-tight">
                  Nexora
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="hover:bg-muted text-muted-foreground grid h-9 w-9 place-items-center rounded-full transition"
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
              {isAuthed ? (
                <Button variant="outline" className="h-11 font-semibold" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
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
