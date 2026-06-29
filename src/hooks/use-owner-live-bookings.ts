import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ownerBookingsQuery } from "@/lib/owner.queries";
import { updateOwnerBookingStatus } from "@/lib/owner.functions";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { useRealtimeOwnerBookings } from "@/hooks/use-realtime-owner-bookings";
import type {
  OwnerBooking,
  OwnerBookingStatus,
} from "@/pages/owner/bookings/mockOwnerBookings";

function mapStatus(s: string): OwnerBookingStatus {
  if (s === "pending" || s === "confirmed" || s === "completed" || s === "cancelled" || s === "no_show") {
    return s;
  }
  return "pending";
}

/**
 * Returns live bookings for the owner's active salon, mapped to the
 * UI's OwnerBooking shape. Returns an empty list when the user has no
 * linked salon yet (no fake fallback).
 */
export function useOwnerLiveBookings() {
  const { activeSalonId, hasSalon } = useOwnerContext();
  const qc = useQueryClient();
  const liveQ = useQuery(ownerBookingsQuery(activeSalonId ?? ""));
  useRealtimeOwnerBookings(activeSalonId);
  const updateFn = useServerFn(updateOwnerBookingStatus);

  const mutation = useMutation({
    mutationFn: (vars: { booking_id: string; status: OwnerBookingStatus }) =>
      updateFn({ data: vars }),
    onSuccess: () => {
      if (activeSalonId) {
        qc.invalidateQueries({ queryKey: ["owner", "bookings", activeSalonId] });
        qc.invalidateQueries({ queryKey: ["owner", "metrics", activeSalonId] });
      }
      toast.success("Booking updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const bookings = useMemo<OwnerBooking[]>(() => {
    if (!hasSalon || !liveQ.data) return [];
    return liveQ.data.map((b) => ({
      id: b.id,
      customer: "Customer",
      mobile: "",
      avatar: "",
      service: b.service_name,
      staff: "—",
      date: b.booking_date,
      time: b.booking_time,
      durationMin: 30,
      advance: Number(b.advance_amount ?? 0),
      total: Number(b.price),
      status: mapStatus(b.status),
    }));
  }, [hasSalon, liveQ.data]);


  const setStatus = (id: string, next: OwnerBookingStatus) => {
    if (!hasSalon) return;
    mutation.mutate({ booking_id: id, status: next });
  };

  return { bookings, setStatus, isLive: hasSalon, loading: liveQ.isLoading };
}
