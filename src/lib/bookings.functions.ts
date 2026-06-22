import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateInput = z.object({
  salon_id: z.string().uuid(),
  service_name: z.string().trim().min(1).max(200),
  price: z.number().nonnegative(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  booking_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

const IdInput = z.object({ id: z.string().uuid() });

const RescheduleInput = z.object({
  id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  booking_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

const SlotsInput = z.object({
  salon_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// POST /api/bookings/create
export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("bookings")
      .insert({ ...data, user_id: userId, status: "confirmed" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// GET /api/customers/bookings
export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bookings")
      .select("*, salons(id, name, image_url, location, category)")
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// PUT /api/bookings/{id}/cancel
export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// POST /api/bookings/{id}/reschedule
export const rescheduleBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RescheduleInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("bookings")
      .update({
        booking_date: data.booking_date,
        booking_time: data.booking_time,
        status: "confirmed",
      })
      .eq("id", data.id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// GET /api/bookings/slots — generates 30-min slots 10:00-20:00 minus already booked
export const getAvailableSlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SlotsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: taken, error } = await supabase
      .from("bookings")
      .select("booking_time")
      .eq("salon_id", data.salon_id)
      .eq("booking_date", data.date)
      .neq("status", "cancelled");
    if (error) throw new Error(error.message);
    const takenSet = new Set((taken ?? []).map((r) => String(r.booking_time).slice(0, 5)));
    const slots: { time: string; available: boolean }[] = [];
    for (let h = 10; h < 20; h++) {
      for (const m of [0, 30]) {
        const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        slots.push({ time: t, available: !takenSet.has(t) });
      }
    }
    return slots;
  });
