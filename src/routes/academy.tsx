import { createFileRoute } from "@tanstack/react-router";
import { AcademyPage } from "@/pages/public/AcademyPage";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "Nexora Academy — Beauty certifications by India's best" },
      { name: "description", content: "Industry-recognised certifications in hair, skin, makeup & spa." },
    ],
  }),
  component: AcademyPage,
});
