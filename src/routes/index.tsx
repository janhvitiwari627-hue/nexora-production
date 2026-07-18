import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/public/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora — Book salons, spas & barbers in Jaipur" },
      {
        name: "description",
        content:
          "Discover top-rated salons, spas and barbershops in Jaipur. Instant booking, member rewards, and exclusive offers on Nexora SalonOS.",
      },
      { property: "og:title", content: "Nexora — Book salons, spas & barbers in Jaipur" },
      {
        property: "og:description",
        content: "Discover top-rated salons, spas and barbershops in Jaipur. Instant booking, member rewards, and exclusive offers on Nexora SalonOS.",
      },
    ],
  }),
  component: HomePage,
});

