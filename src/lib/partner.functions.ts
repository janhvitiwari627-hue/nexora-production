import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PartnerOverview = {
  hasPartner: boolean;
  activeShops: number;
  totalShops: number;
  lifetimeEarnings: number;
  pendingEarnings: number;
  currentMonthPayout: number;
};

const ZERO: PartnerOverview = {
  hasPartner: false,
  activeShops: 0,
  totalShops: 0,
  lifetimeEarnings: 0,
  pendingEarnings: 0,
  currentMonthPayout: 0,
};

export const getPartnerOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerOverview> => {
    const { supabase, userId } = context;

    const { data: partner } = await supabase
      .from("district_business_partners")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!partner) return ZERO;

    const { data: metrics } = await supabase
      .from("partner_dashboard_metrics")
      .select("active_shops,total_shops,lifetime_earnings,pending_earnings,current_month_payout")
      .eq("partner_id", partner.id)
      .maybeSingle();

    return {
      hasPartner: true,
      activeShops: metrics?.active_shops ?? 0,
      totalShops: metrics?.total_shops ?? 0,
      lifetimeEarnings: Number(metrics?.lifetime_earnings ?? 0),
      pendingEarnings: Number(metrics?.pending_earnings ?? 0),
      currentMonthPayout: Number(metrics?.current_month_payout ?? 0),
    };
  });
