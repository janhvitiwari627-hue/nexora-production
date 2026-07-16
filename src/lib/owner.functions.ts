import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { MIN_WITHDRAWAL_AMOUNT } from "./owner.constants";
import { DAILY_WITHDRAWAL_LIMIT, MONTHLY_WITHDRAWAL_LIMIT } from "./owner.validation";

type AuthedSupabase = SupabaseClient<Database>;

// ---------- Owner context: list salons I own/manage ----------
export const getMyOwnedSalons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("salon_owners")
      .select(
        "role, is_approved, selected_template_id, selected_template_key, salon:salons(id, name, slug, image_url, location, address, phone, rating, reviews_count, website_created, selected_template_id, selected_template_key)",
      )
      .eq("user_id", userId)
      .eq("is_approved", true);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => ({
        role: row.role as "owner" | "manager",
        salon: row.salon,
      }))
      .filter((r) => !!r.salon);
  });

// ---------- Website templates: list active ones (public) ----------
export const listWebsiteTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("website_templates")
    .select(
      "id, template_key, template_name, theme_type, category, preview_image, template_slug, description, primary_color, secondary_color, background_color, card_color, text_color, hero_type, template_config_json, sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------- Owner selects a website template ----------
const SelectTemplateInput = z.object({
  salon_id: z.string().uuid(),
  template_id: z.string().uuid(),
});
export const selectWebsiteTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SelectTemplateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: link } = await supabase
      .from("salon_owners")
      .select("id")
      .eq("user_id", userId)
      .eq("salon_id", data.salon_id)
      .eq("is_approved", true)
      .maybeSingle();
    if (!link) throw new Error("Not authorized for this salon");
    const { data: template, error: templateError } = await supabase
      .from("website_templates")
      .select("id, template_key, primary_color, secondary_color")
      .eq("id", data.template_id)
      .eq("is_active", true)
      .maybeSingle();
    if (templateError) throw new Error(templateError.message);
    if (!template) throw new Error("Template not found");
    const { error: ownerError } = await supabase
      .from("salon_owners")
      .update({ selected_template_id: template.id, selected_template_key: template.template_key })
      .eq("id", link.id);
    if (ownerError) throw new Error(ownerError.message);
    const { error } = await supabase
      .from("salons")
      .update({
        selected_template_id: template.id,
        selected_template_key: template.template_key,
        ...(template.primary_color ? { brand_primary: template.primary_color } : {}),
        ...(template.secondary_color ? { brand_secondary: template.secondary_color } : {}),
        website_created: true,
      })
      .eq("id", data.salon_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Owner approval status (pending owners) ----------
export const getMyOwnerApprovalStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("salon_owners")
      .select("id, is_approved, approved_at, salon:salons(id, name, slug)")
      .eq("user_id", userId)
      .order("approved_at", { ascending: false, nullsFirst: true });
    if (error) throw new Error(error.message);
    const links = data ?? [];
    return {
      hasAnyLink: links.length > 0,
      hasApprovedLink: links.some((l) => l.is_approved),
      pending: links
        .filter((l) => !l.is_approved)
        .map((l) => ({
          id: l.id,
          salon: l.salon,
        })),
    };
  });

// ---------- Referral code validation (used during signup) ----------
const ReferralInput = z.object({
  code: z.string().trim().min(3).max(20),
});
export const validateReferralCode = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ReferralInput.parse(d))
  .handler(async ({ data }) => {
    // Public read via service-role bypass would be ideal, but we use anon-safe RPC.
    // Profiles allows public SELECT in this project, so this is fine.
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("referral_code", data.code.toUpperCase())
      .maybeSingle();
    return { valid: !!row, referrerName: row?.full_name ?? null };
  });

// ---------- Salon owner self-registration ----------
const RegisterSalonInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,15}$/),
  city: z.string().trim().min(2).max(80).optional(),
  address: z.string().trim().max(255).optional(),
});
export const registerMySalon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RegisterSalonInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    void userId;
    const { data: salonId, error } = await supabase.rpc("register_owner_business", {
      _shop_name: data.name,
      _district: data.city ?? "Not provided",
      _owner_name: "Salon owner",
      _mobile: data.phone,
      _address: data.address,
    });
    if (error) throw new Error(error.message);
    return { salon_id: salonId };
  });

