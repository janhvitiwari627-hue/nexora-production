import { createFileRoute } from "@tanstack/react-router";
import DownloadAppPage from "@/pages/public/DownloadAppPage";

export const Route = createFileRoute("/download-app")({
  head: () => ({
    meta: [
      { title: "Download Nexora Customer App — Book Salons Instantly" },
      { name: "description", content: "Install the Nexora Customer App to discover salons, book in seconds, scan-and-pay, and earn rewards. Works on Android, iOS and desktop." },
      { property: "og:title", content: "Download Nexora Customer App" },
      { property: "og:description", content: "Discover salons, book instantly, pay via QR, and earn rewards — the Nexora Customer App installs straight to your home screen." },
    ],
  }),
  component: DownloadAppPage,
});
