import { ArrowRight, Clock, Gift, Sparkles, Tag } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  cta: string;
  expires: string;
  gradient: string;
  text: string;
  radius: string;
  icon: typeof Tag;
  iconPos: "left" | "right";
  titleSize: string;
};

const OFFERS: Offer[] = [
  {
    id: "first",
    title: "First Booking",
    subtitle: "New to Nexora? Welcome aboard.",
    discount: "40% OFF",
    cta: "Claim Offer",
    expires: "Expires Sun, 23:59",
    gradient: "linear-gradient(135deg, #635BFF 0%, #00D4FF 100%)",
    text: "#fff",
    radius: "32px 32px 32px 8px",
    icon: Gift,
    iconPos: "right",
    titleSize: "text-4xl md:text-5xl",
  },
  {
    id: "member",
    title: "Members Only",
    subtitle: "Gold & Platinum tier exclusive.",
    discount: "₹500 OFF",
    cta: "Use Code GOLD500",
    expires: "All weekend",
    gradient: "linear-gradient(135deg, #0A2540 0%, #1a1060 100%)",
    text: "#fff",
    radius: "8px 32px 8px 32px",
    icon: Sparkles,
    iconPos: "left",
    titleSize: "text-3xl md:text-4xl",
  },
  {
    id: "bridal",
    title: "Bridal Package",
    subtitle: "Glow up for the big day.",
    discount: "Up to 25%",
    cta: "View Packages",
    expires: "Wedding season",
    gradient: "linear-gradient(135deg, #FF6B9D 0%, #FFB36B 100%)",
    text: "#0A2540",
    radius: "24px",
    icon: Tag,
    iconPos: "right",
    titleSize: "text-2xl md:text-3xl",
  },
];

export function OffersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-heading md:text-4xl">
          Today's offers
        </h2>
        <p className="mt-2 text-muted-foreground">
          Stack savings with member perks and limited-time bundles.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {OFFERS.map((o) => {
          const Icon = o.icon;
          return (
            <article
              key={o.id}
              className="group relative flex flex-col overflow-hidden p-7 shadow-[0_20px_60px_-25px_rgba(10,37,64,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-25px_rgba(10,37,64,0.7)]"
              style={{ background: o.gradient, color: o.text, borderRadius: o.radius }}
            >
              <div
                className={`pointer-events-none absolute h-40 w-40 rounded-full bg-white/15 blur-2xl ${
                  o.iconPos === "right" ? "-top-12 -right-12" : "-bottom-12 -left-12"
                }`}
              />
              <div
                className={`relative flex items-start ${
                  o.iconPos === "right" ? "justify-between" : "flex-row-reverse justify-between"
                }`}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">
                    {o.title}
                  </p>
                  <p className="mt-1 text-sm opacity-85">{o.subtitle}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                  <Icon className="h-6 w-6" />
                </div>
              </div>

              <div className={`relative mt-6 font-black leading-none ${o.titleSize}`}>
                {o.discount}
              </div>

              <div className="relative mt-auto pt-6">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-white/95 px-5 py-2.5 text-sm font-bold text-heading transition hover:bg-white hover:gap-2.5"
                >
                  {o.cta} <ArrowRight className="h-4 w-4" />
                </button>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold opacity-80">
                  <Clock className="h-3.5 w-3.5" /> {o.expires}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
