import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Salon = Database["public"]["Views"]["public_salon_cards"]["Row"];
export type NewSalon = Database["public"]["Tables"]["salons"]["Insert"];

export async function listSalons(): Promise<Salon[]> {
  const { data, error } = await supabase
    .from("public_salon_cards")
    .select("*")
    .order("rating", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSalon(id: string): Promise<Salon | null> {
  const { data, error } = await supabase
    .from("public_salon_cards")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
