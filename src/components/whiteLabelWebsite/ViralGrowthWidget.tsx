import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function ViralGrowthWidget() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="fixed bottom-24 left-5 z-30 max-w-[280px] rounded-2xl border bg-white p-4 shadow-2xl md:bottom-8">
      <button className="absolute right-2 top-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3">
        <div className="bg-gradient-to-br from-primary to-accent grid h-10 w-10 place-items-center rounded-full text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-sm">
          <div className="font-semibold">Build Your Own Salon Website</div>
          <p className="text-muted-foreground text-xs mt-0.5">Get a free white-label site like this in minutes.</p>
          <a href="/for-owners" className="text-primary mt-2 inline-block text-xs font-semibold hover:underline">Start free with Nexora →</a>
        </div>
      </div>
    </div>
  );
}
