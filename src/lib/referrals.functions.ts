import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReferralAttributionStatus = "joined" | "rewarded";

export interface ReferralAttribution {
  id: string;
  name: string;
  signedUpAt: string;
  status: ReferralAttributionStatus;
}

export const getMyReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReferralAttribution[]> => {
    const [attributionsResult, legacyResult] = await Promise.all([
      context.supabase
        .from("referral_attributions")
        .select("id, referred_user_id, validated_at, status")
        .eq("referrer_user_id", context.userId)
        .order("validated_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("referrals")
        .select("id, referred_user_id, created_at, status")
        .eq("referrer_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    // Both tables are protected by RLS and expose only this signed-in user's
    // referrals. The user's token removes the need for an admin secret here.
    if (attributionsResult.error && legacyResult.error) {
      console.error("[Referrals] Attribution query failed", {
        attributionCode: attributionsResult.error.code,
        legacyCode: legacyResult.error.code,
      });
      throw new Error("Could not load referral activity");
    }

    const rows = new Map<string, ReferralAttribution>();

    for (const row of attributionsResult.data ?? []) {
      const key = row.referred_user_id || row.id;
      rows.set(key, {
        id: row.id,
        name: "Nexora member",
        signedUpAt: row.validated_at,
        status: row.status === "rewarded" ? "rewarded" : "joined",
      });
    }

    // Keep the original referrals table as a fallback for accounts created
    // before referral_attributions was introduced.
    for (const row of legacyResult.data ?? []) {
      const key = row.referred_user_id || row.id;
      if (rows.has(key)) continue;
      rows.set(key, {
        id: row.id,
        name: "Nexora member",
        signedUpAt: row.created_at,
        status: row.status === "rewarded" ? "rewarded" : "joined",
      });
    }

    return [...rows.values()]
      .sort((a, b) => Date.parse(b.signedUpAt) - Date.parse(a.signedUpAt))
      .slice(0, 200);
  });
