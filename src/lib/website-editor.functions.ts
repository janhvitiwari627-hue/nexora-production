import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";

// ---- Types shared with UI ----
export type SectionType =
  | "hero"
  | "about"
  | "services"
  | "rate_card"
  | "packages"
  | "offers"
  | "staff"
  | "membership"
  | "gallery"
  | "blog"
  | "contact";

export type WebsiteSection = {
  id: string;
  website_id: string;
  section_type: SectionType;
  content: Json;
  sort_order: number;
  is_visible: boolean;
};

export type WebsiteTheme = {
  website_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  button_style: string;
  extras: Json;
};

// ---- Get or create the user's website for a salon ----
export const getOrCreateMyWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        salonId: z.string().uuid().optional(),
        templateId: z.string().uuid().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Try existing
    let query = supabase.from("user_websites").select("*").eq("owner_id", userId);
    if (data.salonId) query = query.eq("salon_id", data.salonId);
    const { data: existing } = await query.maybeSingle();
    if (existing) return existing;

    // Need a template — pick provided or first active
    let templateId = data.templateId;
    if (!templateId) {
      const { data: tpl } = await supabase
        .from("website_templates")
        .select("id")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!tpl) throw new Error("No active template found");
      templateId = tpl.id;
    }

    const { data: newId, error } = await supabase.rpc("create_user_website_from_template", {
      _template_id: templateId,
      _salon_id: data.salonId ?? undefined,
    });
    if (error) throw new Error(error.message);

    const { data: created, error: e2 } = await supabase
      .from("user_websites")
      .select("*")
      .eq("id", newId as string)
      .single();
    if (e2) throw new Error(e2.message);
    return created;
  });

// ---- Load full website (sections + theme) ----
export const getMyWebsiteBundle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ websiteId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: website, error } = await supabase
      .from("user_websites")
      .select("*")
      .eq("id", data.websiteId)
      .eq("owner_id", userId)
      .single();
    if (error) throw new Error(error.message);

    const [{ data: sections }, { data: theme }] = await Promise.all([
      supabase
        .from("website_sections")
        .select("*")
        .eq("website_id", data.websiteId)
        .order("sort_order", { ascending: true }),
      supabase.from("website_theme").select("*").eq("website_id", data.websiteId).maybeSingle(),
    ]);

    return {
      website,
      sections: (sections ?? []) as unknown as WebsiteSection[],
      theme: (theme ?? null) as unknown as WebsiteTheme | null,
    };
  });

// ---- Persist the active master template without touching owner content ----
export const saveWebsiteTemplateSelection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        websiteId: z.string().uuid(),
        templateKey: z.string().min(1).max(100),
        businessCategory: z.string().min(1).max(80),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: template, error: templateError } = await supabase
      .from("website_templates")
      .select("id, template_key")
      .eq("template_key", data.templateKey)
      .eq("is_active", true)
      .single();
    if (templateError || !template)
      throw new Error(templateError?.message ?? "Template is not available");

    const { data: website, error } = await supabase
      .from("user_websites")
      .update({
        template_id: template.id,
        template_key: template.template_key,
        business_category: data.businessCategory,
        draft_updated_at: new Date().toISOString(),
      })
      .eq("id", data.websiteId)
      .eq("owner_id", userId)
      .select("id, template_id, template_key, business_category")
      .single();
    if (error) throw new Error(error.message);
    return website;
  });

// ---- Update a single section (draft autosave) ----
export const updateSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        sectionId: z.string().uuid(),
        content: z.record(z.string(), z.unknown()).optional(),
        is_visible: z.boolean().optional(),
        sort_order: z.number().int().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const patch: {
      content?: Json;
      is_visible?: boolean;
      sort_order?: number;
    } = {};
    if (data.content !== undefined) patch.content = data.content as Json;
    if (data.is_visible !== undefined) patch.is_visible = data.is_visible;
    if (data.sort_order !== undefined) patch.sort_order = data.sort_order;
    const { data: row, error } = await supabase
      .from("website_sections")
      .update(patch)
      .eq("id", data.sectionId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    // Bump draft_updated_at on parent
    await supabase
      .from("user_websites")
      .update({ draft_updated_at: new Date().toISOString() })
      .eq("id", (row as { website_id: string }).website_id);
    return row;
  });

// ---- Reorder sections ----
export const reorderSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        websiteId: z.string().uuid(),
        order: z.array(z.string().uuid()),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    for (let i = 0; i < data.order.length; i++) {
      await supabase
        .from("website_sections")
        .update({ sort_order: i })
        .eq("id", data.order[i])
        .eq("website_id", data.websiteId);
    }
    return { ok: true };
  });

// ---- Update theme ----
export const updateTheme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        websiteId: z.string().uuid(),
        patch: z
          .object({
            primary_color: z.string().optional(),
            secondary_color: z.string().optional(),
            accent_color: z.string().optional(),
            background_color: z.string().optional(),
            text_color: z.string().optional(),
            heading_font: z.string().optional(),
            body_font: z.string().optional(),
            button_style: z.string().optional(),
            extras: z.record(z.string(), z.unknown()).optional(),
          })
          .partial(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const patch = { ...data.patch } as Record<string, unknown>;
    if (patch.extras !== undefined) patch.extras = patch.extras as Json;
    const { data: row, error } = await supabase
      .from("website_theme")
      .update(patch as never)
      .eq("website_id", data.websiteId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---- Publish ----
export const publishWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ websiteId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Snapshot current draft
    const [{ data: sections }, { data: theme }] = await Promise.all([
      supabase.from("website_sections").select("*").eq("website_id", data.websiteId),
      supabase.from("website_theme").select("*").eq("website_id", data.websiteId).maybeSingle(),
    ]);
    const snapshot = { sections: sections ?? [], theme: theme ?? null };

    await supabase
      .from("website_versions")
      .insert({ website_id: data.websiteId, snapshot, note: "Published", created_by: userId });

    const { data: row, error } = await supabase
      .from("user_websites")
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_snapshot: snapshot,
      })
      .eq("id", data.websiteId)
      .eq("owner_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ---- Public: get published website by id (no auth) ----
export const getPublishedWebsite = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ websiteId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: website, error } = await supabase
      .from("user_websites")
      .select("*")
      .eq("id", data.websiteId)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!website) return null;

    const snapshot = (website as { published_snapshot: unknown }).published_snapshot as {
      sections?: WebsiteSection[];
      theme?: WebsiteTheme | null;
    } | null;

    return {
      website,
      sections: snapshot?.sections ?? [],
      theme: snapshot?.theme ?? null,
    };
  });

