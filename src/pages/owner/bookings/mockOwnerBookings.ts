export type OwnerBookingStatus =
  | "pending"
  | "confirmed"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

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

const STAFF = ["Anjali Rao", "Rohit Sen", "Meera Iyer", "Karan Bhatt"];
const SERVICES = [
  "Hair Color + Cut",
  "Beard Styling",
  "Facial Glow",
  "Hair Spa",
  "Bridal Makeup Trial",
  "Manicure + Pedicure",
  "Keratin Treatment",
  "Threading",
];
const NAMES = [
  ["Priya Sharma", "9876543210"],
  ["Aman Verma", "9811234567"],
  ["Riya Kapoor", "9900112233"],
  ["Kunal Mehra", "9821098765"],
  ["Neha Singh", "9765432109"],
  ["Sara Khan", "9871122334"],
  ["Vikram Patel", "9988776655"],
  ["Anita Desai", "9012345678"],
  ["Rahul Joshi", "9123456789"],
  ["Ishita Roy", "9234567812"],
];

const STATUSES: OwnerBookingStatus[] = [
  "pending",
  "confirmed",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function makeBookings(): OwnerBooking[] {
  const today = new Date();
  const out: OwnerBooking[] = [];
  let id = 2040;
  for (let i = 0; i < 28; i++) {
    const offset = (i % 7) - 2; // -2..+4 days
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const hour = 9 + ((i * 3) % 9); // 9..17
    const minute = i % 2 === 0 ? 0 : 30;
    const period = hour >= 12 ? "PM" : "AM";
    const h12 = hour > 12 ? hour - 12 : hour;
    const time = `${pad(h12)}:${pad(minute)} ${period}`;
    const [name, mobile] = NAMES[i % NAMES.length];
    const service = SERVICES[i % SERVICES.length];
    const staff = STAFF[i % STAFF.length];
    const total = 800 + ((i * 137) % 4200);
    const advance = Math.round(total * (i % 3 === 0 ? 1 : 0.3));
    const status = STATUSES[i % STATUSES.length];
    out.push({
      id: `B-${id++}`,
      customer: name,
      mobile,
      avatar: name.split(" ").map((s) => s[0]).join(""),
      service,
      staff,
      date: dateStr,
      time,
      durationMin: 30 + ((i % 4) * 30),
      advance,
      total,
      status,
      notes: i % 5 === 0 ? "Customer prefers organic products." : undefined,
    });
  }
  return out;
}

export const ownerBookings: OwnerBooking[] = makeBookings();

export const STATUS_META: Record<
  OwnerBookingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: "Pending", bg: "bg-warning/15", text: "text-warning", dot: "bg-warning" },
  confirmed: { label: "Confirmed", bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  accepted: { label: "Accepted", bg: "bg-success/15", text: "text-success", dot: "bg-success" },
  in_progress: { label: "In Progress", bg: "bg-primary/20", text: "text-primary-dark", dot: "bg-primary-dark" },
  completed: { label: "Completed", bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  cancelled: { label: "Cancelled", bg: "bg-danger/15", text: "text-danger", dot: "bg-danger" },
};
