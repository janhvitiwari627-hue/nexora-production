import { useEffect, useMemo, useState } from "react";
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
import { BackButton } from "@/components/shared/BackButton";
import { Check, Eye, Sparkles, ShieldCheck, Monitor, Smartphone, Tablet, Zap } from "lucide-react";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { websiteTemplatesQuery } from "@/lib/website-templates.queries";
import { getTemplateAsset } from "./templates/templateAssets";
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
  const { activeSalon, activeSalonId, isLoading: ownerLoading } = useOwnerContext();

  // Direct flow: if not signed in, send to owner signup and come straight back here.
  useEffect(() => {
    let cancelled = false;
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        if (!data.session) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("nexora:postLoginRedirect", "/owner/templates");
          }
          navigate({ to: "/owner-signup" });
        }
      });
    });
    return () => { cancelled = true; };
  }, [navigate]);
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
      toast.success(`${t?.template_name ?? "Template"} applied. Now finish your website setup.`);
      navigate({ to: "/owner/setup-wizard" });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setPendingId(null),
  });


  const visible = useMemo(
    () => filter === "All" ? templates : templates.filter((t) => t.category === filter),
    [templates, filter],
  );

  

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="space-y-3">
        <BackButton to="/owner/dashboard" label="Back to Dashboard" variant="ghost" size="sm" />
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
            const asset = getTemplateAsset(templateKey);
            const previewImg = asset?.preview ?? t.preview_image ?? null;
            const demoHref = `/template-preview/${encodeURIComponent(templateKey)}`;
            const bestFor = asset?.bestFor ?? [t.category ?? "Salon"];
            const tags = asset?.tags ?? [t.theme_type ?? "Premium"];
            const features = asset?.features ?? ["Hero", "Services", "Booking"];
            return (
              <Card key={t.id} className="overflow-hidden group relative flex flex-col border-2 hover:border-primary/40 hover:shadow-2xl transition-all duration-300">
                {isCurrent && (
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className="bg-emerald-600 text-white gap-1 shadow-lg">
                      <Check className="h-3 w-3" /> Current
                    </Badge>
                  </div>
                )}
                {/* Top: real screenshot with hover overlay */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {previewImg ? (
                    <img
                      src={previewImg}
                      alt={`${t.template_name} — actual website preview`}
                      width={1280}
                      height={960}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
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
                  {/* Mobile preview chip (bottom-right) */}
                  {previewImg && (
                    <div className="absolute bottom-3 right-3 hidden sm:block">
                      <div className="w-16 rounded-[10px] border-2 border-white/90 shadow-xl overflow-hidden bg-white">
                        <img
                          src={previewImg}
                          alt=""
                          aria-hidden
                          className="w-full aspect-[9/16] object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-5 gap-2">
                    <Button size="sm" variant="secondary" asChild className="shadow-lg">
                      <a href={demoHref} target="_blank" rel="noreferrer">
                        <Eye className="h-3.5 w-3.5" /> Preview Website
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="shadow-lg"
                      disabled={ownerLoading || pendingId !== null}
                      onClick={() => {
                        if (pendingId) return;
                        if (!activeSalonId) {
                          toast.error("Please complete salon setup first.");
                          navigate({ to: "/owner/onboarding" });
                          return;
                        }
                        if (isCurrent) { navigate({ to: "/owner/setup-wizard" }); return; }
                        setPendingId(t.id);
                        mutate.mutate({ template_id: t.id });
                      }}
                    >
                      <Zap className="h-3.5 w-3.5" /> Use This Template
                    </Button>
                  </div>
                </div>

                {/* Middle: info */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-heading">{t.template_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      Best for {bestFor.slice(0, 2).join(", ")}.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] font-medium">{tag}</Badge>
                    ))}
                  </div>

                  {/* Feature checklist */}
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-body">
                    {features.slice(0, 8).map((f) => (
                      <li key={f} className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  {/* Device support */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-t pt-3">
                    <span className="inline-flex items-center gap-1"><Monitor className="h-3 w-3" /> Desktop</span>
                    <span className="inline-flex items-center gap-1"><Tablet className="h-3 w-3" /> Tablet</span>
                    <span className="inline-flex items-center gap-1"><Smartphone className="h-3 w-3" /> Mobile</span>
                  </div>

                  {/* Bottom buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button variant="outline" size="sm" asChild>
                      <a href={demoHref} target="_blank" rel="noreferrer" aria-label={`Live demo of ${t.template_name}`}>
                        <Eye className="h-3.5 w-3.5" /> Live Demo
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      disabled={ownerLoading || pendingId !== null}
                      onClick={() => {
                        if (pendingId) return;
                        if (!activeSalonId) {
                          toast.error("Please complete salon setup first.");
                          navigate({ to: "/owner/onboarding" });
                          return;
                        }
                        if (isCurrent) { navigate({ to: "/owner/setup-wizard" }); return; }
                        setPendingId(t.id);
                        mutate.mutate({ template_id: t.id });
                      }}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {ownerLoading ? "Loading…" : isCurrent ? "Edit & Go Live" : (pendingId === t.id ? "Applying…" : "Use This Template")}
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
