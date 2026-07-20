export type FAQCategory = "Bookings" | "Payments" | "Rewards" | "Membership" | "Account";

export interface FAQ {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
}

export const FAQS: FAQ[] = [
  {
    id: "b1",
    category: "Bookings",
    question: "How do I cancel a booking?",
    answer:
      "Open My Bookings → select the booking → tap Cancel. Free cancellation up to 4 hours before the slot.",
  },
  {
    id: "b2",
    category: "Bookings",
    question: "Can I reschedule my appointment?",
    answer:
      "Yes. Tap Reschedule on the booking detail page, choose a new slot subject to availability.",
  },
  {
    id: "b3",
    category: "Bookings",
    question: "What happens if I miss my slot?",
    answer:
      "No-shows may be charged a small fee per shop policy. Notify the shop ASAP if you're running late.",
  },
  {
    id: "p1",
    category: "Payments",
    question: "Which payment methods are accepted?",
    answer:
      "UPI, all major credit/debit cards, Nexora Wallet credits, and pay-at-shop (where supported).",
  },
  {
    id: "p2",
    category: "Payments",
    question: "When will I receive my refund?",
    answer:
      "Refunds reach the original payment method in 5-7 business days. Wallet refunds are instant.",
  },
  {
    id: "p3",
    category: "Payments",
    question: "Why was my payment declined?",
    answer:
      "Usually due to bank limits or 2FA timeouts. Retry with a different method or contact your bank.",
  },
  {
    id: "r1",
    category: "Rewards",
    question: "How do I earn reward points?",
    answer:
      "You earn points on every completed booking, QR payment at partner shops, and successful referrals.",
  },
  {
    id: "r2",
    category: "Rewards",
    question: "Do reward points expire?",
    answer:
      "Yes, points expire 12 months after they are credited. Check Reward Center for expiry alerts.",
  },
  {
    id: "r3",
    category: "Rewards",
    question: "How do I redeem reward points?",
    answer: "Toggle 'Use rewards' on the payment screen. 100 points = ₹10 off.",
  },
  {
    id: "m1",
    category: "Membership",
    question: "How do I upgrade my membership tier?",
    answer: "Go to Membership Center → choose Gold or Platinum → complete the upgrade payment.",
  },
  {
    id: "m2",
    category: "Membership",
    question: "Can I cancel my membership?",
    answer:
      "Yes, anytime from Membership Center. Benefits continue till the end of the billing cycle.",
  },
  {
    id: "a1",
    category: "Account",
    question: "How do I update my phone number?",
    answer: "Settings → Account → Phone Number. Verify the new number with OTP.",
  },
  {
    id: "a2",
    category: "Account",
    question: "How do I delete my account?",
    answer: "Settings → Account → Delete account. Your data is removed within 30 days.",
  },
];

export const FAQ_CATEGORIES: FAQCategory[] = [
  "Bookings",
  "Payments",
  "Rewards",
  "Membership",
  "Account",
];

export const TICKET_CATEGORIES = [
  "Booking issue",
  "Payment / Refund",
  "Rewards & Points",
  "Membership",
  "Account & Login",
  "Shop complaint",
  "Other",
] as const;

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  from: "you" | "support";
  text: string;
  at: string;
}

export interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  thread: TicketMessage[];
}

export const MY_TICKETS: SupportTicket[] = [
  {
    id: "TKT-10428",
    category: "Payment / Refund",
    subject: "Refund not received for cancelled booking",
    status: "in_progress",
    createdAt: "2026-06-15T10:12:00Z",
    updatedAt: "2026-06-17T14:42:00Z",
    thread: [
      {
        id: "m1",
        from: "you",
        text: "I cancelled my booking on 12 June but haven't received the refund yet.",
        at: "2026-06-15T10:12:00Z",
      },
      {
        id: "m2",
        from: "support",
        text: "Hi! We've escalated this to the payments team. Expect resolution within 48 hours.",
        at: "2026-06-16T09:20:00Z",
      },
      {
        id: "m3",
        from: "support",
        text: "Refund initiated today. Reference RFND-882910. It should reflect in 3-5 business days.",
        at: "2026-06-17T14:42:00Z",
      },
    ],
  },
  {
    id: "TKT-10395",
    category: "Rewards & Points",
    subject: "Points missing for last visit",
    status: "open",
    createdAt: "2026-06-18T08:05:00Z",
    updatedAt: "2026-06-18T08:05:00Z",
    thread: [
      {
        id: "m1",
        from: "you",
        text: "I visited Belleza Salon on 17 June but didn't get reward points.",
        at: "2026-06-18T08:05:00Z",
      },
    ],
  },
  {
    id: "TKT-10221",
    category: "Account & Login",
    subject: "Unable to update phone number",
    status: "resolved",
    createdAt: "2026-05-28T11:30:00Z",
    updatedAt: "2026-05-30T09:00:00Z",
    thread: [
      {
        id: "m1",
        from: "you",
        text: "OTP isn't arriving on my new number.",
        at: "2026-05-28T11:30:00Z",
      },
      {
        id: "m2",
        from: "support",
        text: "Resolved — please try again, our SMS partner outage is fixed.",
        at: "2026-05-30T09:00:00Z",
      },
    ],
  },
];

export const WHATSAPP_NUMBER = "918000012345";
export const WHATSAPP_PREFILL = "Hi Nexora Support, I need help with my account.";
