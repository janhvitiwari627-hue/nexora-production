import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS, FAQ_CATEGORIES, type FAQCategory } from "./mockSupport";

export function FAQSection() {
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<FAQCategory | "All">("All");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchCat = activeCat === "All" || f.category === activeCat;
      const matchQ =
        !term ||
        f.question.toLowerCase().includes(term) ||
        f.answer.toLowerCase().includes(term);
      return matchCat && matchQ;
    });
  }, [q, activeCat]);

  const grouped = useMemo(() => {
    const map = new Map<FAQCategory, typeof FAQS>();
    for (const f of filtered) {
      const arr = map.get(f.category) ?? [];
      arr.push(f);
      map.set(f.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-5 md:p-6">
      <h2 className="text-heading text-xl font-black">Help desk</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Find answers to common questions across bookings, payments, rewards and account.
      </p>

      <div className="border-border bg-background mt-4 flex items-center gap-2 rounded-full border px-3 py-2">
        <Search className="text-muted-foreground h-4 w-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search help articles…"
          className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["All", ...FAQ_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeCat === c
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {FAQ_CATEGORIES.filter((c) => grouped.has(c)).map((cat) => (
          <div key={cat}>
            <h3 className="text-heading mb-1 text-sm font-bold uppercase tracking-wide">
              {cat}
            </h3>
            <Accordion type="single" collapsible className="border-border rounded-xl border px-4">
              {(grouped.get(cat) ?? []).map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger className="text-heading text-left text-sm font-semibold">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No matches. Try different keywords or raise a ticket below.
          </p>
        )}
      </div>
    </section>
  );
}
