export type OwnerBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface OwnerBooking {
  id: string;
  customer: string;
  mobile: string;
  avatar: string;
  service: string;
  staff: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:30 AM"
  durationMin: number;
  advance: number;
  total: number;
  status: OwnerBookingStatus;
  notes?: string;
}

export const STATUS_META: Record<
  OwnerBookingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "Pending", bg: "bg-warning/15", text: "text-warning", dot: "bg-warning" },
  confirmed: { label: "Confirmed", bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  completed: { label: "Completed", bg: "bg-success/15", text: "text-success", dot: "bg-success" },
  cancelled: { label: "Cancelled", bg: "bg-danger/15", text: "text-danger", dot: "bg-danger" },
  no_show: { label: "No Show", bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};
