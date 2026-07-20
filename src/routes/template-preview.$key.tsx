import { createFileRoute, useParams } from "@tanstack/react-router";
import { WhiteLabelWebsitePage } from "@/pages/whiteLabelWebsite/WhiteLabelWebsitePage";
import { getMockBusinesses } from "@/lib/mock-businesses";
import { normalizeTemplateKey, TEMPLATES } from "@/components/whiteLabelWebsite/templates";
import { BookingMockDevToggle } from "@/components/dev/BookingMockDevToggle";

export const Route = createFileRoute("/template-preview/$key")({
  head: ({ params }) => {
    const tpl = TEMPLATES[normalizeTemplateKey(params.key)];
    return {
      meta: [
        { title: `${tpl.name} — Live Template Preview · Nexora` },
        { name: "description", content: `Live demo of the ${tpl.name} salon website template.` },
      ],
    };
  },
  component: PreviewRoute,
});

function PreviewRoute() {
  const { key } = useParams({ from: "/template-preview/$key" });
  const tplKey = normalizeTemplateKey(key);
  // Pick a sensible demo business per template flavor.
  const all = getMockBusinesses();
  const pickFor: Record<string, string[]> = {
    "royal-luxe": ["Spa", "Luxury Salon", "Premium Salon", "Salon"],
    "modern-salon": ["Barber Shop", "Salon"],
    "professional-beauty": ["Makeup Studio", "Nail Studio", "Beauty Parlour", "Salon"],
  };
  const cats = pickFor[tplKey] ?? [];
  const demo = all.find((b) => cats.includes(b.category)) ?? all[0];
  const slug = demo?.slug ?? "demo";
  return (
    <>
      <WhiteLabelWebsitePage slug={slug} routeSearch={{ t: tplKey, preview: 1 }} />
      <BookingMockDevToggle slug={slug} />
    </>
  );
}
