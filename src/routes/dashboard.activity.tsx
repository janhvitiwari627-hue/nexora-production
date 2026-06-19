import { createFileRoute } from "@tanstack/react-router";
import { MyActivityPage } from "@/pages/customer/MyActivityPage";

export const Route = createFileRoute("/dashboard/activity")({
  head: () => ({
    meta: [
      { title: "My Activity — Nexora" },
      {
        name: "description",
        content:
          "Visualise your bookings, spending, favourite shops and service preferences across Nexora.",
      },
      { property: "og:title", content: "Nexora My Activity" },
    ],
  }),
  component: MyActivityPage,
});
