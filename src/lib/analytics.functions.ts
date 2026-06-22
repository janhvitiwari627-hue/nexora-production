import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RangeInput = z.object({
  salonId: z.string().uuid(),
  days: z.number().int().min(1).max(365).default(30),
});

export type OwnerAnalyticsResult = {
  range: { days: number; from: string; to: string };
  kpis: {
    revenue: number;
    bookings: number;
    completed: number;
    cancelled: number;
    newCustomers: number;
    repeatRate: number;
    completionRate: number;
    cancellationRate: number;
  };
  revenueTrend: { label: string; revenue: number }[];
  bookingsTrend: { label: string; bookings: number }[];
  customerTrend: { label: string; new: number; returning: number }[];
  topServices: { name: string; bookings: number; revenue: number }[];
  aiSummary: string | null;
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const getOwnerAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RangeInput.parse(d))
  .handler(async ({ data, context }): Promise<OwnerAnalyticsResult> => {
    // Ownership
    const { data: isOwner } = await context.supabase.rpc("is_salon_owner", {
      _user_id: context.userId,
      _salon_id: data.salonId,
    });
    if (!isOwner) throw new Error("Not authorized for this salon");

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - data.days + 1);

    const { data: rows, error } = await context.supabase
      .from("bookings")
      .select("user_id, service_name, price, status, booking_date, created_at")
      .eq("salon_id", data.salonId)
      .gte("booking_date", from.toISOString().slice(0, 10))
      .lte("booking_date", to.toISOString().slice(0, 10));
    if (error) throw new Error(error.message);

    const all = rows ?? [];

    // Seed buckets so the chart has every day
    const buckets = new Map<string, { revenue: number; bookings: number; new: number; returning: number }>();
    for (let i = 0; i < data.days; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      buckets.set(dayKey(d), { revenue: 0, bookings: 0, new: 0, returning: 0 });
    }

    // Determine first-ever booking per user within this salon for "new" classification
    const firstSeen = new Map<string, string>();
    for (const r of all) {
      const k = dayKey(new Date(r.created_at as string));
      const prev = firstSeen.get(r.user_id as string);
      if (!prev || k < prev) firstSeen.set(r.user_id as string, k);
    }

    let revenue = 0;
    let completed = 0;
    let cancelled = 0;
    const customerBookingCount = new Map<string, number>();
    const services = new Map<string, { bookings: number; revenue: number }>();

    for (const r of all) {
      const key = dayKey(new Date(r.booking_date as string));
      const b = buckets.get(key);
      if (!b) continue;
      b.bookings += 1;
      if (r.status === "completed") {
        completed += 1;
        revenue += Number(r.price) || 0;
        b.revenue += Number(r.price) || 0;
      }
      if (r.status === "cancelled") cancelled += 1;

      const uid = r.user_id as string;
      customerBookingCount.set(uid, (customerBookingCount.get(uid) ?? 0) + 1);
      const firstKey = firstSeen.get(uid);
      if (firstKey === dayKey(new Date(r.created_at as string))) {
        // First booking in this window — count as "new" on its booking_date bucket
        b.new += 1;
      } else {
        b.returning += 1;
      }

      const svc = (r.service_name as string) || "Unknown";
      const sv = services.get(svc) ?? { bookings: 0, revenue: 0 };
      sv.bookings += 1;
      if (r.status === "completed") sv.revenue += Number(r.price) || 0;
      services.set(svc, sv);
    }

    const totalCustomers = customerBookingCount.size;
    const repeatCustomers = [...customerBookingCount.values()].filter((c) => c > 1).length;
    const repeatRate = totalCustomers > 0 ? repeatCustomers / totalCustomers : 0;

    const sortedKeys = [...buckets.keys()].sort();
    const revenueTrend = sortedKeys.map((k) => ({ label: k.slice(5), revenue: buckets.get(k)!.revenue }));
    const bookingsTrend = sortedKeys.map((k) => ({ label: k.slice(5), bookings: buckets.get(k)!.bookings }));
    const customerTrend = sortedKeys.map((k) => ({
      label: k.slice(5),
      new: buckets.get(k)!.new,
      returning: buckets.get(k)!.returning,
    }));

    const topServices = [...services.entries()]
      .map(([name, v]) => ({ name, bookings: v.bookings, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalBookings = all.length;
    const newCustomers = [...firstSeen.values()].filter((k) => k >= dayKey(from)).length;

    const kpis = {
      revenue: Math.round(revenue),
      bookings: totalBookings,
      completed,
      cancelled,
      newCustomers,
      repeatRate: Math.round(repeatRate * 100) / 100,
      completionRate: totalBookings > 0 ? Math.round((completed / totalBookings) * 100) / 100 : 0,
      cancellationRate: totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) / 100 : 0,
    };

    // AI summary (best-effort; degrade silently)
    let aiSummary: string | null = null;
    const key = process.env.LOVABLE_API_KEY;
    if (key && totalBookings > 0) {
      try {
        const [{ generateText }, { createLovableAiGatewayProvider }] = await Promise.all([
          import("ai"),
          import("./ai-gateway.server"),
        ]);
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const facts = {
          windowDays: data.days,
          ...kpis,
          topServices: topServices.slice(0, 3).map((s) => s.name),
          peakDay:
            bookingsTrend.reduce(
              (best, cur) => (cur.bookings > best.bookings ? cur : best),
              bookingsTrend[0] ?? { label: "—", bookings: 0 },
            ).label,
        };
        const { text } = await generateText({
          model,
          system:
            "You are an analytics assistant for an Indian salon owner. Write 2–3 short sentences (max 60 words) summarising performance and ONE concrete action. Use ₹ for currency. No markdown.",
          prompt: `Stats (last ${data.days}d): ${JSON.stringify(facts)}`,
        });
        aiSummary = text.trim();
      } catch {
        aiSummary = null;
      }
    }

    return {
      range: { days: data.days, from: from.toISOString(), to: to.toISOString() },
      kpis,
      revenueTrend,
      bookingsTrend,
      customerTrend,
      topServices,
      aiSummary,
    };
  });
