import { queryOptions } from "@tanstack/react-query";
import { listMyBookings, getAvailableSlots } from "./bookings.functions";
import {
  getCustomerDashboard,
  listFavorites,
  getRewards,
  getReferrals,
} from "./customer.functions";

export const myBookingsQueryOptions = () =>
  queryOptions({ queryKey: ["customer", "bookings"], queryFn: () => listMyBookings() });

export const availableSlotsQueryOptions = (input: { salon_id: string; date: string }) =>
  queryOptions({
    queryKey: ["bookings", "slots", input],
    queryFn: () => getAvailableSlots({ data: input }),
  });

export const customerDashboardQueryOptions = () =>
  queryOptions({ queryKey: ["customer", "dashboard"], queryFn: () => getCustomerDashboard() });

export const favoritesQueryOptions = () =>
  queryOptions({ queryKey: ["customer", "favorites"], queryFn: () => listFavorites() });

export const rewardsQueryOptions = () =>
  queryOptions({ queryKey: ["customer", "rewards"], queryFn: () => getRewards() });

export const referralsQueryOptions = () =>
  queryOptions({ queryKey: ["customer", "referrals"], queryFn: () => getReferrals() });
