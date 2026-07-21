import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ReferralAttributionStatus = "joined" | "rewarded";

export interface ReferralAttribution {
  id: string;
  name: string;
  signedUpAt: string;
  status: ReferralAttributionStatus;
}

type LiveReferralRow = {
  id: string;
  referred_customer_id: string | null;
  signed_up_at: string | null;
  created_at: string;
  status: string;
};

export const getMyReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ReferralAttribution[]> => {
    // The production referral ledger uses customer-oriented column names.
    // Cast only at this query boundary until the generated database types are
    // refreshed from the live project.
    const referralsResult = await context.supabase
      .from("referrals")
      .select("id, referred_customer_id, signed_up_at, created_at, status")
      .eq("referrer_customer_id" as never, context.userId)
      .order("created_at", { ascending: false })
      .limit(200);

    // RLS exposes only this signed-in user's rows. The user's token removes the
    // need for an admin secret here.
    if (referralsResult.error) {
      console.error("[Referrals] Ledger query failed", {
        code: referralsResult.error.code,
      });
      throw new Error("Could not load referral activity");
    }

    return ((referralsResult.data ?? []) as unknown as LiveReferralRow[])
      .map((row) => ({
        id: row.id,
        name: "Nexora member",
        signedUpAt: row.signed_up_at ?? row.created_at,
        status: row.status === "rewarded" ? "rewarded" : "joined",
      }))
      .sort((a, b) => Date.parse(b.signedUpAt) - Date.parse(a.signedUpAt))
      .slice(0, 200);
  });
