import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";

/**
 * Minimal header for the Customer App / PWA experience.
 *
 * Intentionally does NOT render the public website navigation
 * (owner, growth partner, distributor, job portal, etc.). The
 * Customer App is a separate mobile-first surface — website chrome
 * must not leak into it.
 */
export function CustomerAppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          aria-label="Back to Nexora home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight">Nexora App</span>
        </div>
        <div className="w-16" aria-hidden />
      </div>
    </header>
  );
}
