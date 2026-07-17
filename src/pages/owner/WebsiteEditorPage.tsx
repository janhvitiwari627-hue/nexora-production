import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getOrCreateMyWebsite,
  getMyWebsiteBundle,
  updateSection,
  updateTheme,
  publishWebsite,
  type WebsiteSection,
  type SectionType,
} from "@/lib/website-editor.functions";
import { getMyOwnedSalons } from "@/lib/owner.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Eye, Globe, Plus, Trash2, Upload, Image as ImageIcon, Palette } from "lucide-react";

type ThemeExtras = {
  header_bg?: string;
  header_text?: string;
  link_color?: string;
  link_style?: "underline" | "none" | "hover-underline";
};

type ThemeState = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  button_style: string;
  extras: ThemeExtras;
};

const DEFAULT_EXTRAS: ThemeExtras = {
  header_bg: "#FFFFFF",
  header_text: "#111827",
  link_color: "#4F46E5",
  link_style: "hover-underline",
};

const DEFAULT_THEME: ThemeState = {
  primary_color: "#111827",
  secondary_color: "#F59E0B",
  accent_color: "#10B981",
  background_color: "#FFFFFF",
  text_color: "#111827",
  heading_font: "Inter",
  body_font: "Inter",
  button_style: "rounded",
  extras: DEFAULT_EXTRAS,
};

const FONT_OPTIONS = ["Inter", "Poppins", "Playfair Display", "Montserrat", "Lora", "Roboto", "Merriweather", "Space Grotesk"];
const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
];

const THEME_PRESETS: { key: string; name: string; description: string; theme: ThemeState }[] = [
  {
    key: "default",
    name: "Default",
    description: "Reset to defaults",
    theme: DEFAULT_THEME,
  },
  {
    key: "classic",
    name: "Classic",
    description: "Warm gold on deep navy",
    theme: {
      primary_color: "#1E293B",
      secondary_color: "#D4A24C",
      accent_color: "#B45309",
      background_color: "#FAF7F2",
      text_color: "#1E293B",
      heading_font: "Playfair Display",
      body_font: "Lora",
      button_style: "rounded",
      extras: { header_bg: "#1E293B", header_text: "#FAF7F2", link_color: "#D4A24C", link_style: "hover-underline" },
    },
  },
  {
    key: "modern",
    name: "Modern",
    description: "Bold indigo, clean sans",
    theme: {
      primary_color: "#4F46E5",
      secondary_color: "#F59E0B",
      accent_color: "#10B981",
      background_color: "#FFFFFF",
      text_color: "#0F172A",
      heading_font: "Space Grotesk",
      body_font: "Inter",
      button_style: "pill",
      extras: { header_bg: "#FFFFFF", header_text: "#0F172A", link_color: "#4F46E5", link_style: "hover-underline" },
    },
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "Monochrome, lots of white",
    theme: {
      primary_color: "#000000",
      secondary_color: "#111111",
      accent_color: "#666666",
      background_color: "#FFFFFF",
      text_color: "#111111",
      heading_font: "Montserrat",
      body_font: "Inter",
      button_style: "square",
      extras: { header_bg: "#FFFFFF", header_text: "#111111", link_color: "#111111", link_style: "underline" },
    },
  },
  {
    key: "luxury",
    name: "Luxury",
    description: "Rich rose on charcoal",
    theme: {
      primary_color: "#111111",
      secondary_color: "#E5B8A6",
      accent_color: "#8B5E3C",
      background_color: "#0F0F0F",
      text_color: "#F5F0EB",
      heading_font: "Playfair Display",
      body_font: "Montserrat",
      button_style: "pill",
      extras: { header_bg: "#0F0F0F", header_text: "#F5F0EB", link_color: "#E5B8A6", link_style: "hover-underline" },
    },
  },
  {
    key: "fresh",
    name: "Fresh",
    description: "Mint & coral, playful",
    theme: {
      primary_color: "#0F766E",
      secondary_color: "#FB7185",
      accent_color: "#FDE68A",
      background_color: "#F0FDFA",
      text_color: "#134E4A",
      heading_font: "Poppins",
      body_font: "Poppins",
      button_style: "rounded",
      extras: { header_bg: "#0F766E", header_text: "#F0FDFA", link_color: "#FB7185", link_style: "hover-underline" },
    },
  },
];

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero / Banner",
  about: "About Us",
  services: "Services",
  rate_card: "Rate Card",
  packages: "Packages",
  offers: "Current Offers",
  staff: "Meet the Team",
  membership: "Membership",
  gallery: "Gallery",
  blog: "Blog",
  contact: "Contact",
};

