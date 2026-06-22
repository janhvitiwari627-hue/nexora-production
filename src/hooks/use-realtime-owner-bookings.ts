import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to bookings changes for a salon and invalidates the
 * owner bookings + metrics queries on any insert/update/delete.
 */
export function useRealtimeOwnerBookings(salonId: string | null | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!salonId) return;
    const channel = supabase
      .channel(`owner-bookings:${salonId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `salon_id=eq.${salonId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["owner", "bookings", salonId] });
          qc.invalidateQueries({ queryKey: ["owner", "metrics", salonId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [salonId, qc]);
}
