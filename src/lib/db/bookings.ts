import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type NewBooking = Database["public"]["Tables"]["bookings"]["Insert"];

export async function listMyBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("booking_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createBooking(input: NewBooking): Promise<Booking> {
  const { data, error } = await supabase.from("bookings").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: Booking["status"]): Promise<void> {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}