// ---------- Admin: pending salon-owner approvals ----------
export const listPendingOwnerApprovals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: rows, error } = await context.supabase.rpc("list_pending_owner_salons");
    if (error) throw new Error(error.message);
    return (Array.isArray(rows) ? rows : []) as Array<{
      id: string;
      created_at: string;
      salon: { id: string; name: string; slug: string; city: string | null; phone: string | null };
      user: {
        id: string;
        full_name: string | null;
        email: string | null;
        mobile: string | null;
      } | null;
    }>;
  });

const ApprovalActionInput = z.object({
  owner_request_id: z.string().uuid(),
  approve: z.boolean(),
});
export const setOwnerApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApprovalActionInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("review_owner_salon", {
      _owner_request_id: data.owner_request_id,
      _approve: data.approve,
    });
    if (error) throw new Error(error.message);
    return result;
  });

// ---------- Dashboard metrics ----------
const SalonInput = z.object({ salon_id: z.string().uuid() });

export const getOwnerDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await assertOwnsSalon(supabase, context.userId, data.salon_id);
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const sevenAgo = new Date(today);
    sevenAgo.setDate(sevenAgo.getDate() - 7);
    const thirtyAgo = new Date(today);
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    const [todayRes, weekRes, monthRes, pendingRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, price, advance_amount, status, payment_status")
        .eq("salon_id", data.salon_id)
        .gte("booking_date", start.toISOString().slice(0, 10)),
      supabase
        .from("bookings")
        .select("id, price, advance_amount, status")
        .eq("salon_id", data.salon_id)
        .gte("booking_date", sevenAgo.toISOString().slice(0, 10)),
      supabase
        .from("bookings")
        .select("id, price, advance_amount, status")
        .eq("salon_id", data.salon_id)
        .gte("booking_date", thirtyAgo.toISOString().slice(0, 10)),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", data.salon_id)
        .eq("status", "pending"),
    ]);

    const sumPaid = (rows: { price: number; status: string }[] | null) =>
      (rows ?? [])
        .filter((r) => r.status === "completed" || r.status === "confirmed")
        .reduce((acc, r) => acc + Number(r.price ?? 0), 0);

    return {
      today: { count: todayRes.data?.length ?? 0, revenue: sumPaid(todayRes.data as never) },
      week: { count: weekRes.data?.length ?? 0, revenue: sumPaid(weekRes.data as never) },
      month: { count: monthRes.data?.length ?? 0, revenue: sumPaid(monthRes.data as never) },
      pendingCount: pendingRes.count ?? 0,
    };
  });

