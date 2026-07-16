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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Eye, Globe } from "lucide-react";

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
  const [localSections, setLocalSections] = useState<WebsiteSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (bundleQ.data?.sections) {
      setLocalSections(bundleQ.data.sections);
      if (!selectedId && bundleQ.data.sections.length) setSelectedId(bundleQ.data.sections[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleQ.data]);

  // Push live-preview updates to iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:bundle", bundle: { sections: localSections, theme: bundleQ.data?.theme ?? null } },
      "*",
    );
  }, [localSections, bundleQ.data?.theme]);

  const selected = useMemo(
    () => localSections.find((s) => s.id === selectedId) ?? null,
    [localSections, selectedId],
  );

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
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    selectedId === s.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
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
        </aside>

        {/* Editor form */}
        <section className="overflow-y-auto p-6">
          {selected ? (
            <SectionEditor
              section={selected}
              content={content}
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
  onFieldChange,
  onToggleVisible,
}: {
  section: WebsiteSection;
  content: Record<string, unknown>;
  onFieldChange: (field: string, value: unknown) => void;
  onToggleVisible: (v: boolean) => void;
}) {
  const str = (k: string) => (content[k] as string) ?? "";

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
          <Field label="Background Image URL" value={str("imageUrl")} onChange={(v) => onFieldChange("imageUrl", v)} />
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
        section.section_type === "offers" ||
        section.section_type === "staff" ||
        section.section_type === "membership" ||
        section.section_type === "gallery" ||
        section.section_type === "blog") && (
        <>
          <Field label="Heading" value={str("heading")} onChange={(v) => onFieldChange("heading", v)} />
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Detailed item editor for <strong>{SECTION_LABELS[section.section_type]}</strong> aa raha hai next update me. Abhi aap heading edit kar sakte ho aur section ko show/hide kar sakte ho.
          </p>
        </>
      )}
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
      <Textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
