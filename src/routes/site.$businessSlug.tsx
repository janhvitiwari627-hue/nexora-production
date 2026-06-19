import { createFileRoute, useParams } from "@tanstack/react-router";
import { WhiteLabelWebsitePage } from "@/pages/whiteLabelWebsite/WhiteLabelWebsitePage";

export const Route = createFileRoute("/site/$businessSlug")({
  head: () => ({ meta: [{ title: "Business Website" }] }),
  component: WhiteLabelRouteComponent,
});

function WhiteLabelRouteComponent() {
  const { businessSlug } = useParams({ from: "/site/$businessSlug" });
  return <WhiteLabelWebsitePage slug={businessSlug} />;
}
