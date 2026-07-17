import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublishedWebsite, type WebsiteSection, type WebsiteTheme } from "@/lib/website-editor.functions";

export const Route = createFileRoute("/w/$websiteId")({
  head: ({ params }) => ({
    meta: [{ title: `Website — ${params.websiteId.slice(0, 8)}` }],
  }),
  component: PublicWebsitePage,
});

type Bundle = { sections: WebsiteSection[]; theme: WebsiteTheme | null };

function PublicWebsitePage() {
  const { websiteId } = Route.useParams();
  const fetchPublished = useServerFn(getPublishedWebsite);

  const [preview, setPreview] = useState<Bundle | null>(null);
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=1");

  const q = useQuery({
    queryKey: ["public-website", websiteId],
    queryFn: () => fetchPublished({ data: { websiteId } }),
  });

  // Live-preview channel from editor
  useEffect(() => {
    if (!isPreview) return;
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "editor:bundle") {
        setPreview(e.data.bundle as Bundle);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [isPreview]);

  const bundle: Bundle | null = preview ?? (q.data
    ? { sections: q.data.sections as WebsiteSection[], theme: q.data.theme as WebsiteTheme | null }
    : null);

  if (q.isLoading && !bundle) {
    return <div className="p-8">Loading…</div>;
  }

  if (!bundle && !isPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold">This website isn’t published yet</h1>
          <p className="mt-2 text-muted-foreground">The owner is still building it. Check back soon!</p>
        </div>
      </div>
    );
  }

  const theme = bundle?.theme;
  const headingFont = theme?.heading_font || "Inter";
  const bodyFont = theme?.body_font || "Inter";
  const btnStyle = theme?.button_style || "rounded";
  const btnRadius = btnStyle === "pill" ? "9999px" : btnStyle === "square" ? "0" : "0.5rem";

  // Load Google Fonts for the theme
  useEffect(() => {
    const families = Array.from(new Set([headingFont, bodyFont]))
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join("&");
    const id = "w-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }, [headingFont, bodyFont]);

  const extras = ((theme as unknown as { extras?: Record<string, string> } | null)?.extras) ?? {};
  const headerBg = extras.header_bg || "#FFFFFF";
  const headerText = extras.header_text || "#111827";
  const linkColor = extras.link_color || "#4F46E5";
  const linkStyle = extras.link_style || "hover-underline";

  const linkClass =
    linkStyle === "underline" ? "underline" : linkStyle === "none" ? "no-underline" : "hover:underline";

  const styleVars = {
    ["--w-primary" as string]: theme?.primary_color ?? "#111827",
    ["--w-secondary" as string]: theme?.secondary_color ?? "#F59E0B",
    ["--w-accent" as string]: theme?.accent_color ?? "#10B981",
    ["--w-bg" as string]: theme?.background_color ?? "#FFFFFF",
    ["--w-text" as string]: theme?.text_color ?? "#111827",
    ["--w-header-bg" as string]: headerBg,
    ["--w-header-text" as string]: headerText,
    ["--w-link" as string]: linkColor,
    ["--w-heading-font" as string]: `'${headingFont}', sans-serif`,
    ["--w-body-font" as string]: `'${bodyFont}', sans-serif`,
    ["--w-btn-radius" as string]: btnRadius,
    fontFamily: `var(--w-body-font)`,
  } as React.CSSProperties;

  const sections = (bundle?.sections ?? [])
    .filter((s) => s.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Header nav from saved extras, with a fallback derived from visible sections
  const savedNav = Array.isArray(extras.nav_links) ? (extras.nav_links as { id?: string; label: string; url: string }[]) : null;
  const fallbackNav = sections
    .filter((s) => ["about", "services", "gallery", "contact"].includes(s.section_type))
    .map((s) => ({ id: s.section_type, label: s.section_type.replace("_", " "), url: `#${s.section_type}` }));
  const navItems = (savedNav && savedNav.length ? savedNav : fallbackNav).map((n, i) => ({
    id: n.id ?? `n${i}`,
    label: n.label,
    url: n.url,
  }));
  const siteTitle = (extras.site_title as string | undefined) || "Home";

  return (
    <div style={{ ...styleVars, background: "var(--w-bg)", color: "var(--w-text)" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3"
        style={{ background: "var(--w-header-bg)", color: "var(--w-header-text)" }}
      >
        <div className="text-lg font-semibold" style={{ fontFamily: "var(--w-heading-font)" }}>
          {siteTitle}
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          {navItems.map((n) => (
            <a
              key={n.id}
              href={n.url}
              className={linkClass}
              style={{ color: "var(--w-link)" }}
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      {sections.map((s) => (
        <div key={s.id} id={s.section_type}>
          <SectionRenderer key={s.id} section={s} />
        </div>
      ))}
      {sections.length === 0 && (
        <div className="p-16 text-center text-muted-foreground">
          No visible sections yet. Add content in the editor.
        </div>
      )}
    </div>
  );
}

function SectionRenderer({ section }: { section: WebsiteSection }) {
  const c = (section.content ?? {}) as Record<string, string>;

  switch (section.section_type) {
    case "hero":
      return (
        <section
          className="relative flex min-h-[60vh] items-center justify-center bg-cover bg-center px-6 py-24 text-center"
          style={{
            backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : undefined,
            backgroundColor: !c.imageUrl ? "var(--w-primary)" : undefined,
            color: c.imageUrl ? "#fff" : "#fff",
          }}
        >
          {c.imageUrl && <div className="absolute inset-0 bg-black/40" />}
          <div className="relative max-w-3xl">
            <h1 className="text-4xl font-bold md:text-6xl" style={{ fontFamily: "var(--w-heading-font)" }}>{c.heading || "Welcome"}</h1>
            {c.subheading && <p className="mt-4 text-lg opacity-90">{c.subheading}</p>}
            {c.buttonText && (
              <a
                href={c.buttonLink || "#"}
                className="mt-8 inline-block px-6 py-3 font-medium"
                style={{ background: "var(--w-secondary)", color: "#000", borderRadius: "var(--w-btn-radius)" }}
              >
                {c.buttonText}
              </a>
            )}
          </div>
        </section>
      );
    case "about":
      return (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-4 text-3xl font-semibold" style={{ color: "var(--w-primary)", fontFamily: "var(--w-heading-font)" }}>
            {c.heading || "About Us"}
          </h2>
          <p className="whitespace-pre-wrap leading-relaxed opacity-90">{c.body}</p>
        </section>
      );
    case "contact":
      return (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-6 text-3xl font-semibold" style={{ color: "var(--w-primary)", fontFamily: "var(--w-heading-font)" }}>
            {c.heading || "Contact Us"}
          </h2>
          <div className="space-y-2">
            {c.phone && <p>📞 {c.phone}</p>}
            {c.whatsapp && <p>💬 WhatsApp: {c.whatsapp}</p>}
            {c.email && <p>✉️ {c.email}</p>}
            {c.address && <p>📍 {c.address}</p>}
          </div>
          {c.mapEmbed && (
            <iframe
              src={c.mapEmbed}
              className="mt-6 h-64 w-full rounded-md border-0"
              loading="lazy"
              title="Map"
            />
          )}
        </section>
      );
    default:
      return (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="mb-4 text-2xl font-semibold" style={{ color: "var(--w-primary)", fontFamily: "var(--w-heading-font)" }}>
            {c.heading || section.section_type}
          </h2>
          <p className="text-sm opacity-70">
            (Is section ka detailed view aa raha hai next update me.)
          </p>
        </section>
      );
  }
}
