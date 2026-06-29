import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";

export const Route = createFileRoute("/partner")({
  ssr: false,
  component: PartnerLayout,
});

function PartnerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" className="shrink-0" aria-label="Go back" />
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold tracking-tight">
              Nexora
            </span>
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
