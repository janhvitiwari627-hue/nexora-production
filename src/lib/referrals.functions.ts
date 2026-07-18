import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReferralAttributionStatus = "pending" | "converted";

export interface ReferralAttribution {
  id: string;
  name: string;
  signedUpAt: string;
  status: ReferralAttributionStatus;
  bookingsCount: number;
}

export const getMyReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReferralAttribution[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: referred, error: refErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("referred_by_user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (refErr) throw refErr;
    const rows = referred ?? [];
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("user_id, status")
      .in("user_id", ids);

    const counts = new Map<string, number>();
    for (const b of bookings ?? []) {
      if (!b.user_id) continue;
      counts.set(b.user_id, (counts.get(b.user_id) ?? 0) + 1);
    }

    const mask = (name: string | null, email: string | null): string => {
      const n = (name ?? "").trim();
      if (n) return n;
      const e = (email ?? "").trim();
      if (!e) return "New member";
      const [local] = e.split("@");
      if (!local) return "New member";
      if (local.length <= 2) return `${local[0] ?? "•"}***`;
      return `${local.slice(0, 2)}***`;
    };

    return rows.map((r) => {
      const bookingsCount = counts.get(r.id) ?? 0;
      return {
        id: r.id,
        name: mask(r.full_name, r.email),
        signedUpAt: r.created_at ?? new Date().toISOString(),
        status: bookingsCount > 0 ? "converted" : "pending",
        bookingsCount,
      };
    });
  });
