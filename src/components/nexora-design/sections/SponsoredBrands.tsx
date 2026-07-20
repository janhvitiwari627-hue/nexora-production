import { useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import FadeIn from "../FadeIn";

type Brand = {
  id: string;
  name: string;
  initials: string;
  category: string;
  city: string;
  description: string;
  story: string;
  banner: string;
  products: { name: string; note: string }[];
  salons: string[];
  contact: { website: string; email: string; phone: string };
};

const BRANDS: Brand[] = [
  {
    id: "luxelocks",
    name: "LuxeLocks Pro",
    initials: "LP",
    category: "Hair Care",
    city: "New York",
    description: "Salon-grade hair repair and styling formulas trusted by stylists worldwide.",
    story:
      "LuxeLocks Pro is built on twenty years of trichology research, formulated to give professional stylists tools that protect hair while delivering runway-grade finishes.",
    banner:
      "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
    products: [
      { name: "Bond Repair Serum", note: "Part of the LuxeLocks professional line." },
      { name: "Volume Mousse", note: "Part of the LuxeLocks professional line." },
      { name: "Color Lock Mask", note: "Part of the LuxeLocks professional line." },
      { name: "Salon Backbar", note: "Part of the LuxeLocks professional line." },
    ],
    salons: ["The Glam House", "Royal Wellness Spa"],
    contact: {
      website: "example.com/luxelocks",
      email: "hello@luxelocks.com",
      phone: "+1 212 555 0102",
    },
  },
  {
    id: "dermaelite",
    name: "DermaElite",
    initials: "D",
    category: "Skin Care",
    city: "Los Angeles",
    description: "Dermatologist-developed skin science for radiant, healthy complexions.",
    story:
      "DermaElite combines clinical actives with sensorial rituals, created for modern spas and skin clinics. Through our partnership with Nexora SalonOS, DermaElite is featured in premium salons across Los Angeles and beyond.",
    banner:
      "https://images.pexels.com/photos/3993454/pexels-photo-3993454.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
    products: [
      { name: "Signature Formula", note: "Part of the DermaElite professional line." },
      { name: "Professional Kit", note: "Part of the DermaElite professional line." },
      { name: "Retail Travel Size", note: "Part of the DermaElite professional line." },
      { name: "Salon Backbar", note: "Part of the DermaElite professional line." },
    ],
    salons: ["Glow Derma Bar", "Skin Sanctuary"],
    contact: {
      website: "example.com/dermaelite",
      email: "hello@dermaelite.com",
      phone: "+1 310 555 0123",
    },
  },
  {
    id: "stylecraft",
    name: "StyleCraft Tools",
    initials: "ST",
    category: "Professional Salon Products",
    city: "Chicago",
    description: "Precision tools and ergonomic equipment designed for busy salons.",
    story:
      "StyleCraft engineers premium scissors, brushes and clippers built to last through thousands of services, with weight balance designed alongside working stylists.",
    banner:
      "https://images.pexels.com/photos/3993459/pexels-photo-3993459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
    products: [
      { name: "Precision Shears", note: "Part of the StyleCraft professional line." },
      { name: "Pro Blow Brush Set", note: "Part of the StyleCraft professional line." },
      { name: "Cordless Clippers", note: "Part of the StyleCraft professional line." },
      { name: "Salon Trolley", note: "Part of the StyleCraft professional line." },
    ],
    salons: ["Ink Culture Studio", "Urban Fade Co."],
    contact: {
      website: "example.com/stylecraft",
      email: "hello@stylecraft.com",
      phone: "+1 312 555 0144",
    },
  },
  {
    id: "serenespa",
    name: "SereneSpa Organics",
    initials: "SO",
    category: "Spa Products",
    city: "Miami",
    description: "Botanical oils and wellness rituals that turn treatments into escapes.",
    story:
      "SereneSpa Organics blends Ayurvedic tradition with modern aromatherapy, crafted in small batches for premium spas worldwide.",
    banner:
      "https://images.pexels.com/photos/3865711/pexels-photo-3865711.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
    products: [
      { name: "Calming Body Oil", note: "Part of the SereneSpa professional line." },
      { name: "Ritual Candle Set", note: "Part of the SereneSpa professional line." },
      { name: "Hammam Scrub", note: "Part of the SereneSpa professional line." },
      { name: "Aromatherapy Mist", note: "Part of the SereneSpa professional line." },
    ],
    salons: ["Royal Wellness Spa", "Lotus Retreat"],
    contact: {
      website: "example.com/serenespa",
      email: "hello@serenespa.com",
      phone: "+1 305 555 0188",
    },
  },
  {
    id: "colorpop",
    name: "ColorPop Nails",
    initials: "CN",
    category: "Nail Art Products",
    city: "Austin",
    description: "Long-wear gel systems and nail art kits made for studio creativity.",
    story:
      "ColorPop Nails launched from an indie nail studio in Austin and is now stocked by hundreds of pro nail artists across the country.",
    banner:
      "https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
    products: [
      { name: "Gel Color Library", note: "Part of the ColorPop professional line." },
      { name: "Nail Art Kit", note: "Part of the ColorPop professional line." },
      { name: "Studio Base & Top", note: "Part of the ColorPop professional line." },
      { name: "Care Treatment", note: "Part of the ColorPop professional line." },
    ],
    salons: ["Nailed It Studio", "Polish Lab"],
    contact: {
      website: "example.com/colorpop",
      email: "hello@colorpop.com",
      phone: "+1 512 555 0177",
    },
  },
  {
    id: "nexora-collective",
    name: "Nexora Collective",
    initials: "NC",
    category: "Beauty Brand Story",
    city: "Jaipur",
    description: "A curated collective of independent beauty brands powered by Nexora SalonOS.",
    story:
      "The Nexora Collective showcases independent makers and master stylists building the next chapter of premium beauty in India.",
    banner:
      "https://images.pexels.com/photos/3997387/pexels-photo-3997387.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900",
    products: [
      { name: "Capsule Collection", note: "Part of the Nexora Collective line." },
      { name: "Studio Edition", note: "Part of the Nexora Collective line." },
      { name: "Travel Ritual Set", note: "Part of the Nexora Collective line." },
      { name: "Pro Backbar", note: "Part of the Nexora Collective line." },
    ],
    salons: ["The Glam House", "Lotus Retreat"],
    contact: {
      website: "example.com/nexora-collective",
      email: "hello@nexora.com",
      phone: "+91 99999 00000",
    },
  },
];

export default function SponsoredBrands() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Brand | null>(null);

  const scroll = (dir: "l" | "r") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "l" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#F6F7F9] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Trusted Beauty Industry Partners
          </h2>
          <p className="mt-3 max-w-2xl text-slate-500">
            Discover leading beauty and personal care brands trusted by salons, spas and beauty
            professionals.
          </p>
        </FadeIn>

        <div className="relative mt-8">
          <div
            ref={scrollerRef}
            className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4"
          >
            {BRANDS.map((b, i) => (
              <FadeIn key={b.id} delay={i * 0.05}>
                <button
                  type="button"
                  onClick={() => setActive(b)}
                  className="group flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_24px_48px_-20px_rgba(15,23,42,0.18)] md:w-[300px]"
                >
                  <div className="flex items-center justify-between px-5 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {b.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-500">{b.category}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Sponsored
                    </span>
                  </div>

                  <div className="mt-4 aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={b.banner}
                      alt={b.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-5 py-4">
                    <p className="line-clamp-2 text-sm text-slate-600">{b.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-indigo-600">{b.city}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 transition group-hover:gap-2">
                        Explore Brand <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => scroll("l")}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("r")}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <BrandModal brand={active} onClose={() => setActive(null)} />
    </section>
  );
}

type TabKey = "story" | "products" | "salons" | "contact";

function BrandModal({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const [tab, setTab] = useState<TabKey>("story");
  if (!brand) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "story", label: "Story" },
    { key: "products", label: "Products" },
    { key: "salons", label: "Salons" },
    { key: "contact", label: "Contact" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img src={brand.banner} alt={brand.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700 backdrop-blur">
            Sponsored
          </span>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white ring-4 ring-white/30">
              {brand.initials}
            </div>
            <div className="text-white">
              <div className="text-xl font-bold">{brand.name}</div>
              <div className="text-sm text-white/80">{brand.category}</div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  tab === t.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-5 min-h-[160px] text-sm text-slate-600">
            {tab === "story" && <p className="leading-relaxed">{brand.story}</p>}

            {tab === "products" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {brand.products.map((p) => (
                  <div key={p.name} className="rounded-xl bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{p.note}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === "salons" && (
              <div className="space-y-2">
                {brand.salons.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    <MapPin className="h-4 w-4 text-slate-400" /> {s}
                  </div>
                ))}
              </div>
            )}

            {tab === "contact" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="h-4 w-4 text-slate-400" /> {brand.contact.website}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" /> {brand.contact.email}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400" /> {brand.contact.phone}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" /> Visit Brand
            </button>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
            >
              View Partner Salons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
