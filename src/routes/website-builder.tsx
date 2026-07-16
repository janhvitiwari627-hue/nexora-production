import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { PlatformInfoPage } from "@/pages/public/PlatformInfoPage";

export const Route = createFileRoute("/website-builder")({
  head: () => ({ meta: [{ title: "Salon Website Builder — Nexora" }] }),
  component: WebsiteBuilderPage,
});

function WebsiteBuilderPage() {
  return (
    <PlatformInfoPage
      eyebrow="Owner Website Builder"
      title="Salon ki complete website, simple forms se."
      description="No coding, no drag-and-drop complexity. Owner salon details, services, prices, gallery, timings, contact and theme colour edit karta hai; layout clean and consistent rehta hai."
      icon={Globe2}
      action={{ label: "Create salon website", to: "/create-shop-website" }}
      steps={[
        {
          title: "Choose a template",
          description: "Salon category ke liye ready-made mobile-friendly design select karein.",
        },
        {
          title: "Add salon details",
          description:
            "Name, description, contact, address, timings and home service settings fill karein.",
        },
        {
          title: "Add services and media",
          description: "Prices, duration, logo, cover image and gallery upload karein.",
        },
        {
          title: "Preview and publish",
          description: "Final website check karke public salon link publish karein.",
        },
      ]}
      notes={[
        "Website tab owner dashboard mein hi rahega; it is not mixed with public customer pages.",
        "Only published websites public visitors ko दिखाई देंगी.",
        "Template layout fixed and easy रहेगा; owner theme colour and content edit कर सकता है.",
      ]}
    />
  );
}
