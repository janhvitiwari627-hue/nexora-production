import { WebsiteRenderer } from "@/components/whiteLabelWebsite/WebsiteRenderer";
import { WhiteLabelHeader } from "@/components/whiteLabelWebsite/WhiteLabelHeader";
import { WhiteLabelFooter } from "@/components/whiteLabelWebsite/WhiteLabelFooter";
import { ViralGrowthWidget } from "@/components/whiteLabelWebsite/ViralGrowthWidget";
import { MOCK_SHOP, MOCK_CONFIG } from "@/components/whiteLabelWebsite/types";
import { getTemplate } from "@/components/whiteLabelWebsite/templates";

export function WhiteLabelWebsitePage({ slug: _slug }: { slug?: string }) {
  // In production, fetch shop + config by slug. For now, use mock data.
  const shop = MOCK_SHOP;
  const config = MOCK_CONFIG;
  const template = getTemplate(config.template);

  return (
    <div style={{ fontFamily: template.font }}>
      <WhiteLabelHeader shop={shop} template={template} />
      <main className="pb-20 md:pb-0">
        <WebsiteRenderer shop={shop} config={config} />
      </main>
      <WhiteLabelFooter shop={shop} config={config} template={template} />
      <ViralGrowthWidget />
    </div>
  );
}
