import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FilterPills } from "@/components/shared/FilterPills";
import { Check, ExternalLink, ShieldCheck, Sparkles, Share2, Copy, Globe } from "lucide-react";
import { toast } from "sonner";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { TEMPLATES, TEMPLATE_CATEGORIES, CURRENT_TEMPLATE_ID, type Template } from "./templates/mockTemplates";

export function TemplateGalleryPage() {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(CURRENT_TEMPLATE_ID);
  const [pending, setPending] = useState<Template | null>(null);
  const { activeSalon } = useOwnerContext();
  const liveSlug = activeSalon?.slug ?? "your-salon";
  const liveUrl = typeof window !== "undefined"
    ? `${window.location.origin}/site/${liveSlug}`
    : `/site/${liveSlug}`;

  const copyLive = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      toast.success("Live site link copied", { description: liveUrl });
    } catch {
      toast.error("Copy failed", { description: liveUrl });
    }
  };

  const shareLive = async () => {
    const shareData = { title: activeSalon?.name ?? "My Salon", text: "Book with us on Nexora", url: liveUrl };
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: unknown }).share) {
      try { await (navigator as Navigator & { share: (d: typeof shareData) => Promise<void> }).share(shareData); return; } catch { /* fallthrough */ }
    }
    void copyLive();
  };

  const visible = useMemo(
    () => filter === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category.includes(filter)),
    [filter],
  );

  const confirm = () => {
    if (!pending) return;
    setActive(pending.id);
    toast.success(`Template changed to ${pending.name}`);
    setPending(null);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Choose a design for your booking website. Switch anytime — your content stays intact.
          </p>
        </div>
        <Card className="p-3 md:max-w-md w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Globe className="h-3.5 w-3.5" /> Your live website
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate text-xs bg-muted rounded px-2 py-1.5">{liveUrl}</code>
            <Button size="sm" variant="outline" onClick={copyLive} aria-label="Copy live link">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={shareLive} aria-label="Share live link">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button size="sm" variant="ghost" asChild aria-label="Open live site">
              <a href={liveUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
            </Button>
          </div>
        </Card>
      </div>


      <FilterPills options={TEMPLATE_CATEGORIES} value={filter} onChange={setFilter} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => {
          const isActive = t.id === active;
          return (
            <Card key={t.id} className="overflow-hidden group relative flex flex-col">
              {isActive && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-emerald-600 text-white gap-1">
                    <Check className="h-3 w-3" /> Current
                  </Badge>
                </div>
              )}
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={t.screenshot}
                  alt={t.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {t.category.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-5 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={t.demoUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={isActive}
                    onClick={() => setPending(t)}
                  >
                    {isActive ? "Selected" : "Select Template"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Change template?
            </DialogTitle>
            <DialogDescription>
              You're switching to <b>{pending?.name}</b>. The page layout will reset to the new
              template's structure.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 p-3 flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-emerald-700 dark:text-emerald-300">
                Your content is safe
              </div>
              <p className="text-muted-foreground mt-0.5">
                Services, staff, gallery photos, reviews, SEO settings and contact info will all
                carry over automatically.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>Cancel</Button>
            <Button onClick={confirm}>Confirm Switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
