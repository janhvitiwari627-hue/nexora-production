import { createFileRoute } from "@tanstack/react-router";
import { FavoriteShopsPage } from "@/pages/customer/FavoriteShopsPage";

export const Route = createFileRoute("/dashboard/favorites")({
  head: () => ({
    meta: [
      { title: "Your Shops — Saved, Visited & Recommended" },
      {
        name: "description",
        content:
          "Your saved favourites, recently visited shops, and AI-curated recommendations in one tap-friendly view.",
      },
      { property: "og:title", content: "Your Shops — Nexora" },
    ],
  }),
  component: FavoriteShopsPage,
});
