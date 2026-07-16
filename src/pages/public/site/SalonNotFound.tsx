import { Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";

export function SalonNotFound({
  title = "Salon not found",
  description = "We couldn't find the salon you're looking for. The link may be broken or the website hasn't been published yet.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Go to Nexora
          </Link>
          <Link
            to="/search"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Browse salons
          </Link>
        </div>
      </div>
    </main>
  );
}
