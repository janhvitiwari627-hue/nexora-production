import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";

import { assertPublicOnly } from "@/lib/enforce-public-only";

export function PublicPageHeader() {
  if (assertPublicOnly("PublicPageHeader")) return null;
  return (
    <div
      data-testid="public-page-header"
      className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <BackButton size="icon" aria-label="Go back" />
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-gradient-brand text-lg font-extrabold tracking-tight">Nexora</span>
        </Link>
      </div>
    </div>
  );
}
