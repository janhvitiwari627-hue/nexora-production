import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FilterPills } from "@/components/shared/FilterPills";
import { Check, Eye, Sparkles, ShieldCheck, Monitor, Smartphone } from "lucide-react";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { websiteTemplatesQuery } from "@/lib/website-templates.queries";
import { selectWebsiteTemplate } from "@/lib/owner.functions";

const CATEGORIES = [
  "All",
  "Premium Salon",
  "Salon",
  "Beauty Parlour",
  "Spa",
  "Nail Studio",
  "Makeup Studio",
  "Barber Shop",
];

type ConfirmState = { open: boolean; templateName: string };

export function CreateWebsitePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { activeSalon, activeSalonId } = useOwnerContext();
  const { data: templates = [], isLoading } = useQuery(websiteTemplatesQuery());
  const [filter, setFilter] = useState("All");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, templateName: "" });

  const selectFn = useServerFn(selectWebsiteTemplate);
  const selectedId = activeSalon?.selected_template_id ?? null;

  const mutate = useMutation({
    mutationFn: (vars: { template_id: string }) => {
      if (!activeSalonId) throw new Error("No active salon");
      return selectFn({ data: { salon_id: activeSalonId, template_id: vars.template_id } });
    },
    onSuccess: (_d, vars) => {
      const t = templates.find((x) => x.id === vars.template_id);
      qc.invalidateQueries({ queryKey: ["owner", "salons"] });
      toast.success(`${t?.template_name ?? "Template"} applied. Edit your content & go live.`);
      navigate({ to: "/owner/website" });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setPendingId(null),
  });

  const visible = useMemo(
    () => filter === "All" ? templates : templates.filter((t) => t.category === filter),
    [templates, filter],
  );

  const liveSlug = activeSalon?.slug ?? "your-salon";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="space-y-2">
        <Badge className="border-0 bg-primary/10 text-primary gap-1.5">
          <Sparkles className="h-3 w-3" /> Step 1 of setup
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-heading">Create Your Website</h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Choose a design for your booking website. Switch anytime — your content stays intact.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-heading">Template Gallery</div>
            <p className="text-sm text-muted-foreground mt-1">
              Browse professionally designed templates and pick the one that fits your business.
              You can change templates anytime without losing content, services, staff, bookings,
              reviews, images, videos, or settings.
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-body">
              {[
                "Live template preview",
                "Desktop + Mobile preview",
                "Category-specific templates",
                "One-click selection",
                "Change template anytime",
                "Content stays intact",
                "No data loss",
                "Instant website generation",
              ].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <FilterPills options={CATEGORIES} value={filter} onChange={setFilter} />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No templates in this category yet.
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => {
            const isCurrent = t.id === selectedId;
            const templateKey = t.template_key ?? t.template_slug;
            const previewHref = `/site/${liveSlug}?t=${encodeURIComponent(templateKey)}&preview=1`;
            return (
              <Card key={t.id} className="overflow-hidden group relative flex flex-col">
                {isCurrent && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-emerald-600 text-white gap-1">
                      <Check className="h-3 w-3" /> Current
                    </Badge>
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {t.preview_image ? (
                    <img
                      src={t.preview_image}
                      alt={t.template_name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <TemplatePreviewCard
                      name={t.template_name}
                      primary={t.primary_color ?? "#8B5CF6"}
                      secondary={t.secondary_color ?? "#EC4899"}
                      background={t.background_color ?? "#FFFFFF"}
                      card={t.card_color ?? "#F8FAFC"}
                    />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-heading">{t.template_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant="secondary" className="text-xs">{t.theme_type ?? t.category}</Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Monitor className="h-3 w-3" /> Desktop
                      <Smartphone className="h-3 w-3 ml-1" /> Mobile
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <a href={previewHref} target="_blank" rel="noreferrer" aria-label={`Preview ${t.template_name}`}>
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      disabled={pendingId !== null}
                      onClick={() => {
                        if (pendingId) return;
                        if (!activeSalonId) {
                          toast.error("Please complete salon setup first.");
                          navigate({ to: "/owner/onboarding" });
                          return;
                        }
                        if (isCurrent) { navigate({ to: "/owner/website" }); return; }
                        setPendingId(t.id);
                        mutate.mutate({ template_id: t.id });
                      }}
                    >
                      {isCurrent ? "Edit & Go Live" : (mutate.isPending && pendingId === t.id ? "Applying…" : "Use & Edit")}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Website Template Selected
            </DialogTitle>
            <DialogDescription>
              Your booking website has been created successfully using <b>{confirm.templateName}</b>.
              You can customize it anytime from Website Settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirm({ open: false, templateName: "" });
                navigate({ to: "/owner" });
              }}
            >
              Go To Dashboard
            </Button>
            <Button
              onClick={() => {
                setConfirm({ open: false, templateName: "" });
                navigate({ to: "/owner/website" });
              }}
            >
              Continue Setup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplatePreviewCard({
  name, primary, secondary, background, card,
}: { name: string; primary: string; secondary: string; background: string; card: string }) {
  return (
    <div className="h-full w-full p-4" style={{ background }} aria-label={`${name} visual preview`}>
      <div className="flex h-full flex-col gap-3 rounded-xl border p-3 shadow-sm" style={{ backgroundColor: card, borderColor: primary }}>
        <div className="flex items-center justify-between gap-2">
          <span className="h-2 w-16 rounded-full" style={{ backgroundColor: primary }} />
          <span className="h-7 w-16 rounded-full" style={{ backgroundColor: secondary }} />
        </div>
        <div className="grid flex-1 grid-cols-[1.2fr_0.8fr] gap-3">
          <div className="space-y-2 self-center">
            <span className="block h-3 w-20 rounded-full" style={{ backgroundColor: secondary }} />
            <span className="block h-6 w-full rounded-md" style={{ backgroundColor: primary }} />
            <span className="block h-3 w-3/4 rounded-full opacity-50" style={{ backgroundColor: primary }} />
            <span className="block h-8 w-24 rounded-full" style={{ backgroundColor: primary }} />
          </div>
          <div className="rounded-2xl" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => <span key={i} className="h-10 rounded-lg" style={{ backgroundColor: i === 1 ? secondary : primary, opacity: 0.28 }} />)}
        </div>
      </div>
    </div>
  );
}
