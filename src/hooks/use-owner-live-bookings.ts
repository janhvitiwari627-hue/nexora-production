import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ownerBookingsQuery } from "@/lib/owner.queries";
import { suggestOwnerBookingTime, updateOwnerBookingStatus } from "@/lib/owner.functions";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { useRealtimeOwnerBookings } from "@/hooks/use-realtime-owner-bookings";
import type { OwnerBooking, OwnerBookingStatus } from "@/pages/owner/bookings/mockOwnerBookings";

function mapStatus(s: string): OwnerBookingStatus {
  if (
    s === "pending" ||
    s === "confirmed" ||
    s === "completed" ||
    s === "cancelled" ||
    s === "no_show"
  ) {
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
  const suggestFn = useServerFn(suggestOwnerBookingTime);

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

  const suggestMutation = useMutation({
    mutationFn: (vars: {
      booking_id: string;
      proposed_date: string;
      proposed_time: string;
      note?: string;
    }) => suggestFn({ data: vars }),
    onSuccess: () => {
      if (activeSalonId) qc.invalidateQueries({ queryKey: ["owner", "bookings", activeSalonId] });
      toast.success("New time sent to customer");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const bookings = useMemo<OwnerBooking[]>(() => {
    if (!hasSalon || !liveQ.data) return [];
    return liveQ.data.map((b) => {
      const customer = Array.isArray(b.customer) ? b.customer[0] : b.customer;
      const name = customer?.full_name?.trim() || "Customer";
      return {
        id: b.id,
        customer: name,
        mobile: customer?.mobile ?? "",
        avatar: name.slice(0, 1).toUpperCase(),
        service: b.service_name,
        staff: "—",
        date: b.booking_date,
        time: b.booking_time,
        durationMin: 30,
        advance: Number(b.advance_amount ?? 0),
        total: Number(b.price),
        status: mapStatus(b.status),
        serviceMode: b.service_mode ?? "in_salon",
        address: b.service_address ?? undefined,
        proposedDate: b.proposed_date ?? undefined,
        proposedTime: b.proposed_time ?? undefined,
        proposalStatus: b.proposal_status ?? undefined,
      };
    });
  }, [hasSalon, liveQ.data]);

  const setStatus = (id: string, next: OwnerBookingStatus) => {
    if (!hasSalon) return;
    mutation.mutate({ booking_id: id, status: next });
  };

  const suggestTime = (
    booking_id: string,
    proposed_date: string,
    proposed_time: string,
    note?: string,
  ) => {
    if (!hasSalon) return;
    suggestMutation.mutate({ booking_id, proposed_date, proposed_time, note });
  };

  return {
    bookings,
    setStatus,
    suggestTime,
    isLive: hasSalon,
    loading: liveQ.isLoading,
    isUpdating: mutation.isPending || suggestMutation.isPending,
  };
}
