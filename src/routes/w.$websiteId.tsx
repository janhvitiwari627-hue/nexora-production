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

type Item = Record<string, string | number | undefined>;

function asArray(v: unknown): Item[] {
  if (Array.isArray(v)) return v as Item[];
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? (p as Item[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-8 text-center text-3xl font-semibold md:text-4xl"
      style={{ color: "var(--w-primary)", fontFamily: "var(--w-heading-font)" }}
    >
      {children}
    </h2>
  );
}

function SectionRenderer({ section }: { section: WebsiteSection }) {
  const raw = (section.content ?? {}) as Record<string, unknown>;
  const c = raw as Record<string, string>;

  switch (section.section_type) {
    case "hero":
      return (
        <section
          className="relative flex min-h-[70vh] items-center justify-center bg-cover bg-center px-6 py-24 text-center"
          style={{
            backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : undefined,
            backgroundColor: !c.imageUrl ? "var(--w-primary)" : undefined,
            color: "#fff",
          }}
        >
          {c.imageUrl && <div className="absolute inset-0 bg-black/50" />}
          <div className="relative max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: "var(--w-heading-font)" }}>
              {c.heading || "Welcome"}
            </h1>
            {c.subheading && <p className="mt-4 text-lg opacity-90 md:text-xl">{c.subheading}</p>}
            {c.buttonText && (
              <a
                href={c.buttonLink || "#"}
                className="mt-8 inline-block px-8 py-3 font-medium shadow-lg transition hover:opacity-90"
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
        <section className="mx-auto max-w-3xl px-6 py-20">
          <SectionHeading>{c.heading || "About Us"}</SectionHeading>
          <p className="whitespace-pre-wrap text-center leading-relaxed opacity-90">{c.body}</p>
        </section>
      );

    case "services": {
      const items = asArray(raw.items);
      return (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading>{c.heading || "Our Services"}</SectionHeading>
          {items.length === 0 ? (
            <p className="text-center text-sm opacity-60">No services listed yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-6 shadow-sm transition hover:shadow-md"
                  style={{ borderColor: "var(--w-primary)", borderOpacity: 0.15 } as React.CSSProperties}
                >
                  {it.image && (
                    <img src={String(it.image)} alt={String(it.name ?? "")} className="mb-4 h-40 w-full rounded-md object-cover" />
                  )}
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--w-heading-font)" }}>{String(it.name ?? "Service")}</h3>
                  {it.description && <p className="mt-2 text-sm opacity-80">{String(it.description)}</p>}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    {it.duration && <span className="opacity-70">{String(it.duration)}</span>}
                    {it.price && (
                      <span className="font-semibold" style={{ color: "var(--w-accent)" }}>
                        ₹{String(it.price)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "rate_card": {
      const items = asArray(raw.items);
      return (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <SectionHeading>{c.heading || "Rate Card"}</SectionHeading>
          {items.length === 0 ? (
            <p className="text-center text-sm opacity-60">No rates listed yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead style={{ background: "var(--w-primary)", color: "#fff" }}>
                  <tr>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-3">{String(it.name ?? "-")}</td>
                      <td className="px-4 py-3 opacity-70">{String(it.duration ?? "-")}</td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--w-accent)" }}>
                        {it.price ? `₹${String(it.price)}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      );
    }

    case "packages":
    case "membership": {
      const items = asArray(raw.items);
      return (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading>{c.heading || (section.section_type === "packages" ? "Packages" : "Membership")}</SectionHeading>
          {items.length === 0 ? (
            <p className="text-center text-sm opacity-60">Nothing here yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {items.map((it, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-xl border-2 p-6 text-center shadow-sm"
                  style={{ borderColor: "var(--w-secondary)" }}
                >
                  <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--w-heading-font)" }}>
                    {String(it.name ?? "Plan")}
                  </h3>
                  {it.price && (
                    <div className="my-3 text-3xl font-bold" style={{ color: "var(--w-primary)" }}>
                      ₹{String(it.price)}
                    </div>
                  )}
                  {it.description && <p className="text-sm opacity-80">{String(it.description)}</p>}
                  {it.duration && <p className="mt-2 text-xs opacity-60">{String(it.duration)}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "offers": {
      const items = asArray(raw.items);
      return (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading>{c.heading || "Current Offers"}</SectionHeading>
          {items.length === 0 ? (
            <p className="text-center text-sm opacity-60">No active offers.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((it, i) => (
                <div
                  key={i}
                  className="rounded-lg p-6 text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, var(--w-primary), var(--w-secondary))` }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Offer</div>
                  <h3 className="mt-1 text-xl font-bold">{String(it.title ?? "Special Offer")}</h3>
                  {it.description && <p className="mt-2 text-sm opacity-90">{String(it.description)}</p>}
                  {it.discount && (
                    <div className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                      {String(it.discount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "staff": {
      const items = asArray(raw.items);
      return (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading>{c.heading || "Meet the Team"}</SectionHeading>
          {items.length === 0 ? (
            <p className="text-center text-sm opacity-60">Team details coming soon.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {items.map((it, i) => (
                <div key={i} className="text-center">
                  <img
                    src={String(it.image ?? it.avatar ?? "https://via.placeholder.com/200")}
                    alt={String(it.name ?? "")}
                    className="mx-auto h-32 w-32 rounded-full object-cover shadow-md"
                  />
                  <h3 className="mt-3 font-semibold" style={{ fontFamily: "var(--w-heading-font)" }}>{String(it.name ?? "")}</h3>
                  {it.role && <p className="text-sm opacity-70">{String(it.role)}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "gallery": {
      const images = asArray(raw.images);
      const urls: string[] = Array.isArray(raw.images)
        ? (raw.images as unknown[]).map((x) => (typeof x === "string" ? x : String((x as Item)?.url ?? ""))).filter(Boolean)
        : images.map((x) => String(x.url ?? "")).filter(Boolean);
      return (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading>{c.heading || "Gallery"}</SectionHeading>
          {urls.length === 0 ? (
            <p className="text-center text-sm opacity-60">No images uploaded yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {urls.map((u, i) => (
                <img key={i} src={u} alt="" className="h-48 w-full rounded-md object-cover shadow-sm transition hover:scale-[1.02]" />
              ))}
            </div>
          )}
        </section>
      );
    }

    case "blog": {
      const posts = asArray(raw.posts);
      return (
        <section className="mx-auto max-w-5xl px-6 py-20">
          <SectionHeading>{c.heading || "Blog"}</SectionHeading>
          {posts.length === 0 ? (
            <p className="text-center text-sm opacity-60">No posts yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((p, i) => (
                <article key={i} className="rounded-lg border overflow-hidden shadow-sm">
                  {p.image && <img src={String(p.image)} alt={String(p.title ?? "")} className="h-44 w-full object-cover" />}
                  <div className="p-5">
                    <h3 className="font-semibold" style={{ fontFamily: "var(--w-heading-font)" }}>{String(p.title ?? "Untitled")}</h3>
                    {p.date && <p className="mt-1 text-xs opacity-60">{String(p.date)}</p>}
                    {p.excerpt && <p className="mt-2 text-sm opacity-80">{String(p.excerpt)}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "contact":
      return (
        <section className="mx-auto max-w-3xl px-6 py-20">
          <SectionHeading>{c.heading || "Contact Us"}</SectionHeading>
          <div className="grid gap-3 text-center">
            {c.phone && <p>📞 <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></p>}
            {c.whatsapp && <p>💬 <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:underline">WhatsApp: {c.whatsapp}</a></p>}
            {c.email && <p>✉️ <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></p>}
            {c.address && <p>📍 {c.address}</p>}
          </div>
          {c.mapEmbed && (
            <iframe
              src={c.mapEmbed}
              className="mt-8 h-72 w-full rounded-md border-0"
              loading="lazy"
              title="Map"
            />
          )}
        </section>
      );

    default:
      return (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <SectionHeading>{c.heading || section.section_type}</SectionHeading>
          {c.body && <p className="whitespace-pre-wrap text-center leading-relaxed opacity-90">{c.body}</p>}
        </section>
      );
  }
}

