import { useMemo, useState } from "react";
import { Check, Eye, Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TEMPLATE_CATEGORIES, type TemplateCatalogItem } from "./templateCatalog";

type Device = "desktop" | "tablet" | "mobile";

export function TemplateGalleryDialog({
  open,
  onOpenChange,
  templates,
  selectedKey,
  applyingKey,
  initialCategory,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: TemplateCatalogItem[];
  selectedKey?: string | null;
  applyingKey?: string | null;
  initialCategory?: string | null;
  onApply: (template: TemplateCatalogItem) => void;
}) {
  const safeInitial = TEMPLATE_CATEGORIES.includes(initialCategory as never)
    ? initialCategory!
    : "All";
  const [category, setCategory] = useState(safeInitial);
  const [preview, setPreview] = useState<TemplateCatalogItem | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const visible = useMemo(
    () => (category === "All" ? templates : templates.filter((item) => item.category === category)),
    [category, templates],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setPreview(null);
      }}
    >
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none p-0 sm:h-[92dvh] sm:w-[min(96vw,1200px)] sm:rounded-lg">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle>{preview ? preview.name : "Choose a website template"}</DialogTitle>
          <DialogDescription>
            {preview
              ? "Preview only — this will not change your website."
              : "Choose a design made for your business. Your existing content and media stay safe."}
          </DialogDescription>
        </DialogHeader>

        {preview ? (
          <div className="flex min-h-0 flex-1 flex-col bg-muted/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-3">
              <Button variant="outline" size="sm" onClick={() => setPreview(null)}>
                Back to gallery
              </Button>
              <div className="flex rounded-lg border bg-background p-1">
                {(
                  [
                    { key: "desktop", icon: Monitor },
                    { key: "tablet", icon: Tablet },
                    { key: "mobile", icon: Smartphone },
                  ] as const
                ).map(({ key, icon: Icon }) => (
                  <Button
                    key={key}
                    type="button"
                    variant={device === key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDevice(key)}
                    aria-label={`${key} preview`}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => onApply(preview)}
                disabled={!!applyingKey || selectedKey === preview.key}
              >
                {applyingKey === preview.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedKey === preview.key ? "Selected" : "Use This Template"}
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <div
                className={`mx-auto overflow-hidden rounded-xl border bg-white shadow-xl transition-[width] ${device === "mobile" ? "w-[360px] max-w-full" : device === "tablet" ? "w-[768px] max-w-full" : "w-full max-w-5xl"}`}
              >
                <TemplateMockup template={preview} expanded />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto border-b px-5 py-3">
              {TEMPLATE_CATEGORIES.map((item) => (
                <Button
                  key={item}
                  variant={category === item ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              {visible.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                  No active templates in this category.
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((template) => {
                    const selected = selectedKey === template.key;
                    return (
                      <article
                        key={template.key}
                        className={`overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${selected ? "ring-2 ring-primary" : ""}`}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          <TemplateMockup template={template} />
                          {selected && (
                            <Badge className="absolute left-3 top-3 gap-1 bg-emerald-600 text-white">
                              <Check className="h-3 w-3" /> Selected
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-3 p-4">
                          <div>
                            <p className="text-xs font-semibold text-primary">
                              {template.category}
                            </p>
                            <h3 className="font-semibold text-heading">{template.name}</h3>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid gap-2 min-[380px]:grid-cols-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPreview(template);
                                setDevice("desktop");
                              }}
                            >
                              <Eye className="mr-1.5 h-4 w-4" /> Live Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onApply(template)}
                              disabled={!!applyingKey || selected}
                            >
                              {applyingKey === template.key && (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              )}
                              {selected ? "Selected" : "Use Template"}
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TemplateMockup({
  template,
  expanded = false,
}: {
  template: TemplateCatalogItem;
  expanded?: boolean;
}) {
  return (
    <div
      style={{
        background: template.background,
        color: template.text,
        fontFamily: template.bodyFont,
      }}
      className={expanded ? "min-h-[720px]" : "h-full"}
    >
      <div className="flex items-center justify-between border-b border-current/10 px-[5%] py-3">
        <span style={{ fontFamily: template.headingFont }} className="font-bold">
          {template.name}
        </span>
        <div className="flex gap-3 text-[9px] opacity-70">
          <span>About</span>
          <span>Services</span>
          <span>Gallery</span>
        </div>
      </div>
      <div className={`relative overflow-hidden ${expanded ? "min-h-[340px]" : "h-[68%]"}`}>
        <img
          src={template.thumbnailUrl}
          alt={`${template.name} preview`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div
          className={`relative z-10 flex h-full p-[7%] text-white ${template.heroStyle === "centered" ? "items-center justify-center text-center" : template.heroStyle === "editorial" ? "items-end" : "items-center"}`}
        >
          <div className="max-w-[72%]">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em]">
              {template.category}
            </p>
            <p
              style={{ fontFamily: template.headingFont }}
              className={expanded ? "text-4xl font-bold" : "text-lg font-bold"}
            >
              {template.name}
            </p>
            <p className={`mt-2 opacity-90 ${expanded ? "text-sm" : "line-clamp-2 text-[9px]"}`}>
              {template.description}
            </p>
            <span
              style={{ background: template.primary }}
              className="mt-3 inline-block rounded px-3 py-1.5 text-[10px] font-semibold text-white"
            >
              Book Appointment
            </span>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="grid gap-4 p-[6%] sm:grid-cols-3">
          {["Signature services", "Meet our experts", "Offers & packages"].map((label, index) => (
            <div key={label} className="rounded-xl border border-current/10 p-5">
              <div
                style={{ background: index === 0 ? template.primary : template.secondary }}
                className="mb-4 h-2 w-12 rounded"
              />
              <h4 style={{ fontFamily: template.headingFont }} className="font-bold">
                {label}
              </h4>
              <p className="mt-2 text-xs opacity-70">
                Real business details, pricing and media appear here after selection.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
