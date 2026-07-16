import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, IndianRupee } from "lucide-react";
import { salonBySlugQueryOptions } from "@/lib/salons.queries";
import {
  PublishedSiteShell,
  PublishedSiteUnavailable,
} from "@/pages/public/site/PublishedSiteShell";

export const Route = createFileRoute("/site/$slug_/services")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(salonBySlugQueryOptions(params.slug)),
  head: ({ params }) => ({
    meta: [{ title: `Services · ${params.slug} · Nexora` }],
  }),
  component: PublishedServicesPage,
});

function PublishedServicesPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(salonBySlugQueryOptions(slug));
  if (!data?.salon) return <PublishedSiteUnavailable />;

  return (
    <PublishedSiteShell slug={slug} salonName={data.salon.name}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-violet-700">Services & pricing</p>
          <h1 className="mt-1 text-3xl font-bold">Choose your service</h1>
          <p className="mt-2 text-slate-600">
            Prices and duration are provided directly by {data.salon.name}.
          </p>
        </div>

        {data.services.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white p-8 text-center text-slate-600">
            No services are available for online booking right now.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.services.map((service) => (
              <article key={service.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">{service.name}</h2>
                {service.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{service.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="inline-flex items-center font-bold">
                    <IndianRupee className="h-4 w-4" />
                    {Number(service.price).toLocaleString("en-IN")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Clock className="h-4 w-4" />
                    {service.duration_minutes ?? 30} min
                  </span>
                </div>
                <Link
                  to="/site/$slug_/book"
                  params={{ slug }}
                  search={{ service: service.id }}
                  className="mt-5 inline-flex w-full justify-center rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
                >
                  Book this service
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </PublishedSiteShell>
  );
}
