import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- Owner context: list salons I own/manage ----------
export const getMyOwnedSalons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("salon_owners")
      .select("role, salon:salons(id, name, slug, image_url, location, address, phone, rating, reviews_count)")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      role: row.role as "owner" | "manager",
      salon: row.salon,
    })).filter((r) => !!r.salon);
  });

// ---------- Dashboard metrics ----------
const SalonInput = z.object({ salon_id: z.string().uuid() });

export const getOwnerDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const sevenAgo = new Date(today); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const thirtyAgo = new Date(today); thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    const [todayRes, weekRes, monthRes, pendingRes] = await Promise.all([
      supabase.from("bookings").select("id, price, advance_amount, status, payment_status")
        .eq("salon_id", data.salon_id).gte("booking_date", start.toISOString().slice(0, 10)),
      supabase.from("bookings").select("id, price, advance_amount, status")
        .eq("salon_id", data.salon_id).gte("booking_date", sevenAgo.toISOString().slice(0, 10)),
      supabase.from("bookings").select("id, price, advance_amount, status")
        .eq("salon_id", data.salon_id).gte("booking_date", thirtyAgo.toISOString().slice(0, 10)),
      supabase.from("bookings").select("id", { count: "exact", head: true })
        .eq("salon_id", data.salon_id).eq("status", "pending"),
    ]);

    const sumPaid = (rows: { price: number; status: string }[] | null) =>
      (rows ?? []).filter((r) => r.status === "completed" || r.status === "confirmed")
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
    let q = context.supabase
      .from("bookings")
      .select("id, user_id, service_name, booking_date, booking_time, price, advance_amount, status, payment_status, created_at")
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
  status: z.enum(["confirmed", "completed", "cancelled"]),
});

export const updateOwnerBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateBookingStatusInput.parse(d))
  .handler(async ({ data, context }) => {
    const patch: { status: typeof data.status; cancelled_at?: string } = { status: data.status };
    if (data.status === "cancelled") patch.cancelled_at = new Date().toISOString();
    const { data: row, error } = await context.supabase
      .from("bookings").update(patch).eq("id", data.booking_id).select().single();
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
    const { data: rows, error } = await context.supabase
      .from("services").select("*").eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertOwnerService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ServiceUpsertInput.parse(d))
  .handler(async ({ data, context }) => {
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
    const { data: rows, error } = await context.supabase
      .from("staff").select("*").eq("salon_id", data.salon_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const upsertOwnerStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StaffUpsertInput.parse(d))
  .handler(async ({ data, context }) => {
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
      const d = new Date(); d.setDate(d.getDate() - (data.days - 1 - i));
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
      .from("salons").select("name, location, category").eq("id", data.salon_id).single();
    const system = "You write short marketing messages for Indian beauty salons. Output JSON: { sms: string (<=160 chars), whatsapp: string (<=400 chars), email_subject: string, email_body: string }. Be warm, no emojis in SMS, use Rupee symbol ₹ when mentioning price. Reply with JSON only, no markdown.";
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
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up in Settings → Plans.");
    if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);
    const json = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(text) as { sms: string; whatsapp: string; email_subject: string; email_body: string };
    } catch {
      return { sms: text, whatsapp: text, email_subject: "", email_body: text };
    }
  });
