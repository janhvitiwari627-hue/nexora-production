import { queryOptions } from "@tanstack/react-query";
import {
  getMyOwnedSalons,
  getOwnerDashboardMetrics,
  listOwnerBookings,
  listOwnerServices,
  listOwnerStaff,
  getOwnerAnalyticsTimeseries,
  getOwnerSalonFull,
  getOwnerWallet,
  listOwnerWithdrawals,
} from "./owner.functions";

export const myOwnedSalonsQuery = () =>
  queryOptions({
    queryKey: ["owner", "salons"],
    queryFn: () => getMyOwnedSalons(),
  });

export const ownerDashboardMetricsQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "metrics", salonId],
    queryFn: () => getOwnerDashboardMetrics({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });

export const ownerBookingsQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "bookings", salonId],
    queryFn: () => listOwnerBookings({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });

export const ownerServicesQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "services", salonId],
    queryFn: () => listOwnerServices({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });

export const ownerStaffQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "staff", salonId],
    queryFn: () => listOwnerStaff({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });

export const ownerAnalyticsQuery = (salonId: string, days = 30) =>
  queryOptions({
    queryKey: ["owner", "analytics", salonId, days],
    queryFn: () => getOwnerAnalyticsTimeseries({ data: { salon_id: salonId, days } }),
    enabled: !!salonId,
  });


export const ownerSalonFullQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "salon-full", salonId],
    queryFn: () => getOwnerSalonFull({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });

export const ownerWalletQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "wallet", salonId],
    queryFn: () => getOwnerWallet({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });

export const ownerWithdrawalsQuery = (salonId: string) =>
  queryOptions({
    queryKey: ["owner", "withdrawals", salonId],
    queryFn: () => listOwnerWithdrawals({ data: { salon_id: salonId } }),
    enabled: !!salonId,
  });
