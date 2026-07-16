import { Link } from "@tanstack/react-router";
import { ArrowLeft, Scissors } from "lucide-react";

export function PublishedSiteShell({
  slug,
  salonName,
  children,
}: {
  slug: string;
  salonName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/site/$businessSlug"
            params={{ businessSlug: slug }}
            className="inline-flex min-w-0 items-center gap-3 font-semibold"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
              <Scissors className="h-5 w-5" />
            </span>
            <span className="truncate">{salonName}</span>
          </Link>
          <Link
            to="/site/$businessSlug"
            params={{ businessSlug: slug }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Salon website
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}

export function PublishedSiteUnavailable() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">This salon website is not available</h1>
        <p className="mt-2 text-sm text-slate-600">
          The owner has not published this website, or the link is incorrect.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go to Nexora
        </Link>
      </div>
    </main>
  );
}
