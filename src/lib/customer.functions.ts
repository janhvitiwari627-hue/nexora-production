import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SalonIdInput = z.object({ salon_id: z.string().uuid() });

// GET /api/customers/dashboard
export const getCustomerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const [profileRes, upcomingRes, totalBookingsRes, favCountRes, walletRes, referralsRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, mobile, avatar_url, referral_code, nexora_id")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("bookings")
          .select("*, salons(id, name, image_url, location)")
          .eq("user_id", userId)
          .gte("booking_date", today)
          .neq("status", "cancelled")
          .order("booking_date", { ascending: true })
          .limit(5),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("favorites")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("wallet_transactions")
          .select("balance_after")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("referrals").select("id, status, reward_amount").eq("referrer_id", userId),
      ]);

    if (profileRes.error) throw new Error(profileRes.error.message);
    if (upcomingRes.error) throw new Error(upcomingRes.error.message);

    const referrals = referralsRes.data ?? [];
    const referralEarnings = referrals
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + Number(r.reward_amount ?? 0), 0);

    return {
      profile: profileRes.data,
      upcomingBookings: upcomingRes.data ?? [],
      stats: {
        totalBookings: totalBookingsRes.count ?? 0,
        favorites: favCountRes.count ?? 0,
        walletBalance: Number(walletRes.data?.balance_after ?? 0),
        referralEarnings,
        referralsCount: referrals.length,
      },
    };
  });

// GET /api/customers/favorites
export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("favorites")
      .select(
        "id, created_at, salons(id, name, category, rating, reviews_count, image_url, location, price_range, discount)",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// POST /api/customers/favorites — add or remove (toggle)
export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SalonIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing, error: selErr } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("salon_id", data.salon_id)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, salon_id: data.salon_id });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

// GET /api/customers/rewards — wallet transactions + summary
export const getRewards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const txns = data ?? [];
    const balance = Number(txns[0]?.balance_after ?? 0);
    const earned = txns
      .filter((t) => t.type === "credit")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0);
    const spent = txns
      .filter((t) => t.type === "debit")
      .reduce((s, t) => s + Number(t.amount ?? 0), 0);
    return { balance, earned, spent, transactions: txns };
  });

// GET /api/customers/referrals
export const getReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, referralsRes] = await Promise.all([
      supabase.from("profiles").select("referral_code").eq("id", userId).maybeSingle(),
      supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    if (profileRes.error) throw new Error(profileRes.error.message);
    if (referralsRes.error) throw new Error(referralsRes.error.message);

    const referrals = referralsRes.data ?? [];
    const totalEarnings = referrals
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + Number(r.reward_amount ?? 0), 0);
    const pendingEarnings = referrals
      .filter((r) => r.status === "pending")
      .reduce((s, r) => s + Number(r.reward_amount ?? 0), 0);

    return {
      referralCode: profileRes.data?.referral_code ?? null,
      stats: {
        total: referrals.length,
        completed: referrals.filter((r) => r.status === "completed").length,
        pending: referrals.filter((r) => r.status === "pending").length,
        totalEarnings,
        pendingEarnings,
      },
      referrals,
    };
  });
