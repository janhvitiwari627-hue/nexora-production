import type { ShopData } from "../types";
import { SectionTitle } from "./WServices";
import { Play } from "lucide-react";

export function WYouTubeFeed({ shop }: { shop: ShopData }) {
  if (!shop.youtubeChannel) return null;
  return (
    <section className="bg-black px-6 py-16 text-white md:px-12">
      <SectionTitle>Watch Us</SectionTitle>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted/20 relative grid aspect-video place-items-center overflow-hidden rounded-xl"
          >
            <img
              src={shop.gallery[i]?.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <Play className="relative z-10 h-12 w-12 fill-white text-white" />
          </div>
        ))}
      </div>
    </section>
  );
}
