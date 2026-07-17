import { Check, PackagePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATE_CATALOG } from "./templateCatalog";

export type ReadyPackage = {
  name: string;
  price: string;
  description: string;
  duration: string;
};

const PACKAGES: Record<string, ReadyPackage[]> = {
  "Hair Salon": [
    {
      name: "Hair Makeover Combo",
      price: "2499",
      description: "Haircut, wash, spa and styling.",
      duration: "120 min",
    },
    {
      name: "Colour Care Package",
      price: "3999",
      description: "Global colour, wash and conditioning.",
      duration: "180 min",
    },
    {
      name: "Monthly Hair Care",
      price: "2999",
      description: "Two hair spas and two trims in one month.",
      duration: "30 days",
    },
  ],
  "Beauty Parlour": [
    {
      name: "Bridal Glow Package",
      price: "14999",
      description: "Bridal makeup, hair styling and draping.",
      duration: "Full session",
    },
    {
      name: "Party Ready Combo",
      price: "3499",
      description: "Party makeup, hairstyle and nail paint.",
      duration: "120 min",
    },
    {
      name: "Monthly Beauty Care",
      price: "2499",
      description: "Cleanup, waxing and manicure combo.",
      duration: "30 days",
    },
  ],
  Spa: [
    {
      name: "Relaxation Day",
      price: "4999",
      description: "Full body massage, steam and herbal tea.",
      duration: "180 min",
    },
    {
      name: "Couple Wellness",
      price: "7999",
      description: "Couple massage with private wellness session.",
      duration: "150 min",
    },
    {
      name: "Monthly Wellness",
      price: "5999",
      description: "Four relaxing spa sessions in one month.",
      duration: "30 days",
    },
  ],
  Tattoo: [
    {
      name: "Small Tattoo Package",
      price: "1999",
      description: "Custom small tattoo with basic aftercare kit.",
      duration: "60 min",
    },
    {
      name: "Custom Art Session",
      price: "5999",
      description: "Design consultation and custom tattoo session.",
      duration: "180 min",
    },
    {
      name: "Tattoo Aftercare",
      price: "999",
      description: "Aftercare review and premium healing kit.",
      duration: "14 days",
    },
  ],
  "Nail Art": [
    {
      name: "Gel Nail Combo",
      price: "1999",
      description: "Gel extensions with basic nail art.",
      duration: "120 min",
    },
    {
      name: "Luxury Hands & Feet",
      price: "2499",
      description: "Manicure, pedicure and gel polish.",
      duration: "150 min",
    },
    {
      name: "Monthly Nail Care",
      price: "2999",
      description: "Two nail sessions with one refill.",
      duration: "30 days",
    },
  ],
  Massage: [
    {
      name: "Stress Relief Package",
      price: "2499",
      description: "Full body massage with head and foot therapy.",
      duration: "90 min",
    },
    {
      name: "Pain Relief Plan",
      price: "4999",
      description: "Three focused therapeutic massage sessions.",
      duration: "3 sessions",
    },
    {
      name: "Monthly Relaxation",
      price: "5999",
      description: "Four full body massage sessions.",
      duration: "30 days",
    },
  ],
  Barber: [
    {
      name: "Royal Grooming Combo",
      price: "999",
      description: "Haircut, beard styling and head massage.",
      duration: "75 min",
    },
    {
      name: "Wedding Groom Package",
      price: "2499",
      description: "Premium haircut, beard, facial and styling.",
      duration: "150 min",
    },
    {
      name: "Monthly Grooming",
      price: "1499",
      description: "Two haircuts and two beard trims.",
      duration: "30 days",
    },
  ],
};

export function TemplatePackageSuggestions({
  templateKey,
  existingNames,
  onAdd,
}: {
  templateKey: string | null;
  existingNames: string[];
  onAdd: (item: ReadyPackage) => void;
}) {
  const category =
    TEMPLATE_CATALOG.find((item) => item.key === templateKey)?.category ?? "Hair Salon";
  const choices = PACKAGES[category] ?? PACKAGES["Hair Salon"];
  const added = new Set(existingNames.map((name) => name.trim().toLowerCase()));

  return (
    <section className="space-y-3 rounded-xl border bg-primary/5 p-3">
      <div className="flex items-start gap-2">
        <PackagePlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-heading">Ready Package Suggestions</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {category} के लिए package चुनें या नीचे अपना custom package बनाएँ।
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        {choices.map((item) => {
          const isAdded = added.has(item.name.toLowerCase());
          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-heading">{item.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  ₹{item.price} · {item.duration}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={isAdded ? "secondary" : "outline"}
                disabled={isAdded}
                onClick={() => onAdd(item)}
              >
                {isAdded ? (
                  <Check className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <Plus className="mr-1 h-3.5 w-3.5" />
                )}
                {isAdded ? "Added" : "Add"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
