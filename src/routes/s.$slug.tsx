import { createFileRoute } from "@tanstack/react-router";
import { SalonProfileRealPage } from "@/pages/public/SalonProfileRealPage";
import { salonBySlugQueryOptions } from "@/lib/salons.queries";

export const Route = createFileRoute("/s/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(salonBySlugQueryOptions(params.slug)),
  head: ({ loaderData }) => {
    const salon = (
      loaderData as
        | {
            salon: {
              name: string;
              description?: string | null;
              location?: string | null;
              image_url?: string | null;
            };
          }
        | undefined
    )?.salon;
    const title = salon ? `${salon.name} — Book on Nexora` : "Salon — Nexora";
    const desc =
      salon?.description ??
      (salon
        ? `Book ${salon.name}${salon.location ? ` in ${salon.location}` : ""}. 25% advance, rest at the salon.`
        : "Discover and book salons near you on Nexora.");
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(salon?.image_url ? [{ property: "og:image", content: salon.image_url }] : []),
      ],
    };
  },
  component: SalonProfileRealPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-heading text-2xl font-black">Salon not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-heading text-2xl font-black">Salon not found</h1>
    </div>
  ),
});
