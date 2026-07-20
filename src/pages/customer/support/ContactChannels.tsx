import { MessageCircle, Phone } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_PREFILL } from "./mockSupport";

export function ContactChannels() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Live chat placeholder */}
      <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 grid h-10 w-10 place-items-center rounded-xl">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-heading text-base font-bold">Live chat</h3>
            <p className="text-muted-foreground text-xs">Typical reply under 5 minutes</p>
          </div>
        </div>
        <div className="border-border bg-muted/30 mt-4 grid place-items-center rounded-xl border border-dashed py-10 text-center">
          {/* Iframe slot for Crisp / Intercom / Tawk widget */}
          <iframe
            title="Live chat"
            srcDoc="<div style='font-family:system-ui;color:#64748b;padding:24px;text-align:center'>Live chat widget loads here<br/><small>(Crisp / Intercom embed slot)</small></div>"
            className="h-32 w-full border-0"
          />
        </div>
      </section>

      {/* WhatsApp + call */}
      <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-5 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 grid h-10 w-10 place-items-center rounded-xl">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-heading text-base font-bold">Talk to us directly</h3>
            <p className="text-muted-foreground text-xs">WhatsApp or phone — your choice</p>
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <a
            href="tel:+918000012345"
            className="border-border bg-background hover:bg-accent inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition"
          >
            <Phone className="h-4 w-4" />
            +91 80000 12345
          </a>
          <p className="text-muted-foreground mt-1 text-center text-xs">Mon–Sat, 9 AM – 9 PM IST</p>
        </div>
      </section>
    </div>
  );
}
