export type Offer = {
  id: string;
  title: string;
  service: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  used: number;
  code: string;
  active: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  type: "Birthday" | "Festival" | "Reactivation" | "Custom";
  status: "active" | "scheduled" | "completed";
  audience: string;
  reach: number;
  sentAt?: string;
  scheduledAt?: string;
};

export type Automation = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  template: string;
};

export type AISuggestion = {
  id: string;
  title: string;
  context: string;
  body: string;
  cta: string;
};

export const INITIAL_OFFERS: Offer[] = [
  {
    id: "o1",
    title: "Flat 20% on Hair Spa",
    service: "Hair Spa",
    discountType: "percent",
    discountValue: 20,
    validFrom: "2026-06-01",
    validTo: "2026-06-30",
    usageLimit: 100,
    used: 34,
    code: "SPA20",
    active: true,
  },
  {
    id: "o2",
    title: "₹500 off Bridal Package",
    service: "Bridal Makeup",
    discountType: "fixed",
    discountValue: 500,
    validFrom: "2026-06-15",
    validTo: "2026-07-15",
    usageLimit: 25,
    used: 8,
    code: "BRIDAL500",
    active: true,
  },
  {
    id: "o3",
    title: "Monsoon Manicure 15%",
    service: "Manicure",
    discountType: "percent",
    discountValue: 15,
    validFrom: "2026-05-01",
    validTo: "2026-05-31",
    usageLimit: 200,
    used: 178,
    code: "RAIN15",
    active: false,
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "June Birthday Wishes",
    type: "Birthday",
    status: "active",
    audience: "Birthday this month",
    reach: 47,
    sentAt: "2 days ago",
  },
  {
    id: "c2",
    name: "Eid Festival Offer",
    type: "Festival",
    status: "scheduled",
    audience: "All regulars",
    reach: 312,
    scheduledAt: "Jun 25, 10:00 AM",
  },
  {
    id: "c3",
    name: "We miss you ❤️",
    type: "Reactivation",
    status: "completed",
    audience: "Lost (60+ days)",
    reach: 89,
    sentAt: "May 28",
  },
];

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: "a1",
    name: "Booking Confirmation",
    description: "Sent immediately after a booking is accepted",
    enabled: true,
    template:
      "Hi {name}, your booking for {service} on {date} at {time} is confirmed. See you soon! 💇",
  },
  {
    id: "a2",
    name: "Appointment Reminder",
    description: "Sent 24 hours before the appointment",
    enabled: true,
    template:
      "Reminder: your {service} appointment is tomorrow at {time}. Reply CANCEL to reschedule.",
  },
  {
    id: "a3",
    name: "Review Request",
    description: "Sent 2 hours after service completion",
    enabled: true,
    template: "Thanks for visiting, {name}! How was your {service}? Rate us here: {review_link}",
  },
  {
    id: "a4",
    name: "Birthday Wish",
    description: "Sent on customer's birthday with a special offer",
    enabled: false,
    template: "Happy birthday {name}! 🎂 Enjoy 20% off any service this month. Code: BDAY20",
  },
  {
    id: "a5",
    name: "Festival Greeting",
    description: "Auto-sent on major festivals",
    enabled: true,
    template: "Wishing you and your family a joyful {festival}! 🎉 Book this week and save 15%.",
  },
  {
    id: "a6",
    name: "Reactivation Nudge",
    description: "Sent to customers with no visit in 60+ days",
    enabled: false,
    template: "We've missed you, {name}! Come back this month for 25% off your favourite service.",
  },
];

export const AI_SUGGESTIONS: AISuggestion[] = [
  {
    id: "s1",
    title: "Monsoon Hair Care Push",
    context: "It's monsoon season in your city",
    body: "Promote anti-frizz and scalp treatments — humidity drives 32% more search demand this week.",
    cta: "Generate Campaign",
  },
  {
    id: "s2",
    title: "Father's Day Grooming",
    context: "Father's Day in 4 days",
    body: "Run a Father's Day combo offer for haircut + beard styling. Pair with a complimentary head massage.",
    cta: "Create Offer",
  },
  {
    id: "s3",
    title: "Lost Customer Win-Back",
    context: "23 regulars haven't visited in 60+ days",
    body: "Send a personalised WhatsApp with a 25% comeback voucher. Average reactivation rate: 18%.",
    cta: "Launch Win-Back",
  },
];
