import type { ShopData } from "../types";
import { SectionTitle } from "./WServices";
import { Instagram } from "lucide-react";

export function WInstagramFeed({ shop }: { shop: ShopData }) {
  if (!shop.instagramHandle) return null;
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle>@{shop.instagramHandle}</SectionTitle>
      <div className="mt-8 grid gap-2 md:grid-cols-6">
        {shop.gallery.slice(0, 6).map((g, i) => (
          <a
            key={i}
            href={`https://instagram.com/${shop.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden"
          >
            <img
              src={g.url}
              alt={`Instagram ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Instagram className="h-6 w-6 text-white" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