// ---- Versions (Undo history) ----
const MAX_VERSIONS = 10;

async function snapshotAndPrune(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  websiteId: string,
  userId: string,
  note: string,
) {
  const [{ data: sections }, { data: theme }] = await Promise.all([
    supabase.from("website_sections").select("*").eq("website_id", websiteId),
    supabase.from("website_theme").select("*").eq("website_id", websiteId).maybeSingle(),
  ]);
  const snapshot = { sections: sections ?? [], theme: theme ?? null };
  await supabase
    .from("website_versions")
    .insert({ website_id: websiteId, snapshot, note, created_by: userId });

  // Keep only latest MAX_VERSIONS
  const { data: rows } = await supabase
    .from("website_versions")
    .select("id, created_at")
    .eq("website_id", websiteId)
    .order("created_at", { ascending: false });
  const excess = (rows ?? []).slice(MAX_VERSIONS);
  if (excess.length > 0) {
    await supabase
      .from("website_versions")
      .delete()
      .in(
        "id",
        excess.map((r) => (r as { id: string }).id),
      );
  }
  return snapshot;
}

export const listWebsiteVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ websiteId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("website_versions")
      .select("id, note, created_at, created_by")
      .eq("website_id", data.websiteId)
      .order("created_at", { ascending: false })
      .limit(MAX_VERSIONS);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const saveDraftVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ websiteId: z.string().uuid(), note: z.string().max(200).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Verify ownership
    const { data: w, error } = await supabase
      .from("user_websites")
      .select("id")
      .eq("id", data.websiteId)
      .eq("owner_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!w) throw new Error("Website not found");
    await snapshotAndPrune(supabase, data.websiteId, userId, data.note?.trim() || "Draft saved");
    return { ok: true };
  });

export const restoreWebsiteVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ versionId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: version, error } = await supabase
      .from("website_versions")
      .select("id, website_id, snapshot")
      .eq("id", data.versionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!version) throw new Error("Version not found");

    const websiteId = (version as { website_id: string }).website_id;

    // Verify ownership
    const { data: w } = await supabase
      .from("user_websites")
      .select("id")
      .eq("id", websiteId)
      .eq("owner_id", userId)
      .maybeSingle();
    if (!w) throw new Error("Not authorized");

    // Snapshot current state first so restore itself is undoable
    await snapshotAndPrune(supabase, websiteId, userId, "Before restore");

    const snap = (version as { snapshot: unknown }).snapshot as {
      sections?: Array<Record<string, unknown>>;
      theme?: Record<string, unknown> | null;
    };

    // Wipe & re-insert sections
    await supabase.from("website_sections").delete().eq("website_id", websiteId);
    const toInsert = (snap.sections ?? []).map((s, i) => ({
      website_id: websiteId,
      section_type: (s as { section_type: string }).section_type,
      content: (s as { content: unknown }).content as Json,
      sort_order:
        typeof (s as { sort_order: number }).sort_order === "number"
          ? (s as { sort_order: number }).sort_order
          : i,
      is_visible: (s as { is_visible?: boolean }).is_visible ?? true,
    }));
    if (toInsert.length > 0) {
      const { error: insErr } = await supabase.from("website_sections").insert(toInsert);
      if (insErr) throw new Error(insErr.message);
    }

    // Update theme in place (row already exists per template creation)
    if (snap.theme) {
      const t = snap.theme as Record<string, unknown>;
      const themePatch: Record<string, unknown> = {};
      for (const k of [
        "primary_color",
        "secondary_color",
        "accent_color",
        "background_color",
        "text_color",
        "heading_font",
        "body_font",
        "button_style",
        "extras",
      ]) {
        if (k in t) themePatch[k] = t[k];
      }
      await supabase
        .from("website_theme")
        .update(themePatch as never)
        .eq("website_id", websiteId);
    }

    await supabase
      .from("user_websites")
      .update({ draft_updated_at: new Date().toISOString() })
      .eq("id", websiteId);

    return { ok: true, websiteId };
  });

export const getWebsiteVersionSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ versionId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: version, error } = await supabase
      .from("website_versions")
      .select("id, website_id, snapshot, note, created_at")
      .eq("id", data.versionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!version) throw new Error("Version not found");
    const websiteId = (version as { website_id: string }).website_id;
    const { data: w } = await supabase
      .from("user_websites")
      .select("id")
      .eq("id", websiteId)
      .eq("owner_id", userId)
      .maybeSingle();
    if (!w) throw new Error("Not authorized");
    const snap = (version as { snapshot: unknown }).snapshot as {
      sections?: Array<Record<string, unknown>>;
      theme?: Record<string, unknown> | null;
    };
    return {
      id: (version as { id: string }).id,
      note: (version as { note: string | null }).note,
      created_at: (version as { created_at: string }).created_at,
      sections: (snap.sections ?? []) as unknown as Json,
      theme: (snap.theme ?? null) as unknown as Json,
    };
  });
