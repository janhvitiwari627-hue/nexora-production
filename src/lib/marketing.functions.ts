import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SalonInput = z.object({ salonId: z.string().uuid() });

export const fetchAtRiskCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SalonInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("get_at_risk_customers", {
      _salon_id: data.salonId,
      _limit: 100,
    });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Generate a retention offer based on churn risk + lifetime value. */
function buildRetentionOffer(churnRisk: number, ltv: number, services: string[] | null) {
  let discount = 15;
  let validityDays = 7;
  if (churnRisk >= 0.8) {
    discount = 30;
    validityDays = 14;
  } else if (churnRisk >= 0.6) {
    discount = 25;
    validityDays = 10;
  }
  if (ltv > 5000) discount += 5;
  const svc = services?.[0] ?? "your favourite service";
  return {
    discount,
    validityDays,
    message: `We miss you! Enjoy ${discount}% OFF on ${svc} at our salon. Valid for ${validityDays} days.`,
  };
}

const CampaignInput = z.object({
  salonId: z.string().uuid(),
  customerIds: z.array(z.string().uuid()).min(1).max(500),
  campaignName: z.string().min(1).max(120).optional(),
});

/**
 * Mock WhatsApp retention campaign: logs to marketing_campaigns +
 * creates notification rows per customer. No real WhatsApp send.
 */
export const sendRetentionCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CampaignInput.parse(input))
  .handler(async ({ data, context }) => {
    // Ownership check
    const { data: isOwner } = await context.supabase.rpc("is_salon_owner", {
      _user_id: context.userId,
      _salon_id: data.salonId,
    });
    if (!isOwner) throw new Error("Not authorized for this salon");

    // Fetch insights for targeted customers
    const { data: insights, error: insightsErr } = await context.supabase
      .from("customer_insights")
      .select("customer_id, churn_risk_score, lifetime_value, preferred_services")
      .in("customer_id", data.customerIds);
    if (insightsErr) throw new Error(insightsErr.message);

    const messages = (insights ?? []).map((ci) => ({
      customer_id: ci.customer_id,
      ...buildRetentionOffer(
        Number(ci.churn_risk_score ?? 0),
        Number(ci.lifetime_value ?? 0),
        ci.preferred_services as string[] | null,
      ),
    }));

    // Log the campaign
    const { data: campaign, error: campErr } = await context.supabase
      .from("marketing_campaigns")
      .insert({
        salon_id: data.salonId,
        name: data.campaignName ?? "Retention — Mock WhatsApp",
        channel: "whatsapp",
        status: "sent",
        audience_size: messages.length,
        sent_count: messages.length,
        payload: { mock: true, messages },
      })
      .select("id")
      .single();
    if (campErr) throw new Error(campErr.message);

    // Drop in-app notifications so customers see the offer immediately
    if (messages.length) {
      await context.supabase.from("notifications").insert(
        messages.map((m) => ({
          user_id: m.customer_id,
          title: "A special offer for you 💝",
          body: m.message,
          type: "marketing",
          link: "/dashboard/offers",
        })),
      );
    }

    return { campaignId: campaign?.id, sent: messages.length };
  });
