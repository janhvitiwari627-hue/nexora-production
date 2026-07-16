import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
  content: Record<string, unknown>;
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
  extras: Record<string, unknown>;
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

    const { data: newId, error } = await supabase.rpc(
      "create_user_website_from_template",
      { _template_id: templateId, _salon_id: data.salonId ?? null },
    );
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
    const patch: Record<string, unknown> = {};
    if (data.content !== undefined) patch.content = data.content;
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
          })
          .partial(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("website_theme")
      .update(data.patch)
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
