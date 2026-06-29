import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// -------- Public read client (anon, no session) --------
function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// =============================================================
// 1) Partner Registration (auth required)
// =============================================================
export const registerDistrictPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().trim().min(2).max(100),
        mobile: z.string().trim().min(7).max(20).optional(),
        email: z.string().trim().email().max(255).optional(),
        district: z.string().trim().min(2).max(80),
        state: z.string().trim().max(80).optional(),
        pincode: z.string().trim().max(10).optional(),
        tagline: z.string().trim().max(200).optional(),
        success_story: z.string().trim().max(2000).optional(),
        photo_url: z.string().url().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const baseSlug = slugify(`${data.full_name}-${data.district}`);
    let slug = baseSlug || `dbp-${userId.slice(0, 8)}`;
    // collision-safe slug
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabase
        .from("district_business_partners")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!exists) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 9999)}`;
    }
    const { data: row, error } = await supabase
      .from("district_business_partners")
      .insert({ ...data, slug, user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// =============================================================
// 2) Partner Verification (admin)
// =============================================================
export const verifyDistrictPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        partner_id: z.string().uuid(),
        action: z.enum(["verify", "reject", "suspend"]),
        reason: z.string().trim().max(500).optional(),
        tier: z
          .enum(["welcome", "recognition", "growth_builder", "platinum", "leadership_circle"])
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const status =
      data.action === "verify" ? "verified" : data.action === "reject" ? "rejected" : "suspended";

    const patch: {
      status: "verified" | "rejected" | "suspended";
      rejection_reason: string | null;
      verified_at?: string;
      verified_by?: string;
      tier?: "welcome" | "recognition" | "growth_builder" | "platinum" | "leadership_circle";
    } = {
      status,
      rejection_reason: data.action === "reject" ? data.reason ?? null : null,
    };
    if (data.action === "verify") {
      patch.verified_at = new Date().toISOString();
      patch.verified_by = userId;
      if (data.tier) patch.tier = data.tier;
    }

    const { data: row, error } = await supabase
      .from("district_business_partners")
      .update(patch)
      .eq("id", data.partner_id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// =============================================================
// 3) Shop Mapping
// =============================================================
export const addPartnerShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        partner_id: z.string().uuid(),
        shop_name: z.string().trim().min(2).max(150),
        owner_name: z.string().trim().max(150).optional(),
        mobile: z.string().trim().max(20).optional(),
        area: z.string().trim().max(120).optional(),
        city: z.string().trim().max(120).optional(),
        salon_id: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: owns } = await supabase.rpc("is_district_partner", {
      _user_id: userId,
      _partner_id: data.partner_id,
    });
    if (!owns) throw new Error("Forbidden");

    const { data: row, error } = await supabase
      .from("partner_shop_mapping")
      .insert(data)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("partner_activity_logs").insert({
      partner_id: data.partner_id,
      actor_id: userId,
      action: "shop_added",
      entity_type: "partner_shop_mapping",
      entity_id: row.id,
      details: { shop_name: data.shop_name },
    });
    await supabase.rpc("recompute_partner_dashboard_metrics", { _partner_id: data.partner_id });
    return row;
  });

export const activatePartnerShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ shop_id: z.string().uuid(), revenue_generated: z.number().min(0).optional() }).parse(
      input,
    ),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const patch: { is_active: true; activated_at: string; revenue_generated?: number } = {
      is_active: true,
      activated_at: new Date().toISOString(),
    };
    if (typeof data.revenue_generated === "number")
      patch.revenue_generated = data.revenue_generated;
    const { data: row, error } = await supabase
      .from("partner_shop_mapping")
      .update(patch)
      .eq("id", data.shop_id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await supabase.rpc("recompute_partner_dashboard_metrics", { _partner_id: row.partner_id });
    return row;
  });

export const listPartnerShops = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ partner_id: z.string().uuid(), only_active: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("partner_shop_mapping")
      .select("*")
      .eq("partner_id", data.partner_id)
      .order("created_at", { ascending: false });
    if (data.only_active) q = q.eq("is_active", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =============================================================
// 4) Reward Tracking
// =============================================================
export const listPartnerRewards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ partner_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("partner_rewards")
      .select("*")
      .eq("partner_id", data.partner_id)
      .order("unlocked_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =============================================================
// 5) Milestone Tracking
// =============================================================
export const listPartnerMilestones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ partner_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("partner_milestones")
      .select("*")
      .eq("partner_id", data.partner_id)
      .order("shops_required", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =============================================================
// 6) Revenue Tracking (earnings)
// =============================================================
export const listPartnerEarnings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        partner_id: z.string().uuid(),
        status: z.enum(["pending", "approved", "paid", "rejected"]).optional(),
        limit: z.number().int().min(1).max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("partner_earnings")
      .select("*")
      .eq("partner_id", data.partner_id)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =============================================================
// 7) Payout Management
// =============================================================
export const listPartnerPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ partner_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("partner_payouts")
      .select("*")
      .eq("partner_id", data.partner_id)
      .order("cycle_end", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const requestPartnerPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        partner_id: z.string().uuid(),
        amount: z.number().positive().max(10000000),
        bank_account: z.any().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: owns } = await supabase.rpc("is_district_partner", {
      _user_id: userId,
      _partner_id: data.partner_id,
    });
    if (!owns) throw new Error("Forbidden");

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6);

    const { data: row, error } = await supabase
      .from("partner_payouts")
      .insert({
        partner_id: data.partner_id,
        cycle_start: start.toISOString().slice(0, 10),
        cycle_end: today.toISOString().slice(0, 10),
        amount: data.amount,
        status: "pending",
        bank_account: (data.bank_account ?? null) as never,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// =============================================================
// 8) Leaderboard
// =============================================================
export const getPartnerLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        period: z.enum(["weekly", "monthly", "all_time"]).default("monthly"),
        scope: z.string().max(40).optional(),
        limit: z.number().int().min(1).max(100).default(20),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("partner_leaderboard_public")
      .select(
        "id, partner_id, period, rank, active_shops, score, district, state, scope",
      )
      .eq("period", data.period)
      .order("rank", { ascending: true })
      .limit(data.limit);
    if (data.scope) q = q.eq("scope", data.scope);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =============================================================
// 9) Hall of Fame
// =============================================================
export const getHallOfFame = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        category: z.string().max(40).default("overall"),
        limit: z.number().int().min(1).max(50).default(12),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: hof, error } = await sb
      .from("partner_hall_of_fame_public")
      .select("*")
      .eq("category", data.category)
      .order("rank", { ascending: true })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    if (!hof?.length) return [];
    const ids = hof.map((h) => h.partner_id).filter((id): id is string => !!id);
    const { data: partners } = await sb
      .from("public_dbp_profiles")
      .select("id, slug, full_name, district, state, photo_url, tagline, tier")
      .in("id", ids);
    const byId = new Map((partners ?? []).map((p) => [p.id, p]));
    return hof.map((h) => ({ ...h, partner: byId.get(h.partner_id) ?? null }));
  });

// =============================================================
// 10) Analytics — dashboard metrics + chart series
// =============================================================
export const getPartnerAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ partner_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await supabase.rpc("recompute_partner_dashboard_metrics", { _partner_id: data.partner_id });

    const [metricsRes, earningsRes, payoutsRes, milestonesRes] = await Promise.all([
      supabase
        .from("partner_dashboard_metrics")
        .select("*")
        .eq("partner_id", data.partner_id)
        .maybeSingle(),
      supabase
        .from("partner_earnings")
        .select("created_at, amount, type, status")
        .eq("partner_id", data.partner_id)
        .order("created_at", { ascending: true })
        .limit(500),
      supabase
        .from("partner_payouts")
        .select("cycle_end, amount, status")
        .eq("partner_id", data.partner_id)
        .order("cycle_end", { ascending: true })
        .limit(200),
      supabase
        .from("partner_milestones")
        .select("milestone_code, shops_required, unlocked, unlocked_at, tier")
        .eq("partner_id", data.partner_id)
        .order("shops_required", { ascending: true }),
    ]);

    return {
      metrics: metricsRes.data ?? null,
      earnings_series: earningsRes.data ?? [],
      payouts_series: payoutsRes.data ?? [],
      milestones: milestonesRes.data ?? [],
    };
  });

// =============================================================
// Public profile fetch (anon) — for the public DBP profile page
// =============================================================
export const getPublicPartnerProfile = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(2).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: partner, error } = await sb
      .from("public_dbp_profiles")
      .select(
        "id, slug, full_name, district, state, photo_url, tagline, success_story, tier, hall_of_fame, hall_of_fame_rank, verified_at",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!partner) return null;
    if (!partner.id) return { partner, hall_of_fame: null };
    const { data: hof } = await sb
      .from("partner_hall_of_fame_public")
      .select("rank, category, active_shops, achievements, success_story, badge")
      .eq("partner_id", partner.id)
      .order("rank", { ascending: true })
      .limit(1)
      .maybeSingle();

    return { partner, hall_of_fame: hof ?? null };
  });
