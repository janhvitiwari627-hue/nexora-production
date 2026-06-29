import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(2, "Required").max(120),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => { if (i.path[0]) errs[i.path[0] as string] = i.message; });
      setErrors(errs); return;
    }
    setErrors({}); setSent(true);
  };

  return (
  <div className="min-h-screen bg-background">
    <PublicPageHeader />
      <section className="from-primary/10 to-accent/10 border-border border-b bg-gradient-to-br py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-heading text-4xl font-black md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>Get in touch</h1>
          <p className="text-muted-foreground mt-3 text-base md:text-lg">We usually reply within a few hours during business days.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-16 md:grid-cols-[1fr_320px] md:px-6">
        <form onSubmit={submit} className="border-border bg-card rounded-[var(--radius-card-lg)] border p-7 shadow-[var(--shadow-card)]">
          {sent ? (
            <div className="bg-success/10 text-success rounded-[var(--radius-card)] p-8 text-center font-bold">✓ Thanks! We'll get back to you shortly.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {([["name", "Your name", false], ["email", "Email address", false], ["subject", "Subject", true]] as [keyof typeof form, string, boolean][]).map(([k, l, full]) => (
                <label key={k} className={full ? "md:col-span-2" : ""}>
                  <span className="text-heading text-xs font-bold uppercase tracking-wider">{l}</span>
                  <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} maxLength={k === "email" ? 255 : 120} className="border-border bg-background mt-1 w-full rounded-[var(--radius-button)] border px-3 py-2.5 text-sm outline-none focus:border-primary" />
                  {errors[k] && <span className="text-danger mt-1 block text-xs font-semibold">{errors[k]}</span>}
                </label>
              ))}
              <label className="md:col-span-2">
                <span className="text-heading text-xs font-bold uppercase tracking-wider">Message</span>
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} className="border-border bg-background mt-1 w-full rounded-[var(--radius-button)] border px-3 py-2.5 text-sm outline-none focus:border-primary" />
                {errors.message && <span className="text-danger mt-1 block text-xs font-semibold">{errors.message}</span>}
              </label>
              <button type="submit" className="bg-gradient-cta text-primary-foreground md:col-span-2 mt-2 rounded-[var(--radius-button)] px-4 py-3 text-sm font-bold shadow-[var(--shadow-glow)]">Send message</button>
            </div>
          )}
        </form>

        <aside className="space-y-3">
          {[
            { icon: Phone, label: "Phone", value: "+91 80000 12345" },
            { icon: Mail, label: "Email", value: "hello@nexora.in" },
            { icon: MessageCircle, label: "WhatsApp", value: "+91 80000 12345" },
            { icon: MapPin, label: "Office", value: "Jaipur · Bengaluru · Mumbai" },
          ].map((c) => (
            <div key={c.label} className="border-border bg-card flex items-start gap-3 rounded-[var(--radius-card)] border p-4">
              <div className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl"><c.icon className="h-5 w-5" /></div>
              <div>
                <div className="text-muted-foreground text-[11px] uppercase tracking-wider">{c.label}</div>
                <div className="text-heading text-sm font-semibold">{c.value}</div>
              </div>
            </div>
          ))}
        </aside>
      </section>
    </div>
  );
}
