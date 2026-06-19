import { createFileRoute } from "@tanstack/react-router";
import { OfflineFallbackPage } from "@/pages/static/OfflineFallbackPage";

export const Route = createFileRoute("/offline")({
  head: () => ({ meta: [{ title: "Offline — Nexora" }] }),
  component: () => <OfflineFallbackPage />,
});
