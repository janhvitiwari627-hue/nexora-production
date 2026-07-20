import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/public/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nexora — Beauty, beautifully organised" },
      {
        name: "description",
        content: "The story behind India's operating system for beauty businesses.",
      },
    ],
  }),
  component: AboutPage,
});
