import { useRef, useState } from "react";
import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";

export function WBeforeAfter({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const item = shop.beforeAfter[0];
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  if (!item) return null;
  return (
    <section className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Before / After</SectionTitle>
      <div className="mx-auto mt-8 max-w-3xl">
        <div
          ref={ref}
          className="relative aspect-video w-full select-none overflow-hidden"
          style={{ borderRadius: template.radius }}
          onMouseMove={e => {
            if (!ref.current) return;
            const r = ref.current.getBoundingClientRect();
            setPos(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
          }}
        >
          <img src={item.after} alt="After" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
            <img src={item.before} alt="Before" className="h-full w-full object-cover" style={{ width: ref.current?.offsetWidth, minWidth: ref.current?.offsetWidth }} />
          </div>
          <div className="absolute top-0 bottom-0 w-1 bg-white shadow" style={{ left: `${pos}%` }} />
        </div>
        <div className="mt-3 text-center font-semibold">{item.title}</div>
      </div>
    </section>
  );
}
