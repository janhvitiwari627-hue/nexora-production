import { supabase } from "@/integrations/supabase/client";

export type PublicAppointmentReceipt = {
  id: string;
  booking_reference: string;
  tenant_id: string;
  service_id: string;
  service_name: string;
  staff_id: string | null;
  staff_name: string;
  appointment_date: string;
  appointment_time: string;
  total: number;
  advance: number;
  remaining: number;
  status: "pending_payment";
  payment_status: "advance_pending";
};

export async function ensurePublicBookingSession() {
  const { data: current, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (current.session) return current.session;

  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { source: "public_salon_booking" } },
  });
  if (error) {
    if (error.message.toLowerCase().includes("anonymous")) {
      throw new Error("Online booking is temporarily unavailable. Please try again shortly.");
    }
    throw error;
  }
  if (!data.session) throw new Error("Could not start a secure booking session.");
  return data.session;
}

export async function createPublicAppointment(input: {
  tenantId: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  mobile: string;
  staffId?: string | null;
}): Promise<PublicAppointmentReceipt> {
  await ensurePublicBookingSession();
  const { data, error } = await supabase.rpc("create_public_appointment", {
    _tenant_id: input.tenantId,
    _service_id: input.serviceId,
    _appointment_date: input.date,
    _appointment_time: input.time,
    _customer_name: input.customerName,
    _mobile: input.mobile,
    _staff_id: input.staffId ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("This time was just booked. Please select another time.");
    }
    throw new Error(error.message);
  }
  return data as unknown as PublicAppointmentReceipt;
}

export async function getPublicAppointmentReceipt(bookingId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_reference, salon_id, service_id, service_name, staff_id, booking_date, booking_time, price, advance_amount, status, payment_status, salons(name, slug), staff(name)",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    remaining: Math.max(0, Number(data.price) - Number(data.advance_amount ?? 0)),
  };
}
