import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { WebsiteRenderer } from "@/components/whiteLabelWebsite/WebsiteRenderer";
import { WhiteLabelHeader } from "@/components/whiteLabelWebsite/WhiteLabelHeader";
import { WhiteLabelFooter } from "@/components/whiteLabelWebsite/WhiteLabelFooter";
import { ViralGrowthWidget } from "@/components/whiteLabelWebsite/ViralGrowthWidget";
import { MOCK_SHOP, MOCK_CONFIG, type WebsiteConfig } from "@/components/whiteLabelWebsite/types";
import { getTemplate, TEMPLATE_KEYS, TEMPLATES } from "@/components/whiteLabelWebsite/templates";
import { Paintbrush } from "lucide-react";

type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export function WhiteLabelWebsitePage({ slug: _slug }: { slug?: string }) {
  const shop = MOCK_SHOP;
  const search = useSearchSafe();
  const navigate = useNavigateSafe();

  const requested = (search?.t as TemplateKey | undefined) ?? MOCK_CONFIG.template;
  const templateKey: TemplateKey = (TEMPLATE_KEYS as readonly string[]).includes(requested)
    ? (requested as TemplateKey)
    : "RoyalLuxe";

  const config: WebsiteConfig = { ...MOCK_CONFIG, template: templateKey };
  const template = getTemplate(templateKey);

  const setTemplate = (key: TemplateKey) => {
    if (navigate) navigate({ to: ".", search: (prev) => ({ ...(prev as Record<string, unknown>), t: key }), replace: true } as never);
  };

  return (
    <div style={{ fontFamily: template.font, backgroundColor: template.colors.bg, color: template.colors.text }}>
      <WhiteLabelHeader shop={shop} template={template} />
      <main className="pb-20 md:pb-0">
        <TemplateSwitcher current={templateKey} onChange={setTemplate} />
        <WebsiteRenderer shop={shop} config={config} />
      </main>
      <WhiteLabelFooter shop={shop} config={config} template={template} />
      <ViralGrowthWidget />
    </div>
  );
}

function useSearchSafe() {
  try { return useSearch({ strict: false }) as Record<string, unknown>; } catch { return undefined; }
}
function useNavigateSafe() {
  try { return useNavigate(); } catch { return undefined; }
}

function TemplateSwitcher({
  current, onChange,
}: { current: TemplateKey; onChange: (k: TemplateKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-[60px] z-20 mx-auto flex max-w-7xl items-center justify-end px-6 py-2 md:px-10">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted"
        >
          <Paintbrush className="h-3.5 w-3.5" />
          Template: {TEMPLATES[current].name}
        </button>
        {open && (
          <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border bg-white shadow-lg">
            {TEMPLATE_KEYS.map((k) => {
              const t = TEMPLATES[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => { onChange(k); setOpen(false); }}
                  className={`flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-muted ${current === k ? "bg-muted" : ""}`}
                >
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 rounded-full border" style={{ backgroundColor: t.colors.primary, borderColor: t.colors.secondary }} />
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="text-muted-foreground block text-[11px]">{t.tagline}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