export function WebsiteEditorPage() {
  const fetchSalons = useServerFn(getMyOwnedSalons);
  const fetchOrCreate = useServerFn(getOrCreateMyWebsite);
  const fetchBundle = useServerFn(getMyWebsiteBundle);
  const saveSection = useServerFn(updateSection);
  const saveTheme = useServerFn(updateTheme);
  const doPublish = useServerFn(publishWebsite);

  const salonsQ = useQuery({ queryKey: ["my-owned-salons-editor"], queryFn: () => fetchSalons() });
  const salonId = salonsQ.data?.[0]?.salon?.id;

  const websiteQ = useQuery({
    queryKey: ["editor-website", salonId],
    queryFn: () => fetchOrCreate({ data: { salonId: salonId! } }),
    enabled: !!salonId,
  });
  const websiteId = websiteQ.data?.id;

  const bundleQ = useQuery({
    queryKey: ["editor-bundle", websiteId],
    queryFn: () => fetchBundle({ data: { websiteId: websiteId! } }),
    enabled: !!websiteId,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTheme, setShowTheme] = useState(false);
  const [localSections, setLocalSections] = useState<WebsiteSection[]>([]);
  const [localTheme, setLocalTheme] = useState<ThemeState>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const themeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (bundleQ.data?.sections) {
      setLocalSections(bundleQ.data.sections);
      if (!selectedId && !showTheme && bundleQ.data.sections.length) setSelectedId(bundleQ.data.sections[0].id);
    }
    if (bundleQ.data?.theme) {
      const t = bundleQ.data.theme as Partial<ThemeState>;
      setLocalTheme({ ...DEFAULT_THEME, ...t });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleQ.data]);

  // Push live-preview updates to iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:bundle", bundle: { sections: localSections, theme: localTheme } },
      "*",
    );
  }, [localSections, localTheme]);

  const selected = useMemo(
    () => localSections.find((s) => s.id === selectedId) ?? null,
    [localSections, selectedId],
  );

  function patchTheme(patch: Partial<ThemeState>) {
    setLocalTheme((prev) => {
      const next = { ...prev, ...patch };
      if (themeTimer.current) clearTimeout(themeTimer.current);
      themeTimer.current = setTimeout(async () => {
        if (!websiteId) return;
        try {
          setSaving(true);
          await saveTheme({ data: { websiteId, patch } });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Theme save failed");
        } finally {
          setSaving(false);
        }
      }, 600);
      return next;
    });
  }

  function patchSection(id: string, patch: Partial<WebsiteSection>) {
    setLocalSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    // Debounced autosave
    if (saveTimers.current[id]) clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      try {
        setSaving(true);
        const target = { ...(localSections.find((s) => s.id === id) as WebsiteSection), ...patch };
        await saveSection({
          data: {
            sectionId: id,
            content: target.content as Record<string, unknown>,
            is_visible: target.is_visible,
          },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    }, 800);
  }

  function updateContent(field: string, value: unknown) {
    if (!selected) return;
    const nextContent = { ...(selected.content as Record<string, unknown>), [field]: value };
    patchSection(selected.id, { content: nextContent as WebsiteSection["content"] });
  }

  async function handlePublish() {
    if (!websiteId) return;
    setPublishing(true);
    try {
      await doPublish({ data: { websiteId } });
      toast.success("Website published!");
      bundleQ.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  if (salonsQ.isLoading || websiteQ.isLoading || bundleQ.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!salonId) {
    return (
      <div className="p-8">
        <p className="text-lg">You need to register a salon first.</p>
        <Link to="/app/owner" className="text-primary underline">
          Go to owner dashboard
        </Link>
      </div>
    );
  }

  const content = (selected?.content ?? {}) as Record<string, unknown>;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Website Editor</h1>
          <p className="text-xs text-muted-foreground">
            {saving ? "Saving draft..." : "All changes saved as draft"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {websiteId && (
            <a
              href={`/w/${websiteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm"
            >
              <Eye className="h-4 w-4" /> Preview
            </a>
          )}
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
            Publish
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[240px_1fr_1fr] overflow-hidden">
        {/* Section list */}
        <aside className="overflow-y-auto border-r bg-muted/30 p-3">
          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Sections</div>
          <ul className="space-y-1">
            {localSections.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => { setSelectedId(s.id); setShowTheme(false); }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    selectedId === s.id && !showTheme ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{SECTION_LABELS[s.section_type]}</span>
                    {!s.is_visible && <span className="text-xs opacity-60">hidden</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 mb-2 text-xs font-semibold uppercase text-muted-foreground">Design</div>
          <button
            onClick={() => setShowTheme(true)}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
              showTheme ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <Palette className="h-4 w-4" /> Theme &amp; Typography
          </button>
        </aside>

        {/* Editor form */}
        <section className="overflow-y-auto p-6">
          {showTheme ? (
            <ThemeEditor theme={localTheme} onChange={patchTheme} />
          ) : selected ? (
            <SectionEditor
              section={selected}
              content={content}
              salonId={salonId ?? null}
              onFieldChange={updateContent}
              onToggleVisible={(v) => patchSection(selected.id, { is_visible: v })}
            />

          ) : (
            <p className="text-muted-foreground">Select a section to edit</p>
          )}
        </section>

        {/* Live preview */}
        <section className="overflow-hidden border-l bg-muted/20">
          {websiteId && (
            <iframe
              ref={iframeRef}
              key={websiteId}
              src={`/w/${websiteId}?preview=1`}
              className="h-full w-full border-0"
              title="Live preview"
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  content,
  salonId,
  onFieldChange,
  onToggleVisible,
}: {
  section: WebsiteSection;
  content: Record<string, unknown>;
  salonId: string | null;
  onFieldChange: (field: string, value: unknown) => void;
  onToggleVisible: (v: boolean) => void;
}) {
  const str = (k: string) => (content[k] as string) ?? "";
  const items = Array.isArray(content.items) ? (content.items as Item[]) : [];

  const setItems = (next: Item[]) => onFieldChange("items", next);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{SECTION_LABELS[section.section_type]}</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="visible" className="text-sm">Show</Label>
          <Switch id="visible" checked={section.is_visible} onCheckedChange={onToggleVisible} />
        </div>
      </div>

      {section.section_type === "hero" && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <Field label="Sub-heading" value={str("subheading")} onChange={(v) => onFieldChange("subheading", v)} />
          <Field label="Button Text" value={str("buttonText")} onChange={(v) => onFieldChange("buttonText", v)} />
          <Field label="Button Link" value={str("buttonLink")} onChange={(v) => onFieldChange("buttonLink", v)} />
          <ImageField label="Background Image" value={str("imageUrl")} salonId={salonId} folder="hero" onChange={(v) => onFieldChange("imageUrl", v)} />
        </>
      )}

      {section.section_type === "about" && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <TextField label="Body" value={str("body")} onChange={(v) => onFieldChange("body", v)} />
        </>
      )}

      {section.section_type === "contact" && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <Field label="Phone" value={str("phone")} onChange={(v) => onFieldChange("phone", v)} />
          <Field label="WhatsApp" value={str("whatsapp")} onChange={(v) => onFieldChange("whatsapp", v)} />
          <Field label="Email" value={str("email")} onChange={(v) => onFieldChange("email", v)} />
          <TextField label="Address" value={str("address")} onChange={(v) => onFieldChange("address", v)} />
          <Field label="Google Map Embed URL" value={str("mapEmbed")} onChange={(v) => onFieldChange("mapEmbed", v)} />
        </>
      )}

      {(section.section_type === "services" ||
        section.section_type === "rate_card" ||
        section.section_type === "packages" ||
        section.section_type === "staff") && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <ItemsEditor
            kind={section.section_type}
            items={items}
            salonId={salonId}
            onChange={setItems}
          />
        </>
      )}

      {(section.section_type === "offers" ||
        section.section_type === "membership" ||
        section.section_type === "gallery" ||
        section.section_type === "blog") && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Detailed item editor for <strong>{SECTION_LABELS[section.section_type]}</strong> aa raha hai next update me.
          </p>
        </>
      )}
    </div>
  );
}

type Item = {
  id: string;
  name?: string;
  price?: string;
  duration?: string;
  description?: string;
  role?: string;
  bio?: string;
  image?: string;
};

function newId() {
  return (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ItemsEditor({
  kind,
  items,
  salonId,
  onChange,
}: {
  kind: "services" | "rate_card" | "packages" | "staff";
  items: Item[];
  salonId: string | null;
  onChange: (next: Item[]) => void;
}) {
  const isStaff = kind === "staff";
  const addLabel =
    kind === "services" ? "Add Service" :
    kind === "rate_card" ? "Add Rate" :
    kind === "packages" ? "Add Package" : "Add Team Member";

  const patch = (id: string, p: Partial<Item>) =>
    onChange(items.map((it) => (it.id === id ? { ...it, ...p } : it)));
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id));
  const add = () => onChange([...items, { id: newId() }]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Items ({items.length})</Label>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> {addLabel}
        </Button>
      </div>

      {items.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No items yet. Click <strong>{addLabel}</strong> to create one.
        </p>
      )}

      <ul className="space-y-3">
        {items.map((it, idx) => (
          <li key={it.id} className="rounded-lg border bg-card p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground">#{idx + 1}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => remove(it.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <ImageField
              label="Image"
              value={it.image ?? ""}
              salonId={salonId}
              folder={isStaff ? "staff" : "services"}
              compact
              onChange={(v) => patch(it.id, { image: v })}
            />

            <Field label="Name" value={it.name ?? ""} onChange={(v) => patch(it.id, { name: v })} />

            {isStaff ? (
              <>
                <Field label="Role" value={it.role ?? ""} onChange={(v) => patch(it.id, { role: v })} />
                <TextField label="Bio" value={it.bio ?? ""} onChange={(v) => patch(it.id, { bio: v })} />
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Price" value={it.price ?? ""} onChange={(v) => patch(it.id, { price: v })} />
                  {kind !== "packages" && (
                    <Field label="Duration" value={it.duration ?? ""} onChange={(v) => patch(it.id, { duration: v })} />
                  )}
                </div>
                <TextField label="Description" value={it.description ?? ""} onChange={(v) => patch(it.id, { description: v })} />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageField({
  label,
  value,
  salonId,
  folder,
  compact,
  onChange,
}: {
  label: string;
  value: string;
  salonId: string | null;
  folder: string;
  compact?: boolean;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!salonId) {
      toast.error("Salon not ready yet");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${salonId}/${folder}/${Date.now()}.${ext}`;
    setUploading(true);
    const { error } = await supabase.storage.from("salon-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
    onChange(data.publicUrl);
    toast.success("Image uploaded");
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className={`bg-muted flex ${compact ? "h-16 w-16" : "h-20 w-28"} shrink-0 items-center justify-center overflow-hidden rounded-md border`}>
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="text-muted-foreground h-6 w-6" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
              Upload
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Button>
            )}
          </div>
          <Input
            placeholder="…or paste image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}


function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-md border bg-background p-1"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function ThemeEditor({ theme, onChange }: { theme: ThemeState; onChange: (patch: Partial<ThemeState>) => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Theme &amp; Typography</h2>
        <p className="text-sm text-muted-foreground">Changes apply instantly to the live preview.</p>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Presets</h3>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_THEME)}
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            Reset to default
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((p) => {
            const active =
              theme.primary_color === p.theme.primary_color &&
              theme.secondary_color === p.theme.secondary_color &&
              theme.heading_font === p.theme.heading_font &&
              theme.button_style === p.theme.button_style;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onChange(p.theme)}
                className={`group rounded-lg border p-2 text-left transition ${
                  active ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/60"
                }`}
                style={{ background: p.theme.background_color }}
              >
                <div className="flex gap-1">
                  {[p.theme.primary_color, p.theme.secondary_color, p.theme.accent_color, p.theme.text_color].map((c, i) => (
                    <span key={i} className="h-5 w-5 rounded-full border" style={{ background: c }} />
                  ))}
                </div>
                <div
                  className="mt-2 text-sm font-semibold"
                  style={{ color: p.theme.text_color, fontFamily: p.theme.heading_font }}
                >
                  {p.name}
                </div>
                <div className="text-[11px] opacity-70" style={{ color: p.theme.text_color }}>
                  {p.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>


      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Colors</h3>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Primary" value={theme.primary_color} onChange={(v) => onChange({ primary_color: v })} />
          <ColorField label="Secondary" value={theme.secondary_color} onChange={(v) => onChange({ secondary_color: v })} />
          <ColorField label="Accent" value={theme.accent_color} onChange={(v) => onChange({ accent_color: v })} />
          <ColorField label="Background" value={theme.background_color} onChange={(v) => onChange({ background_color: v })} />
          <ColorField label="Text" value={theme.text_color} onChange={(v) => onChange({ text_color: v })} />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Typography</h3>
        <div className="space-y-1.5">
          <Label>Heading Font</Label>
          <Select value={theme.heading_font} onValueChange={(v) => onChange({ heading_font: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Body Font</Label>
          <Select value={theme.body_font} onValueChange={(v) => onChange({ body_font: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Buttons</h3>
        <div className="space-y-1.5">
          <Label>Button Style</Label>
          <Select value={theme.button_style} onValueChange={(v) => onChange({ button_style: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUTTON_STYLES.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Preview:</span>
            <span
              className="inline-block px-5 py-2 text-sm font-medium"
              style={{
                background: theme.secondary_color,
                color: "#000",
                borderRadius: theme.button_style === "pill" ? "9999px" : theme.button_style === "square" ? "0" : "0.5rem",
                fontFamily: theme.body_font,
              }}
            >
              Book Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
