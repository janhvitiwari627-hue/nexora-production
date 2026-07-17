import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  Globe2,
  HelpCircle,
  LayoutTemplate,
  MonitorSmartphone,
  PencilLine,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STEPS = [
  {
    icon: LayoutTemplate,
    title: "1. Choose Template खोलें",
    description:
      "बाईं ओर Choose Template या Change Template दबाएँ। अपनी shop category—Hair Salon, Beauty Parlour, Spa, Tattoo, Nail Art, Massage या Barber—चुनें।",
  },
  {
    icon: Eye,
    title: "2. पहले Live Preview देखें",
    description:
      "Live Preview से design देखें। Desktop, Tablet और Mobile buttons से हर screen पर layout check करें। Preview देखने से current website नहीं बदलती।",
  },
  {
    icon: CheckCircle2,
    title: "3. Use This Template दबाएँ",
    description:
      "पसंद आने पर Use This Template और फिर Apply Template दबाएँ। आपका salon name, services, prices, contact details और uploaded media सुरक्षित रहेंगे।",
  },
  {
    icon: PencilLine,
    title: "4. Sections और Design edit करें",
    description:
      "Sections में Hero, About, Services, Gallery, Offers और Contact खोलकर details बदलें। Eye button से section दिखाएँ/छिपाएँ और drag करके order बदलें।",
  },
  {
    icon: MonitorSmartphone,
    title: "5. Live website check करें",
    description:
      "दाईं ओर preview आपके changes तुरंत दिखाता है। Publish करने से पहले Desktop, Tablet और Mobile तीनों view check करें।",
  },
  {
    icon: Save,
    title: "6. Save Draft रखें",
    description:
      "काम अधूरा हो तो Save Draft दबाएँ। History से पुराना version देखा या restore किया जा सकता है। Draft public website पर दिखाई नहीं देता।",
  },
  {
    icon: Globe2,
    title: "7. Final Save & Publish करें",
    description:
      "सब कुछ सही होने पर Final Save & Publish दबाएँ। इसके बाद customers आपकी updated shop website देख पाएँगे।",
  },
] as const;

export function TemplateUsageGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-heading">Template कैसे इस्तेमाल करें?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Template चुनने, edit करने और publish करने की पूरी shop owner guide देखें।
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full bg-background"
          onClick={() => setOpen(true)}
        >
          Complete Guide देखें
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-primary" /> Website Template Guide
            </DialogTitle>
            <DialogDescription>
              Shop owner के लिए template चुनने से website publish करने तक आसान प्रक्रिया।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {STEPS.map(({ icon: Icon, title, description }) => (
              <section key={title} className="flex gap-3 rounded-xl border bg-muted/20 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-heading">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </section>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4" /> आपका data सुरक्षित रहता है
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              Template बदलने से bookings, customers, services, prices, contact details या uploaded
              photos delete नहीं होते। केवल website का design और section layout बदलता है।
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
