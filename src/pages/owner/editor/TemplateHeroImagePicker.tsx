import { Check, ImageIcon } from "lucide-react";
import { TEMPLATE_CATALOG } from "./templateCatalog";

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=78`;

const READY_IMAGES: Record<string, string[]> = {
  "Hair Salon": [
    image("photo-1560066984-138dadb4c035"),
    image("photo-1521590832167-7bcbfaa6381f"),
    image("photo-1522337360788-8b13dee7a37e"),
    image("photo-1503951914875-452162b0f3f1"),
    image("photo-1621605815971-fbc98d665033"),
  ],
  "Beauty Parlour": [
    image("photo-1487412947147-5cebf100ffc2"),
    image("photo-1512496015851-a90fb38ba796"),
    image("photo-1524504388940-b1c1722653e1"),
    image("photo-1604654894610-df63bc536371"),
    image("photo-1610992015732-2449b76344bc"),
  ],
  Spa: [
    image("photo-1540555700478-4be289fbecef"),
    image("photo-1600334089648-b0d9d3028eb2"),
    image("photo-1596178065887-1198b6148b2b"),
    image("photo-1544161515-4ab6ce6db874"),
    image("photo-1600334129128-685c5582fd35"),
  ],
  Tattoo: [
    image("photo-1565058379802-bbe93b2f703a"),
    image("photo-1542727365-19732a80dcfd"),
    image("photo-1598371839696-5c5bb00bdc28"),
    image("photo-1585747860715-2ba37e788b70"),
    image("photo-1503951914875-452162b0f3f1"),
  ],
  "Nail Art": [
    image("photo-1604654894610-df63bc536371"),
    image("photo-1610992015732-2449b76344bc"),
    image("photo-1519014816548-bf5fe059798b"),
    image("photo-1487412947147-5cebf100ffc2"),
    image("photo-1512496015851-a90fb38ba796"),
  ],
  Massage: [
    image("photo-1544161515-4ab6ce6db874"),
    image("photo-1600334129128-685c5582fd35"),
    image("photo-1519823551278-64ac92734fb1"),
    image("photo-1540555700478-4be289fbecef"),
    image("photo-1600334089648-b0d9d3028eb2"),
  ],
  Barber: [
    image("photo-1503951914875-452162b0f3f1"),
    image("photo-1621605815971-fbc98d665033"),
    image("photo-1585747860715-2ba37e788b70"),
    image("photo-1560066984-138dadb4c035"),
    image("photo-1521590832167-7bcbfaa6381f"),
  ],
};

export function TemplateHeroImagePicker({
  templateKey,
  value,
  onSelect,
}: {
  templateKey: string | null;
  value: string;
  onSelect: (url: string) => void;
}) {
  const template = TEMPLATE_CATALOG.find((item) => item.key === templateKey);
  const category = template?.category ?? "Hair Salon";
  const choices = READY_IMAGES[category] ?? READY_IMAGES["Hair Salon"];

  return (
    <section className="space-y-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex items-start gap-2">
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-heading">Template Ready Images</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            अपनी photo नहीं है तो {category} के लिए नीचे से कोई एक image चुनें। बाद में इसे कभी भी
            बदल सकते हैं।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {choices.map((url, index) => {
          const selected = value === url;
          return (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                selected
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-transparent hover:border-primary/60"
              }`}
              aria-label={`Choose ready image ${index + 1}`}
              aria-pressed={selected}
            >
              <img
                src={url}
                alt={`${category} ready choice ${index + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute bottom-1 left-1 grid h-5 w-5 place-items-center rounded-full bg-black/65 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              {selected && (
                <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