// ---------- Bookings list (owner side) ----------
const ListBookingsInput = z.object({
  salon_id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "expired"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const listOwnerBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListBookingsInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    let q = context.supabase
      .from("bookings")
      .select(
        "id, user_id, service_name, booking_date, booking_time, price, advance_amount, status, payment_status, created_at, proposed_date, proposed_time, proposal_status, proposal_note, service_mode, service_address, home_service_charge, customer:profiles(full_name, mobile)",
      )
      .eq("salon_id", data.salon_id)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false })
      .limit(200);
    if (data.status) q = q.eq("status", data.status);
    if (data.from) q = q.gte("booking_date", data.from);
    if (data.to) q = q.lte("booking_date", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const UpdateBookingStatusInput = z.object({
  booking_id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

export const updateOwnerBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateBookingStatusInput.parse(d))
  .handler(async ({ data, context }) => {
    const action =
      data.status === "confirmed"
        ? "confirm"
        : data.status === "cancelled"
          ? "reject"
          : data.status === "completed"
            ? "complete"
            : data.status === "no_show"
              ? "no_show"
              : null;
    if (!action) throw new Error("Pending is not a valid owner action");
    const { data: row, error } = await context.supabase.rpc("owner_transition_booking", {
      _booking_id: data.booking_id,
      _action: action,
    });
    if (error) throw new Error(error.message);
    return row;
  });

const SuggestBookingTimeInput = z.object({
  booking_id: z.string().uuid(),
  proposed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  proposed_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  note: z.string().trim().max(300).optional(),
});

export const suggestOwnerBookingTime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SuggestBookingTimeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.rpc("owner_transition_booking", {
      _booking_id: data.booking_id,
      _action: "suggest_time",
      _proposed_date: data.proposed_date,
      _proposed_time: data.proposed_time,
      _note: data.note,
    });
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Services CRUD ----------
const ServiceUpsertInput = z.object({
  id: z.string().uuid().optional(),
  salon_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().max(50).nullable().optional(),
  duration_minutes: z.number().int().min(5).max(600).default(30),
  price: z.number().min(0).max(1_000_000),
  is_active: z.boolean().default(true),
  image_url: z.string().url().nullable().optional(),
});

export const listOwnerServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { data: rows, error } = await context.supabase
      .from("services")
      .select("*")
      .eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertOwnerService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ServiceUpsertInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { error, data: row } = data.id
      ? await context.supabase.from("services").update(data).eq("id", data.id).select().single()
      : await context.supabase.from("services").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteOwnerService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Staff CRUD ----------
const StaffUpsertInput = z.object({
  id: z.string().uuid().optional(),
  salon_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  role: z.string().max(80).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  rating: z.number().min(0).max(5).default(5),
  is_active: z.boolean().default(true),
});

export const listOwnerStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { data: rows, error } = await context.supabase
      .from("staff")
      .select("*")
      .eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertOwnerStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StaffUpsertInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { error, data: row } = data.id
      ? await context.supabase.from("staff").update(data).eq("id", data.id).select().single()
      : await context.supabase.from("staff").insert(data).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteOwnerStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("staff").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Analytics timeseries (revenue & bookings per day) ----------
const AnalyticsInput = z.object({
  salon_id: z.string().uuid(),
  days: z.number().int().min(7).max(180).default(30),
});

export const getOwnerAnalyticsTimeseries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AnalyticsInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const from = new Date();
    from.setDate(from.getDate() - data.days);
    const { data: rows, error } = await context.supabase
      .from("bookings")
      .select("booking_date, price, status")
      .eq("salon_id", data.salon_id)
      .gte("booking_date", from.toISOString().slice(0, 10));
    if (error) throw new Error(error.message);
    const byDay = new Map<string, { date: string; bookings: number; revenue: number }>();
    for (let i = 0; i < data.days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (data.days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { date: key, bookings: 0, revenue: 0 });
    }
    for (const r of rows ?? []) {
      const slot = byDay.get(r.booking_date);
      if (!slot) continue;
      slot.bookings += 1;
      if (r.status === "completed" || r.status === "confirmed") {
        slot.revenue += Number(r.price ?? 0);
      }
    }
    return Array.from(byDay.values());
  });

// ---------- AI marketing copy (Lovable AI gateway) ----------
const MarketingInput = z.object({
  salon_id: z.string().uuid(),
  goal: z.enum(["winback", "promo", "review_request", "festival", "new_service"]),
  tone: z.enum(["friendly", "premium", "playful", "urgent"]).default("friendly"),
  extra: z.string().max(500).optional(),
});

export const generateMarketingCopy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MarketingInput.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Lovable AI is not configured.");
    const { data: salon } = await context.supabase
      .from("salons")
      .select("name, location, category")
      .eq("id", data.salon_id)
      .single();
    const system =
      "You write short marketing messages for Indian beauty salons. Output JSON: { sms: string (<=160 chars), whatsapp: string (<=400 chars), email_subject: string, email_body: string }. Be warm, no emojis in SMS, use Rupee symbol ₹ when mentioning price. Reply with JSON only, no markdown.";
    const user = `Salon: ${salon?.name ?? "Salon"} in ${salon?.location ?? "your city"} (${salon?.category ?? "beauty"}). Goal: ${data.goal}. Tone: ${data.tone}. Notes: ${data.extra ?? "none"}.`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) throw new Error("AI is busy. Please try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Please top up in Settings → Plans.");
    if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(text) as {
        sms: string;
        whatsapp: string;
        email_subject: string;
        email_body: string;
      };
    } catch {
      return { sms: text, whatsapp: text, email_subject: "", email_body: text };
    }
  });

// ---------- Salon (website builder) ----------
export const getOwnerSalonFull = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { data: row, error } = await context.supabase
      .from("salons")
      .select("*")
      .eq("id", data.salon_id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const blankStringToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const nullableUrl = z.preprocess(blankStringToNull, z.string().url().nullable().optional());

const nullableEmail = z.preprocess(
  blankStringToNull,
  z.string().email().max(160).nullable().optional(),
);

const nullableUpiId = z.preprocess(
  blankStringToNull,
  z
    .string()
    .max(120)
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,64}$/)
    .nullable()
    .optional(),
);

