import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";

const HELP = {
  "Getting Started": [
    {
      q: "How do I create an account?",
      a: "Tap Sign Up on the homepage, enter your mobile number, and verify the OTP.",
    },
    { q: "Is Nexora free for customers?", a: "Yes — discovering and booking is completely free." },
  ],
  Bookings: [
    {
      q: "How do I cancel a booking?",
      a: "Go to Dashboard → Bookings → select your booking → Cancel. Refund policy varies by salon.",
    },
    {
      q: "What if I'm running late?",
      a: "Most salons offer a 10-minute grace. WhatsApp the salon if you'll be later.",
    },
  ],
  "Payments & Refunds": [
    {
      q: "Which payment methods are accepted?",
      a: "UPI, all major cards, wallets, and pay-at-salon for select shops.",
    },
    {
      q: "When will I get my refund?",
      a: "Refunds reach your account in 3–7 business days after approval.",
    },
  ],
  Memberships: [
    {
      q: "Can I upgrade my membership?",
      a: "Yes, anytime from Dashboard → Membership. You pay only the difference.",
    },
    {
      q: "How do I cancel?",
      a: "Cancel anytime in Settings. You retain benefits till the end of your billing cycle.",
    },
  ],
};

export function HelpPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return HELP;
    const out: Record<string, { q: string; a: string }[]> = {};
    for (const [cat, items] of Object.entries(HELP)) {
      const matched = items.filter(
        (it) =>
          it.q.toLowerCase().includes(q.toLowerCase()) ||
          it.a.toLowerCase().includes(q.toLowerCase()),
      );
      if (matched.length) out[cat] = matched;
    }
    return out;
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-12">
      <header className="text-center">
        <h1 className="text-heading text-3xl font-bold md:text-4xl">How can we help?</h1>
        <p className="text-muted-foreground mt-2">Search our help center or chat with us.</p>
      </header>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          className="pl-9 h-12 text-base"
          placeholder="Search help articles"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {Object.entries(filtered).map(([cat, items]) => (
          <Card key={cat}>
            <CardContent className="p-2">
              <Accordion type="single" collapsible>
                <AccordionItem value={cat} className="border-0">
                  <AccordionTrigger className="px-4 text-base font-semibold">
                    {cat}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="single" collapsible className="px-2">
                      {items.map((it, i) => (
                        <AccordionItem key={i} value={`${cat}-${i}`}>
                          <AccordionTrigger className="text-sm">{it.q}</AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            {it.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
        {Object.keys(filtered).length === 0 && (
          <p className="text-muted-foreground py-12 text-center">
            No results. Try different keywords.
          </p>
        )}
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <div className="font-semibold">Still need help?</div>
            <div className="text-muted-foreground text-sm">
              Chat with our team — usually replies in &lt; 5 minutes.
            </div>
          </div>
          <Button onClick={() => toast("Live chat is starting…")}>
            <MessageCircle className="h-4 w-4" /> Start Live Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
