import { createFileRoute } from "@tanstack/react-router";
import { ShopProfilePage } from "@/pages/public/ShopProfilePage";
import { MOCK_SHOP } from "@/pages/public/shop/mockShop";

export const Route = createFileRoute("/shop/$slug")({
  head: () => ({
    meta: [
      { title: `${MOCK_SHOP.name} — ${MOCK_SHOP.category} in ${MOCK_SHOP.city}` },
      { name: "description", content: MOCK_SHOP.tagline },
      { property: "og:title", content: MOCK_SHOP.name },
      { property: "og:description", content: MOCK_SHOP.tagline },
      { property: "og:image", content: MOCK_SHOP.cover_images[0] },
    ],
  }),
  component: ShopProfilePage,
});
