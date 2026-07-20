import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

export type PartnerKycReview = {
  status?: "pending" | "approved" | "rejected";
  notes?: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
};

export type PartnerNotificationPref = { email?: boolean; whatsapp?: boolean; push?: boolean };

export type PartnerMetadata = {
  kyc_review?: PartnerKycReview;
  kyc_document_url?: string;
  agreement_signed_at?: string;
  agreement_version?: string;
  notif_new_lead?: PartnerNotificationPref;
  notif_payout?: PartnerNotificationPref;
  notif_shop_activation?: PartnerNotificationPref;
  notif_milestone?: PartnerNotificationPref;
  notif_training?: PartnerNotificationPref;
  language?: string;
};

export type PartnerProfile = {
  id: string;
  full_name: string;
  mobile: string | null;
  email: string | null;
  district: string;
  state: string | null;
  pincode: string | null;
  tagline: string | null;
  success_story: string | null;
  photo_url: string | null;
  status: string;
  metadata: PartnerMetadata | null;
  verified_at: string | null;
};

export const getPartnerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerProfile | null> => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("district_business_partners")
      .select(
        "id,full_name,mobile,email,district,state,pincode,tagline,success_story,photo_url,status,metadata,verified_at",
      )
      .eq("user_id", userId)
      .maybeSingle();
    return (data as PartnerProfile) ?? null;
  });

const profileUpdateSchema = z.object({
  mobile: z.string().trim().min(10).max(20).optional().nullable(),
  email: z.string().trim().email().max(255).optional().nullable(),
  state: z.string().trim().min(2).max(80).optional().nullable(),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/)
    .optional()
    .nullable(),
  tagline: z.string().trim().max(140).optional().nullable(),
  success_story: z.string().trim().max(2000).optional().nullable(),
  photo_url: z.string().trim().url().max(500).optional().nullable(),
});

export const updatePartnerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileUpdateSchema.parse(data))
  .handler(async ({ context, data }): Promise<PartnerProfile> => {
    const { supabase, userId } = context;
    const patch: Partial<
      Record<
        "mobile" | "email" | "state" | "pincode" | "tagline" | "success_story" | "photo_url",
        string | null
      >
    > = {};
    for (const [k, v] of Object.entries(data) as Array<
      [keyof typeof patch, string | null | undefined]
    >) {
      if (v === undefined) continue;
      patch[k] = v === "" ? null : v;
    }
    const { data: row, error } = await supabase
      .from("district_business_partners")
      .update(patch)
      .eq("user_id", userId)
      .select(
        "id,full_name,mobile,email,district,state,pincode,tagline,success_story,photo_url,status,metadata,verified_at",
      )
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Partner profile not found");
    return row as PartnerProfile;
  });

const notifPrefSchema = z.object({
  email: z.boolean().optional(),
  whatsapp: z.boolean().optional(),
  push: z.boolean().optional(),
});

const metadataUpdateSchema = z.object({
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  notif_new_lead: notifPrefSchema.optional(),
  notif_payout: notifPrefSchema.optional(),
  notif_shop_activation: notifPrefSchema.optional(),
  notif_milestone: notifPrefSchema.optional(),
  notif_training: notifPrefSchema.optional(),
});

export const updatePartnerMetadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => metadataUpdateSchema.parse(data))
  .handler(async ({ context, data }): Promise<PartnerProfile> => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("district_business_partners")
      .select("metadata")
      .eq("user_id", userId)
      .maybeSingle();
    const current = (existing?.metadata ?? {}) as PartnerMetadata;
    const nextMeta: PartnerMetadata = { ...current, ...data };
    const { data: row, error } = await supabase
      .from("district_business_partners")
      .update({ metadata: nextMeta })
      .eq("user_id", userId)
      .select(
        "id,full_name,mobile,email,district,state,pincode,tagline,success_story,photo_url,status,metadata,verified_at",
      )
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Partner profile not found");
    return row as PartnerProfile;
  });
