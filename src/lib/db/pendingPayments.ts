import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PendingPayment = Database["public"]["Tables"]["pending_payments"]["Row"];
export type NewPendingPayment = Database["public"]["Tables"]["pending_payments"]["Insert"];

export async function submitPendingPayment(input: NewPendingPayment): Promise<PendingPayment> {
  const { data, error } = await supabase
    .from("pending_payments")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listMyPendingPayments(userId: string): Promise<PendingPayment[]> {
  const { data, error } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Admin
export async function listAllPendingPayments(): Promise<PendingPayment[]> {
  const { data, error } = await supabase
    .from("pending_payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setPaymentStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<void> {
  const { error } = await supabase.from("pending_payments").update({ status }).eq("id", id);
  if (error) throw error;
}
