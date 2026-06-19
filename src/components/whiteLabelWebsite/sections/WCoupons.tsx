import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Copy, Ticket } from "lucide-react";
import { toast } from "sonner";

export function WCoupons({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Coupons & Discounts</SectionTitle>
      <div className="mx-auto mt-8 grid max-w-3xl gap-3 md:grid-cols-2">
        {shop.coupons.map(c => (
          <div key={c.id} className="flex items-center justify-between bg-white p-4 shadow-sm" style={{ borderRadius: template.radius }}>
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5" style={{ color: template.colors.primary }} />
              <div>
                <div className="font-mono font-bold tracking-wider">{c.code}</div>
                <div className="text-muted-foreground text-xs">{c.discount}</div>
              </div>
            </div>
            <button className="text-primary hover:bg-muted rounded p-2" aria-label="Copy code" onClick={() => { navigator.clipboard?.writeText(c.code); toast.success("Code copied"); }}><Copy className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
