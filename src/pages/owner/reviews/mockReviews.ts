export interface OwnerReview {
  id: string;
  customerName: string;
  avatar: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string; // ISO
  service: string;
  text: string;
  reply?: string;
  replyDate?: string;
  flagged?: boolean;
}

export const FLAG_REASONS = [
  "Spam or fake",
  "Offensive language",
  "Not a real customer",
  "Conflict of interest",
  "Off-topic",
] as const;

export const initialReviews: OwnerReview[] = [
  {
    id: "r1",
    customerName: "Aarav Mehta",
    avatar: "https://i.pravatar.cc/100?img=12",
    rating: 5,
    date: "2026-06-12",
    service: "Hair Color & Styling",
    text: "Absolutely loved my new look! Priya was incredibly skilled and the salon ambiance was perfect.",
    reply: "Thank you so much, Aarav! We can't wait to welcome you back. — Team Nexora",
    replyDate: "2026-06-13",
  },
  {
    id: "r2",
    customerName: "Diya Sharma",
    avatar: "https://i.pravatar.cc/100?img=32",
    rating: 4,
    date: "2026-06-08",
    service: "Manicure",
    text: "Great manicure but had to wait 15 minutes past my appointment time.",
  },
  {
    id: "r3",
    customerName: "Rohan Verma",
    avatar: "https://i.pravatar.cc/100?img=14",
    rating: 5,
    date: "2026-06-02",
    service: "Beard Trim",
    text: "Best beard trim in town. Highly recommend!",
  },
  {
    id: "r4",
    customerName: "Sneha Iyer",
    avatar: "https://i.pravatar.cc/100?img=45",
    rating: 2,
    date: "2026-05-28",
    service: "Facial",
    text: "The facial was rushed and my skin felt irritated afterwards.",
  },
  {
    id: "r5",
    customerName: "Karan Singh",
    avatar: "https://i.pravatar.cc/100?img=22",
    rating: 5,
    date: "2026-05-20",
    service: "Spa & Massage",
    text: "Pure bliss. The therapist knew exactly what I needed.",
    reply: "So happy to hear that, Karan!",
    replyDate: "2026-05-21",
  },
  {
    id: "r6",
    customerName: "Meera Nair",
    avatar: "https://i.pravatar.cc/100?img=49",
    rating: 3,
    date: "2026-05-15",
    service: "Haircut",
    text: "Decent haircut, nothing exceptional.",
  },
];