const SalonUpdateInput = z.object({
  salon_id: z.string().uuid(),
  patch: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    category: z.string().max(80).nullable().optional(),
    owner_name: z.string().max(120).nullable().optional(),
    tagline: z.string().max(200).nullable().optional(),
    description: z.string().max(2000).nullable().optional(),
    about_us: z.string().max(4000).nullable().optional(),
    image_url: nullableUrl,
    logo_url: nullableUrl,
    cover_image_url: nullableUrl,
    owner_profile_image_url: nullableUrl,
    video_url: nullableUrl,
    brand_primary: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .nullable()
      .optional(),
    brand_secondary: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .nullable()
      .optional(),
    theme: z.string().max(40).nullable().optional(),
    custom_css: z.string().max(20000).nullable().optional(),
    seo_title: z.string().max(120).nullable().optional(),
    seo_description: z.string().max(300).nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
    whatsapp: z.string().max(20).nullable().optional(),
    email: nullableEmail,
    address: z.string().max(300).nullable().optional(),
    location: z.string().max(120).nullable().optional(),
    city: z.string().max(80).nullable().optional(),
    pincode: z.string().max(12).nullable().optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    upi_id: nullableUpiId,
    is_home_service: z.boolean().optional(),
    home_service_charge: z.number().min(0).max(100_000).optional(),
    home_service_radius_km: z.number().min(0).max(100).optional(),
    hours: z
      .record(
        z.string(),
        z.object({
          open: z.string(),
          close: z.string(),
          closed: z.boolean(),
        }),
      )
      .nullable()
      .optional(),
    gallery_images: z.array(z.string().url()).max(5).optional(),
  }),
});

export const updateOwnerSalon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const parsed = SalonUpdateInput.safeParse(d);
    if (!parsed.success) {
      const fields = Array.from(new Set(parsed.error.issues.map((issue) => issue.path.join("."))))
        .filter(Boolean)
        .map((path) => path.replace(/^patch\./, ""));
      throw new Error(
        `Invalid setup field${fields.length === 1 ? "" : "s"}: ${fields.join(", ") || "details"}`,
      );
    }
    return parsed.data;
  })
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { error, data: row } = await context.supabase
      .from("salons")
      .update(data.patch as never)
      .eq("id", data.salon_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const markSalonSetupComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc("complete_owner_salon_setup", {
      _salon_id: data.salon_id,
    });
    if (error) throw new Error(error.message);
    const parsed = result as {
      ok?: boolean;
      missing?: string[];
      awaiting_approval?: boolean;
    } | null;
    return {
      ok: parsed?.ok === true,
      missing: Array.isArray(parsed?.missing) ? parsed.missing : [],
      awaitingApproval: parsed?.awaiting_approval === true,
    };
  });

// ---------- Wallet ----------
export const getOwnerWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await assertOwnsSalon(supabase, context.userId, data.salon_id);
    let { data: wallet } = await supabase
      .from("salon_wallets")
      .select("*")
      .eq("salon_id", data.salon_id)
      .maybeSingle();
    if (!wallet) {
      const { data: created, error } = await supabase
        .from("salon_wallets")
        .insert({ salon_id: data.salon_id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      wallet = created;
    }
    const { data: txns } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false })
      .limit(50);
    return { wallet, transactions: txns ?? [] };
  });

// ---------- Withdrawals ----------
const WithdrawalRequestInput = z.object({
  salon_id: z.string().uuid(),
  amount: z.number().positive(),
  bank_account_details: z.record(z.string(), z.any()).optional(),
});

