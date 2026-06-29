import { Link } from "@tanstack/react-router";
import { Compass, Home, Search } from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

export function NotFoundPage() {
  return (
    <PublicPageHeader />
    <div className="min-h-screen bg-background grid place-items-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="bg-gradient-cta text-primary-foreground mx-auto grid h-24 w-24 place-items-center rounded-3xl shadow-[var(--shadow-glow)]">
          <Compass className="h-10 w-10" />
        </div>
        <h1 className="text-heading mt-6 text-6xl font-black tracking-tight sm:text-7xl" style={{ fontFamily: "Inter, sans-serif" }}>404</h1>
        <h2 className="text-heading mt-2 text-xl font-bold">Page not found</h2>
        <p className="text-muted-foreground mt-2 text-sm">The page you're looking for doesn't exist or has moved. Let's get you back on track.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link to="/" className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]">
            <Home className="h-4 w-4" /> Go home
          </Link>
          <Link to="/search" search={{ q: "" }} className="border-primary text-primary inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border px-5 py-2.5 text-sm font-bold">
            <Search className="h-4 w-4" /> Browse salons
          </Link>
        </div>
      </div>
    </div>
  );
}
