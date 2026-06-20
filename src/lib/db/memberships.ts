import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type NewMembership = Database["public"]["Tables"]["memberships"]["Insert"];

export async function getMyMembership(userId: string): Promise<Membership | null> {
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMembership(input: NewMembership): Promise<Membership> {
  const { data, error } = await supabase.from("memberships").insert(input).select("*").single();
  if (error) throw error;
  return data;
}