export const requestOwnerWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => WithdrawalRequestInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await assertOwnsSalon(supabase, context.userId, data.salon_id);
    if (data.amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new Error(`Minimum withdrawal is ₹${MIN_WITHDRAWAL_AMOUNT}`);
    }
    const { data: wallet } = await supabase
      .from("salon_wallets")
      .select("available_balance")
      .eq("salon_id", data.salon_id)
      .maybeSingle();
    const available = Number(wallet?.available_balance ?? 0);
    if (data.amount > available) throw new Error("Insufficient balance");

    // Daily + monthly withdrawal caps (sum of non-rejected requests).
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: recent } = await supabase
      .from("withdrawals")
      .select("amount, status, created_at")
      .eq("salon_id", data.salon_id)
      .neq("status", "REJECTED")
      .gte("created_at", startOfMonth.toISOString());
    const dayTotal = (recent ?? [])
      .filter((w) => new Date(w.created_at) >= startOfDay)
      .reduce((s, w) => s + Number(w.amount), 0);
    const monthTotal = (recent ?? []).reduce((s, w) => s + Number(w.amount), 0);
    if (dayTotal + data.amount > DAILY_WITHDRAWAL_LIMIT) {
      throw new Error(
        `Daily withdrawal limit is ₹${DAILY_WITHDRAWAL_LIMIT.toLocaleString("en-IN")}`,
      );
    }
    if (monthTotal + data.amount > MONTHLY_WITHDRAWAL_LIMIT) {
      throw new Error(
        `Monthly withdrawal limit is ₹${MONTHLY_WITHDRAWAL_LIMIT.toLocaleString("en-IN")}`,
      );
    }
    const { data: row, error } = await supabase
      .from("withdrawals")
      .insert({
        salon_id: data.salon_id,
        amount: data.amount,
        bank_account_details: data.bank_account_details ?? null,
        status: "PENDING",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listOwnerWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { data: rows, error } = await context.supabase
      .from("withdrawals")
      .select("*")
      .eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------- Bulk service pricing ----------
const BulkPricingInput = z.object({
  salon_id: z.string().uuid(),
  service_ids: z.array(z.string().uuid()).min(1),
  mode: z.enum(["set", "percent", "delta"]),
  value: z.number(),
});

export const bulkUpdateServicePricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BulkPricingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await assertOwnsSalon(supabase, context.userId, data.salon_id);
    const { data: rows, error } = await supabase
      .from("services")
      .select("id, price")
      .eq("salon_id", data.salon_id)
      .in("id", data.service_ids);
    if (error) throw new Error(error.message);
    const updates = (rows ?? []).map((r) => {
      const current = Number(r.price);
      let next = current;
      if (data.mode === "set") next = data.value;
      else if (data.mode === "percent") next = current * (1 + data.value / 100);
      else if (data.mode === "delta") next = current + data.value;
      return { id: r.id, price: Math.max(0, Number(next.toFixed(2))) };
    });
    for (const u of updates) {
      const { error: upErr } = await supabase
        .from("services")
        .update({ price: u.price })
        .eq("id", u.id);
      if (upErr) throw new Error(upErr.message);
    }
    return { updated: updates.length };
  });

// ---------- Salon gallery (live photos) ----------
const SalonIdInput = z.object({ salon_id: z.string().uuid() });

async function assertOwnsSalon(supabase: AuthedSupabase, userId: string, salonId: string) {
  const { data } = await supabase.rpc("is_salon_owner", { _user_id: userId, _salon_id: salonId });
  if (!data) throw new Error("Forbidden");
}

export const getSalonGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonIdInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { data: salon, error } = await context.supabase
      .from("salons")
      .select("gallery_images, cover_image_url")
      .eq("id", data.salon_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      images: (salon?.gallery_images ?? []) as string[],
      cover: salon?.cover_image_url ?? null,
    };
  });

const SetGalleryInput = z.object({
  salon_id: z.string().uuid(),
  images: z.array(z.string().url()).max(5),
  cover: z.string().url().nullable().optional(),
});
export const setSalonGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SetGalleryInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const patch: { gallery_images: string[]; cover_image_url?: string | null } = {
      gallery_images: data.images,
    };
    if (data.cover !== undefined) patch.cover_image_url = data.cover;
    const { error } = await context.supabase.from("salons").update(patch).eq("id", data.salon_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Reviews ----------
export const listOwnerReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonIdInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertOwnsSalon(context.supabase, context.userId, data.salon_id);
    const { data: rows, error } = await context.supabase
      .from("reviews")
      .select(
        "id, salon_id, user_id, rating, comment, created_at, updated_at, owner_reply, owner_replied_at, customer:profiles!reviews_user_id_fkey(full_name, avatar_url)",
      )
      .eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

const ReviewReplyInput = z.object({
  review_id: z.string().uuid(),
  reply: z.string().trim().min(1).max(1000),
});

export const replyToOwnerReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ReviewReplyInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.rpc("reply_to_salon_review", {
      _review_id: data.review_id,
      _reply: data.reply,
    });
    if (error) throw new Error(error.message);
    return row;
  });
