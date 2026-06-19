import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/public/HomePage";
import { shopsQueryOptions } from "@/lib/shops.queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora — Book salons, spas & barbers in Jaipur" },
      {
        name: "description",
        content:
          "Discover top-rated salons, spas and barbershops in Jaipur. Instant booking, member rewards, and exclusive offers on Nexora SalonOS.",
      },
      { property: "og:title", content: "Nexora SalonOS" },
      {
        property: "og:description",
        content: "Discover, book, and grow with the operating system for modern salons.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(shopsQueryOptions({ limit: 6 })),
  component: HomePage,
});
