export type DaySlot = "morning" | "afternoon" | "evening";
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const SLOTS: DaySlot[] = ["morning", "afternoon", "evening"];
export type Day = (typeof DAYS)[number];

export type Availability = Record<Day, Record<DaySlot, boolean>>;

export function emptyAvailability(): Availability {
  return DAYS.reduce((acc, d) => {
    acc[d] = { morning: true, afternoon: true, evening: false };
    return acc;
  }, {} as Availability);
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  experienceYears: number;
  photo: string;
  specializations: string[];
  languages: string[];
  assignedServiceIds: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  portfolio: string[];
  certificates: string[];
  instagram?: string;
  whatsapp?: string;
  availability: Availability;
}

export const DESIGNATIONS = [
  "Senior Stylist",
  "Stylist",
  "Junior Stylist",
  "Therapist",
  "Makeup Artist",
  "Nail Artist",
];
export const SPECIALIZATIONS = [
  "Hair Color",
  "Balayage",
  "Keratin",
  "Bridal Makeup",
  "HD Makeup",
  "Facials",
  "Acne Care",
  "Manicure",
  "Pedicure",
  "Threading",
  "Beard Styling",
  "Massage Therapy",
];
export const LANGUAGES = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Punjabi",
  "Kannada",
];

export const ALL_SERVICES = [
  { id: "s1", name: "Haircut & Style" },
  { id: "s2", name: "Hair Color (Global)" },
  { id: "s3", name: "Keratin Treatment" },
  { id: "s4", name: "Beard Styling" },
  { id: "s5", name: "Hydrating Facial" },
  { id: "s6", name: "Anti-Aging Facial" },
  { id: "s7", name: "Classic Manicure" },
  { id: "s8", name: "Gel Pedicure" },
  { id: "s9", name: "Bridal Makeup" },
  { id: "s10", name: "Party Makeup" },
  { id: "s11", name: "Swedish Massage" },
];

const PORT = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => `https://picsum.photos/seed/staff${Math.floor(Math.random() * 9999)}-${i}/400/400`,
  );

export const initialStaff: StaffMember[] = [
  {
    id: "st1",
    name: "Anjali Rao",
    designation: "Senior Stylist",
    experienceYears: 8,
    photo: "https://i.pravatar.cc/200?img=47",
    specializations: ["Hair Color", "Balayage", "Keratin"],
    languages: ["English", "Hindi", "Marathi"],
    assignedServiceIds: ["s1", "s2", "s3"],
    rating: 4.9,
    reviewCount: 248,
    available: true,
    bookingsThisMonth: 64,
    revenueThisMonth: 182400,
    portfolio: PORT(6),
    certificates: ["L'Oréal Color Specialist", "Schwarzkopf Advanced Cutting"],
    instagram: "https://instagram.com/anjali.styles",
    whatsapp: "919876543210",
    availability: emptyAvailability(),
  },
  {
    id: "st2",
    name: "Rohit Sen",
    designation: "Stylist",
    experienceYears: 5,
    photo: "https://i.pravatar.cc/200?img=12",
    specializations: ["Beard Styling", "Haircut"],
    languages: ["English", "Hindi", "Bengali"],
    assignedServiceIds: ["s1", "s4"],
    rating: 4.7,
    reviewCount: 156,
    available: true,
    bookingsThisMonth: 52,
    revenueThisMonth: 96800,
    portfolio: PORT(4),
    certificates: ["Barber Pro Diploma"],
    instagram: "https://instagram.com/rohit.barber",
    whatsapp: "919811234567",
    availability: emptyAvailability(),
  },
  {
    id: "st3",
    name: "Meera Iyer",
    designation: "Therapist",
    experienceYears: 6,
    photo: "https://i.pravatar.cc/200?img=45",
    specializations: ["Facials", "Acne Care", "Massage Therapy"],
    languages: ["English", "Tamil", "Hindi"],
    assignedServiceIds: ["s5", "s6", "s11"],
    rating: 4.8,
    reviewCount: 198,
    available: false,
    bookingsThisMonth: 41,
    revenueThisMonth: 88200,
    portfolio: PORT(5),
    certificates: ["CIDESCO Diploma", "Aromatherapy Cert."],
    whatsapp: "919900112233",
    availability: emptyAvailability(),
  },
  {
    id: "st4",
    name: "Karan Bhatt",
    designation: "Makeup Artist",
    experienceYears: 7,
    photo: "https://i.pravatar.cc/200?img=33",
    specializations: ["Bridal Makeup", "HD Makeup"],
    languages: ["English", "Hindi", "Punjabi"],
    assignedServiceIds: ["s9", "s10"],
    rating: 4.9,
    reviewCount: 312,
    available: true,
    bookingsThisMonth: 38,
    revenueThisMonth: 248000,
    portfolio: PORT(8),
    certificates: ["MAC Pro Certified", "Bridal Specialist Course"],
    instagram: "https://instagram.com/karan.makeup",
    whatsapp: "919821098765",
    availability: emptyAvailability(),
  },
];
