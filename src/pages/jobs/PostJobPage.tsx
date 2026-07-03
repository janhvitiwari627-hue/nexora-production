import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Briefcase, Check, CheckCircle2, IndianRupee, MapPin, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  getJobForEmployer,
  getMyEmployerProfile,
  getMyShopId,
  saveJob,
  type EmployerProfile,
  type JobDraftInput,
  type JobRow,
} from "@/lib/jobs";
import { EmployerSetupModal } from "@/pages/jobs/EmployerSetupModal";
import { BackButton } from "@/components/shared/BackButton";
import { cn } from "@/lib/utils";

const WORK_LOCATIONS = [
  "At salon / studio",
  "At client location",
  "Hybrid",
  "Remote consultation",
];
const LEGACY_WORK_LOCATION_MAP: Record<string, string> = {
  Onsite: "At salon / studio",
  Remote: "Remote consultation",
  Hybrid: "Hybrid",
};
const INTERVIEW_MODES = ["In-person", "Phone call", "Video call", "WhatsApp"];

const BUSINESS_TYPES = [
  "Salon",
  "Beauty Parlour",
  "Barber Shop",
  "Spa",
  "Nail Studio",
  "Makeup Studio",
  "Tattoo Studio",
  "Wellness Center",
  "Home Service Business",
  "Other",
];

const CITY_QUICK_OPTIONS = [
  "Jaipur",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Ahmedabad",
  "Kolkata",
  "Chennai",
  "Other city",
];

const DAY_PRESETS = ["Mon–Sat", "Tue–Sun", "All days", "Weekends only", "Custom days"] as const;
type DayPreset = (typeof DAY_PRESETS)[number];
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const DAYS_FOR_PRESET: Record<Exclude<DayPreset, "Custom days">, string[]> = {
  "Mon–Sat": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "Tue–Sun": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "All days": [...WEEK_DAYS],
  "Weekends only": ["Saturday", "Sunday"],
};

const HOUR_PRESETS: { label: string; start?: string; end?: string; flexible?: boolean }[] = [
  { label: "9 AM – 6 PM", start: "9 AM", end: "6 PM" },
  { label: "10 AM – 7 PM", start: "10 AM", end: "7 PM" },
  { label: "11 AM – 8 PM", start: "11 AM", end: "8 PM" },
  { label: "12 PM – 9 PM", start: "12 PM", end: "9 PM" },
  { label: "Flexible hours", flexible: true },
  { label: "Custom time" },
];

const CATEGORIES = [
  "Hair Stylist",
  "Barber",
  "Makeup Artist",
  "Nail Artist",
  "Beauty Therapist",
  "Spa Therapist",
  "Massage Therapist",
  "Skin Therapist",
  "Eyelash / Brow Artist",
  "Tattoo Artist",
  "Salon Manager",
  "Receptionist",
  "Salon Assistant",
  "Hair Colourist",
  "Bridal Makeup Artist",
  "Freelancer",
  "Other",
];
const JOB_TYPES = ["Full-time", "Part-time", "Freelance", "Contract", "Internship", "Temporary"];
const EXPERIENCE = [
  "Fresher welcome",
  "0–1 years",
  "1–2 years",
  "2–4 years",
  "4–6 years",
  "6+ years",
  "Experience flexible",
];
const FLEXIBLE_EXPERIENCE_VALUE = "flexible";
const experienceValueFor = (label: string) =>
  label === "Experience flexible" ? FLEXIBLE_EXPERIENCE_VALUE : label;

const PERIODS: { label: string; value: JobDraftInput["salary_period"] }[] = [
  { label: "per month", value: "monthly" },
  { label: "per year", value: "yearly" },
  { label: "per hour", value: "hourly" },
];

const JOINING_OPTIONS = [
  "Immediately",
  "Within 7 days",
  "Within 15 days",
  "Within 30 days",
  "Flexible",
];

const SALARY_TYPES = [
  "Monthly salary",
  "Daily pay",
  "Hourly pay",
  "Per service / commission",
  "Fixed + commission",
  "Negotiable",
];

const MONTHLY_SALARY_RANGES: { label: string; min: number; max: number | null }[] = [
  { label: "₹8,000 – ₹12,000", min: 8000, max: 12000 },
  { label: "₹12,000 – ₹18,000", min: 12000, max: 18000 },
  { label: "₹18,000 – ₹25,000", min: 18000, max: 25000 },
  { label: "₹25,000 – ₹35,000", min: 25000, max: 35000 },
  { label: "₹35,000+", min: 35000, max: null },
];

const DAILY_PAY_RANGES: { label: string; min: number; max: number | null }[] = [
  { label: "₹500 – ₹800", min: 500, max: 800 },
  { label: "₹800 – ₹1,200", min: 800, max: 1200 },
  { label: "₹1,200 – ₹2,000", min: 1200, max: 2000 },
];

const HOURLY_PAY_RANGES: { label: string; min: number; max: number | null }[] = [
  { label: "₹100 – ₹200 / hour", min: 100, max: 200 },
  { label: "₹200 – ₹400 / hour", min: 200, max: 400 },
  { label: "₹400 – ₹700 / hour", min: 400, max: 700 },
];

const FIXED_COMMISSION_RANGES: { label: string; min: number; max: number | null }[] = [
  { label: "₹10,000 + commission", min: 10000, max: null },
  { label: "₹15,000 + commission", min: 15000, max: null },
  { label: "₹20,000 + commission", min: 20000, max: null },
];

const BENEFITS = [
  "Paid leave",
  "Flexible hours",
  "Weekly off",
  "Training provided",
  "Staff discount",
  "Travel allowance",
  "Food allowance",
  "Accommodation",
  "Health insurance",
  "Incentives",
  "Career growth",
  "Equipment provided",
  "Uniform provided",
  "Festival bonus",
  "Other",
];

const BENEFIT_BUNDLES: { label: string; items: string[] }[] = [
  { label: "Basic benefits", items: ["Weekly off", "Training provided", "Incentives"] },
  {
    label: "Premium benefits",
    items: ["Paid leave", "Health insurance", "Incentives", "Career growth", "Festival bonus"],
  },
  {
    label: "Salon essentials",
    items: ["Uniform provided", "Staff discount", "Training provided"],
  },
];

// Quick-select role suggestions grouped by beauty category.
// Selecting a chip fills the "Specific job role" field (single-choice) and, if
// Job Title is empty, mirrors into Job Title. Manual typing stays available.
const ROLE_SUGGESTIONS: Record<string, string[]> = {
  "Hair Stylist": [
    "Junior Hair Stylist",
    "Senior Hair Stylist",
    "Unisex Hair Stylist",
    "Bridal Hair Stylist",
    "Hair Colour Specialist",
    "Hair Treatment Specialist",
    "Keratin Specialist",
    "Hair Spa Expert",
    "Blow Dry Specialist",
    "Salon Hair Expert",
  ],
  Barber: [
    "Junior Barber",
    "Senior Barber",
    "Men's Hair Stylist",
    "Beard Specialist",
    "Fade Cut Specialist",
    "Traditional Barber",
    "Unisex Barber",
    "Hair and Beard Artist",
  ],
  "Makeup Artist": [
    "Bridal Makeup Artist",
    "Party Makeup Artist",
    "HD Makeup Artist",
    "Airbrush Makeup Artist",
    "Freelance Makeup Artist",
    "Salon Makeup Artist",
    "Celebrity Makeup Artist",
    "Makeup Assistant",
  ],
  "Nail Artist": [
    "Junior Nail Artist",
    "Senior Nail Artist",
    "Nail Extension Artist",
    "Gel Nail Artist",
    "Acrylic Nail Artist",
    "Nail Art Specialist",
    "Manicure Pedicure Expert",
    "Nail Technician",
  ],
  "Beauty Therapist": [
    "Junior Beauty Therapist",
    "Senior Beauty Therapist",
    "Facial Therapist",
    "Waxing Expert",
    "Threading Expert",
    "Skin Care Therapist",
    "Beauty Consultant",
    "Beauty Service Expert",
  ],
  "Spa Therapist": [
    "Spa Therapist",
    "Senior Spa Therapist",
    "Luxury Spa Therapist",
    "Ayurvedic Spa Therapist",
    "Body Therapy Expert",
    "Spa Assistant",
    "Wellness Therapist",
  ],
  "Massage Therapist": [
    "Swedish Massage Therapist",
    "Deep Tissue Therapist",
    "Thai Massage Therapist",
    "Ayurvedic Massage Therapist",
    "Body Massage Therapist",
    "Wellness Massage Therapist",
  ],
  "Skin Therapist": [
    "Skin Care Specialist",
    "Facial Therapist",
    "Acne Treatment Expert",
    "Hydra Facial Specialist",
    "Laser Treatment Assistant",
    "Skin Consultant",
    "Dermatology Clinic Assistant",
  ],
  "Eyelash / Brow Artist": [
    "Eyelash Extension Artist",
    "Lash Lift Artist",
    "Brow Shaping Expert",
    "Brow Tint Specialist",
    "Microblading Artist",
    "Eyebrow Threading Expert",
  ],
  "Tattoo Artist": [
    "Tattoo Artist",
    "Senior Tattoo Artist",
    "Fine Line Tattoo Artist",
    "Realism Tattoo Artist",
    "Tattoo Assistant",
    "Piercing Artist",
    "Tattoo Studio Manager",
  ],
  "Salon Manager": [
    "Salon Manager",
    "Assistant Salon Manager",
    "Operations Manager",
    "Front Desk Manager",
    "Salon Supervisor",
    "Branch Manager",
  ],
  Receptionist: [
    "Salon Receptionist",
    "Front Desk Executive",
    "Client Relationship Executive",
    "Appointment Coordinator",
    "Cashier and Receptionist",
    "Salon Coordinator",
  ],
  "Salon Assistant": [
    "Hair Assistant",
    "Beauty Assistant",
    "Salon Helper",
    "Shampoo Assistant",
    "Makeup Assistant",
    "Nail Assistant",
    "Trainee Beauty Assistant",
  ],
  "Hair Colourist": [
    "Hair Colourist",
    "Senior Hair Colourist",
    "Balayage Specialist",
    "Highlights Specialist",
    "Global Colour Expert",
    "Colour Correction Expert",
  ],
  "Bridal Makeup Artist": [
    "Bridal Makeup Artist",
    "Bridal Hair Stylist",
    "Bridal Makeup Assistant",
    "Destination Bridal Artist",
    "HD Bridal Makeup Artist",
    "Airbrush Bridal Artist",
  ],
  Freelancer: [
    "Freelance Makeup Artist",
    "Freelance Hair Stylist",
    "Freelance Nail Artist",
    "Freelance Beauty Therapist",
    "Freelance Bridal Artist",
    "Freelance Tattoo Artist",
  ],
  Other: ["Other Beauty Professional", "Custom Role"],
};

// Suggested skill chips by beauty category. Employer can click to add / remove
// or type a custom skill and press Enter. Changing the category only refreshes
// suggestions — it never removes already-selected skills.
const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Hair Stylist": [
    "Haircut",
    "Hair colour",
    "Balayage",
    "Highlights",
    "Keratin",
    "Smoothening",
    "Hair spa",
    "Blow dry",
    "Styling",
    "Bridal hair",
    "Client consultation",
  ],
  Barber: [
    "Haircut",
    "Beard styling",
    "Fade cut",
    "Shaving",
    "Hair styling",
    "Client consultation",
  ],
  "Makeup Artist": [
    "Bridal makeup",
    "Party makeup",
    "HD makeup",
    "Airbrush makeup",
    "Saree draping",
    "Hairstyling",
    "Client consultation",
    "Product knowledge",
  ],
  "Nail Artist": [
    "Gel extensions",
    "Acrylic extensions",
    "Nail art",
    "Nail shaping",
    "Chrome nails",
    "French tips",
    "Cat eye nails",
    "Manicure",
    "Pedicure",
    "Nail hygiene",
  ],
  "Beauty Therapist": [
    "Facial",
    "Cleanup",
    "Waxing",
    "Threading",
    "Manicure",
    "Pedicure",
    "Skin consultation",
    "Client handling",
  ],
  "Spa Therapist": [
    "Swedish massage",
    "Deep tissue massage",
    "Body therapy",
    "Spa rituals",
    "Aromatherapy",
    "Client consultation",
  ],
  "Massage Therapist": [
    "Swedish massage",
    "Deep tissue",
    "Thai massage",
    "Ayurvedic massage",
    "Foot reflexology",
    "Sports massage",
  ],
  "Skin Therapist": [
    "Advanced facials",
    "Chemical peel",
    "Hydra facial",
    "Microdermabrasion",
    "Laser assist",
    "Skin consultation",
  ],
  "Eyelash / Brow Artist": [
    "Lash extensions",
    "Lash lift",
    "Brow lamination",
    "Brow tint",
    "Microblading",
    "Threading",
  ],
  "Tattoo Artist": [
    "Line work",
    "Shading",
    "Colour realism",
    "Fine line",
    "Cover-up",
    "Piercing",
    "Sterilisation",
  ],
  "Salon Manager": [
    "Staff scheduling",
    "Inventory",
    "Client retention",
    "Billing systems",
    "Team leadership",
    "Reports",
  ],
  Receptionist: [
    "Appointment booking",
    "Client greeting",
    "Billing",
    "Phone handling",
    "MS Office",
    "Salon software",
  ],
  "Salon Assistant": [
    "Shampooing",
    "Tool prep",
    "Hygiene",
    "Client comfort",
    "Product handling",
  ],
  "Hair Colourist": [
    "Global colour",
    "Highlights",
    "Balayage",
    "Ombre",
    "Colour correction",
    "Toning",
  ],
  "Bridal Makeup Artist": [
    "HD bridal",
    "Airbrush bridal",
    "Traditional bridal",
    "Draping",
    "Hair styling",
    "Trials",
  ],
  Freelancer: [
    "Client handling",
    "Portfolio",
    "Travel-ready",
    "Own kit",
    "Time management",
  ],
  Other: ["Customer service", "Hygiene", "Teamwork", "Punctuality"],
};

const CERTIFICATIONS = [
  "No formal qualification required",
  "Beauty course certificate",
  "Diploma in cosmetology",
  "Professional certification",
  "Experience preferred",
  "Other",
];

const LANGUAGES = [
  "Hindi",
  "English",
  "Hinglish",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Kannada",
  "Malayalam",
  "Other",
];

const PORTFOLIO_OPTIONS = [
  "Portfolio required",
  "Instagram profile required",
  "Resume preferred",
  "No portfolio needed",
] as const;
type PortfolioOption = (typeof PORTFOLIO_OPTIONS)[number];

// Structured markers appended to the `requirements` text so the job detail
// page and the candidate application form can parse these UI-only fields
// without a schema change. Format: "Key: value" on its own line.
const REQ_META_KEYS = {
  certification: "Certification",
  languages: "Languages",
  portfolio: "Portfolio",
  screening: "Screening",
} as const;

export type ScreeningQuestionType = "short" | "long" | "yesno" | "number";
export type ScreeningQuestion = { q: string; t: ScreeningQuestionType };

export const SUGGESTED_SCREENING_QUESTIONS: ScreeningQuestion[] = [
  { q: "How many years of experience do you have?", t: "number" },
  { q: "Are you available to join immediately?", t: "yesno" },
  { q: "Which services are you most confident in?", t: "long" },
  { q: "Please share your Instagram portfolio.", t: "short" },
  { q: "What salary are you expecting?", t: "number" },
  { q: "Do you have salon experience?", t: "yesno" },
  { q: "Are you comfortable with weekend working?", t: "yesno" },
  { q: "Can you work full-time?", t: "yesno" },
  { q: "Do you have your own beauty kit?", t: "yesno" },
  { q: "Have you worked with bridal clients before?", t: "yesno" },
];

function stripRequirementsMeta(raw: string | null | undefined): string {
  if (!raw) return "";
  const keys = Object.values(REQ_META_KEYS).join("|");
  const re = new RegExp(`^\\s*(?:${keys}):\\s*.+$`, "gmi");
  return raw.replace(re, "").replace(/\n{3,}/g, "\n\n").trim();
}

function parseRequirementsMeta(raw: string | null | undefined): {
  certification: string;
  languages: string[];
  portfolio: PortfolioOption | "";
  screening: ScreeningQuestion[];
} {
  const out = {
    certification: "",
    languages: [] as string[],
    portfolio: "" as PortfolioOption | "",
    screening: [] as ScreeningQuestion[],
  };
  if (!raw) return out;
  const certM = raw.match(/^\s*Certification:\s*(.+)$/mi);
  if (certM) out.certification = certM[1].trim();
  const langM = raw.match(/^\s*Languages:\s*(.+)$/mi);
  if (langM) out.languages = langM[1].split(",").map((s) => s.trim()).filter(Boolean);
  const portM = raw.match(/^\s*Portfolio:\s*(.+)$/mi);
  if (portM) {
    const val = portM[1].trim();
    if ((PORTFOLIO_OPTIONS as readonly string[]).includes(val)) out.portfolio = val as PortfolioOption;
  }
  const screenM = raw.match(/^\s*Screening:\s*(.+)$/mi);
  if (screenM) {
    try {
      const parsed = JSON.parse(screenM[1].trim());
      if (Array.isArray(parsed)) {
        out.screening = parsed
          .filter((x) => x && typeof x.q === "string" && typeof x.t === "string")
          .map((x) => ({ q: String(x.q), t: (["short", "long", "yesno", "number"].includes(x.t) ? x.t : "short") as ScreeningQuestionType }));
      }
    } catch {}
  }
  return out;
}

export { parseRequirementsMeta, stripRequirementsMeta, PORTFOLIO_OPTIONS };
export type { PortfolioOption };



// Ready-made job description starters shown under the Description field.
// Templates change with Beauty Category; a generic set is used when no
// category is selected.
const GENERAL_DESCRIPTION_TEMPLATES: { label: string; body: string }[] = [
  {
    label: "Standard role",
    body:
      "We are hiring a passionate beauty professional to join our team. You will deliver high-quality services, build long-term client relationships, and help our salon grow. Prior experience preferred; freshers with the right attitude are welcome.",
  },
  {
    label: "Freshers welcome",
    body:
      "We're looking for enthusiastic beginners eager to build a career in the beauty industry. On-the-job training, mentorship, and a friendly team environment provided. Bring a positive attitude and a willingness to learn.",
  },
  {
    label: "Experienced professional",
    body:
      "Seeking an experienced beauty professional with a strong client base and proven skills. You'll handle premium clients, mentor junior staff, and contribute to service quality and salon reputation. Attractive incentives and growth path.",
  },
];

const DESCRIPTION_TEMPLATES: Record<string, { label: string; body: string }[]> = {
  "Hair Stylist": [
    {
      label: "Senior stylist",
      body:
        "We are hiring a Senior Hair Stylist to deliver premium cuts, colours, styling, and hair treatments. You will manage regular clients, guide juniors, and maintain high service standards. 3+ years of salon experience preferred.",
    },
    {
      label: "Junior stylist",
      body:
        "Looking for a Junior Hair Stylist to assist senior stylists, perform basic cuts, blow-dries, and shampoo services, and learn advanced techniques on the job. Freshers from reputed academies are welcome.",
    },
    {
      label: "Bridal specialist",
      body:
        "Hiring a Bridal Hair Specialist for pre-wedding trials and wedding-day styling. You should be skilled in traditional and contemporary bridal looks, hair extensions, and long-lasting hold techniques.",
    },
  ],
  Barber: [
    {
      label: "Senior barber",
      body:
        "We're hiring a Senior Barber skilled in classic and modern men's cuts, fades, beard shaping, and hot-towel shaves. You'll handle premium clients and maintain grooming standards across the salon.",
    },
    {
      label: "Beard specialist",
      body:
        "Looking for a Beard Grooming Specialist experienced in beard trims, shaping, hot-towel shaves, and beard colour. Attention to detail and hygiene are essential.",
    },
  ],
  "Makeup Artist": [
    {
      label: "Bridal MUA",
      body:
        "Hiring a Bridal Makeup Artist experienced in HD, airbrush, and traditional bridal looks. You'll handle trials, wedding-day services, and destination assignments. Portfolio required.",
    },
    {
      label: "Party & studio MUA",
      body:
        "We're hiring a Makeup Artist for party, engagement, and studio shoots. Skills in HD makeup, contouring, and eye looks are essential. Prior salon or freelance experience preferred.",
    },
  ],
  "Nail Artist": [
    {
      label: "Nail technician",
      body:
        "Hiring a Nail Technician skilled in manicures, pedicures, gel, acrylic extensions, and nail art. You should follow strict hygiene protocols and stay updated with current nail trends.",
    },
    {
      label: "Nail art specialist",
      body:
        "Looking for a Nail Art Specialist with expertise in freehand art, stamping, chrome, and 3D designs. Ideal for premium clients and social-media-friendly work.",
    },
  ],
  "Beauty Therapist": [
    {
      label: "Facial & waxing",
      body:
        "Hiring a Beauty Therapist for facials, clean-ups, waxing, threading, and body polishing. Certification from a recognised institute preferred; strong client-handling skills essential.",
    },
    {
      label: "Advanced therapist",
      body:
        "Looking for a Senior Beauty Therapist with expertise in advanced facials, skin analysis, and product recommendation. You'll handle premium clients and mentor junior therapists.",
    },
  ],
  "Spa Therapist": [
    {
      label: "Wellness therapist",
      body:
        "Hiring a Spa Therapist skilled in relaxation massages, body scrubs, wraps, and aromatherapy. Certification and a calm, professional demeanour are essential.",
    },
    {
      label: "Ayurvedic therapist",
      body:
        "Looking for an Ayurvedic Spa Therapist trained in Abhyanga, Shirodhara, and traditional oil therapies. Prior wellness centre experience preferred.",
    },
  ],
  "Massage Therapist": [
    {
      label: "Body massage",
      body:
        "Hiring a Body Massage Therapist experienced in Swedish, deep-tissue, and relaxation techniques. Formal training and a customer-first attitude are required.",
    },
  ],
  "Skin Therapist": [
    {
      label: "Skin care specialist",
      body:
        "Hiring a Skin Therapist for advanced facials, chemical peels, and clinical skin routines. Familiarity with skin analysis tools and consultation-based selling is a plus.",
    },
  ],
  "Eyelash / Brow Artist": [
    {
      label: "Lash & brow",
      body:
        "Looking for a Lash & Brow Artist skilled in extensions, lash lift, brow lamination, tinting, and microblading. Steady hands and portfolio required.",
    },
  ],
  "Tattoo Artist": [
    {
      label: "Tattoo artist",
      body:
        "Hiring a Tattoo Artist with a strong portfolio in line work, shading, and colour realism. Hygiene, safety compliance, and client consultation skills are essential.",
    },
  ],
  "Salon Manager": [
    {
      label: "Salon manager",
      body:
        "Hiring a Salon Manager to lead daily operations, staff scheduling, client retention, and revenue growth. 3+ years of salon operations experience preferred.",
    },
  ],
  Receptionist: [
    {
      label: "Front desk",
      body:
        "Hiring a Salon Receptionist to manage appointments, greet clients, handle billing, and coordinate with staff. Good communication and basic computer skills required.",
    },
  ],
  "Salon Assistant": [
    {
      label: "Salon assistant",
      body:
        "Looking for a Salon Assistant to support stylists and therapists, maintain hygiene, prepare tools, and assist with client comfort. Freshers welcome.",
    },
  ],
  "Hair Colourist": [
    {
      label: "Hair colourist",
      body:
        "Hiring a Hair Colourist skilled in global colour, highlights, balayage, and colour correction. Knowledge of premium colour brands and consultation skills essential.",
    },
  ],
  "Bridal Makeup Artist": [
    {
      label: "Bridal artist",
      body:
        "Hiring a Bridal Makeup Artist for HD, airbrush, and traditional bridal looks. Weekend availability and portfolio required.",
    },
  ],
  Freelancer: [
    {
      label: "Freelance role",
      body:
        "We're onboarding freelance beauty professionals for on-demand bookings. Flexible schedule, per-service payouts, and platform support. Portfolio and hygiene compliance required.",
    },
  ],
  Other: [
    {
      label: "Custom role",
      body:
        "Describe the role, key responsibilities, required experience, working hours, and any preferred skills or certifications.",
    },
  ],
};

const STEPS = [
  { key: "details", label: "Job details" },
  { key: "location", label: "Location & schedule" },
  { key: "salary", label: "Salary & benefits" },
  { key: "requirements", label: "Requirements" },
  { key: "review", label: "Review & publish" },
] as const;

// UI-only fields (persisted to draft, stripped before Supabase save).
type UiOnlyFields = {
  business_type?: string;
  days_preset?: DayPreset | "";
  custom_days?: string[];
  hours_preset?: string;
  start_time?: string;
  end_time?: string;
  flexible_schedule?: boolean;
  joining_availability?: string;
  salary_type?: string;
  salary_range_preset?: string;
  certification?: string;
  languages?: string[];
  portfolio_option?: PortfolioOption | "";
  screening_questions?: ScreeningQuestion[];

};

type Form = Required<
  Pick<JobDraftInput, "title" | "category" | "description" | "job_type" | "city">
> &
  JobDraftInput & { benefits: string[]; skills: string[] } & UiOnlyFields;

const EMPTY: Form = {
  title: "",
  category: "",
  description: "",
  job_type: JOB_TYPES[0],
  experience_level: EXPERIENCE[0],
  city: "",
  area: "",
  address: "",
  schedule: "",
  salary_min: null,
  salary_max: null,
  salary_period: "monthly",
  benefits: [],
  requirements: "",
  skills: [],
  openings: 1,
  job_role: "",
  work_location: WORK_LOCATIONS[0],
  contact_person: "",
  contact_mobile: "",
  whatsapp_number: "",
  interview_mode: INTERVIEW_MODES[0],
  shop_id: null,
  business_type: "",
  days_preset: "",
  custom_days: [],
  hours_preset: "",
  start_time: "",
  end_time: "",
  flexible_schedule: false,
  joining_availability: "",
  salary_type: "",
  salary_range_preset: "",
  certification: "",
  languages: [],
  portfolio_option: "",
  screening_questions: [],

};

const DRAFT_STORAGE_KEY = "nexora:postJobWizard:v1";

type PersistedDraft = { step: number; form: Form; jobId?: string; skillsInput: string; userId?: string };

function loadDraft(): PersistedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedDraft;
  } catch {
    return null;
  }
}

export function PostJobPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/hire/post-job" }) as { jobId?: string };
  const editJobId = search.jobId;
  const { user, isInitialized } = useAuthStore();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  // When editing, ignore any persisted wizard draft — we hydrate from the job row.
  const initialDraft = typeof window !== "undefined" && !editJobId ? loadDraft() : null;
  const [step, setStep] = useState<number>(initialDraft?.step ?? 0);
  const [form, setForm] = useState<Form>(initialDraft?.form ?? EMPTY);
  const [jobId, setJobId] = useState<string | undefined>(editJobId ?? initialDraft?.jobId);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [skillsInput, setSkillsInput] = useState(initialDraft?.skillsInput ?? "");
  const [draftRestored, setDraftRestored] = useState<boolean>(!!initialDraft && (initialDraft.step > 0 || initialDraft.form.title.length > 0));
  const [publishError, setPublishError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [highlightInvalid, setHighlightInvalid] = useState(false);
  const stepCardRef = useRef<HTMLDivElement | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [publishedJob, setPublishedJob] = useState<JobRow | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!editJobId);

  // Persist wizard state to localStorage so it survives session expiry / re-login.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (editJobId) return; // don't overwrite the localStorage draft while editing
    try {
      const payload: PersistedDraft = { step, form, jobId, skillsInput, userId: user?.id };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [step, form, jobId, skillsInput, user?.id, editJobId]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      try {
        sessionStorage.setItem("nexora:postLoginRedirect", "/hire/post-job");
      } catch {}
      navigate({ to: "/login", search: { redirect: "/hire/post-job" } as never });
      return;
    }
    getMyEmployerProfile(user.id)
      .then((p) => {
        setProfile(p);
        if (!p) setShowSetup(true);
        else if (!editJobId) {
          setForm((f) => ({
            ...f,
            city: f.city || p.city,
            contact_mobile: f.contact_mobile || p.phone || "",
            contact_person: f.contact_person || p.business_name || "",
            whatsapp_number: f.whatsapp_number || p.phone || "",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
    getMyShopId(user.id).then((sid) => setShopId(sid)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);

  // Load an existing job for editing.
  useEffect(() => {
    if (!editJobId || !user) return;
    let cancelled = false;
    setLoadingEdit(true);
    setDraftRestored(false);
    getJobForEmployer(editJobId, user.id)
      .then((job) => {
        if (cancelled) return;
        if (!job) {
          toast.error("Job not found or you don't have access");
          navigate({ to: "/jobs/my-posts" });
          return;
        }
        setJobId(job.id);
        setForm({
          title: job.title ?? "",
          category: job.category ?? "",
          description: job.description ?? "",
          job_type: job.job_type ?? JOB_TYPES[0],
          experience_level: job.experience_level ?? EXPERIENCE[0],
          city: job.city ?? "",
          area: job.area ?? "",
          address: job.address ?? "",
          schedule: job.schedule ?? "",
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_period: (job.salary_period as any) ?? "monthly",
          benefits: job.benefits ?? [],
          requirements: stripRequirementsMeta(job.requirements),
          skills: job.skills ?? [],
          openings: job.openings ?? 1,
          job_role: job.job_role ?? "",
          work_location:
            (job.work_location && (LEGACY_WORK_LOCATION_MAP[job.work_location] ?? job.work_location)) ||
            WORK_LOCATIONS[0],
          contact_person: job.contact_person ?? "",
          contact_mobile: job.contact_mobile ?? "",
          whatsapp_number: job.whatsapp_number ?? "",
          interview_mode: job.interview_mode ?? INTERVIEW_MODES[0],
          shop_id: job.shop_id ?? null,
          business_type: "",
          days_preset: "",
          custom_days: [],
          hours_preset: "",
          start_time: "",
          end_time: "",
          flexible_schedule: /flexible/i.test(job.schedule ?? ""),
          ...(() => {
            const m = parseRequirementsMeta(job.requirements);
            return {
              certification: m.certification,
              languages: m.languages,
              portfolio_option: m.portfolio,
              screening_questions: m.screening,

            };
          })(),
        });
        setSkillsInput((job.skills ?? []).join(", "));
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load job";
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoadingEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editJobId, user, navigate]);



  const update = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const errors = useMemo(() => validateForm(form), [form]);
  const markAttempted = (i: number) =>
    setAttempted((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  const stepInvalid = (i: number) => {
    if (i === 0) return !!(errors.title || errors.category || errors.description || errors.openings);
    if (i === 1) return !!(errors.city || errors.contact_mobile);
    if (i === 2) return !!(errors.salary_min || errors.salary_max);
    return false;
  };

  

  function tryContinue() {
    if (stepInvalid(step)) {
      markAttempted(step);
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function firstInvalidStep(): number | null {
    for (let i = 0; i <= 3; i++) if (stepInvalid(i)) return i;
    return null;
  }


  async function persist(publish: boolean) {
    if (!user || !profile) {
      setShowSetup(true);
      return;
    }
    if (publish) {
      const bad = firstInvalidStep();
      if (bad !== null) {
        // Reveal errors on every step up through the failing one and jump there.
        setAttempted(new Set([0, 1, 2, 3]));
        setStep(bad);
        setHighlightInvalid(true);
        // Scroll the wizard card into view and pulse the ring highlight.
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            stepCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          window.setTimeout(() => setHighlightInvalid(false), 1600);
        }
        toast.error("Please fix the highlighted fields before publishing.");
        return;
      }
    }
    setSaving(publish ? "publish" : "draft");
    if (publish) setPublishError(null);

    let createdJobId: string | undefined;
    try {
      // Strip UI-only fields — they belong to the draft, not the DB.
      const {
        business_type: _bt,
        days_preset: _dp,
        custom_days: _cd,
        hours_preset: _hp,
        start_time: _st,
        end_time: _et,
        flexible_schedule: _fs,
        joining_availability: _ja,
        salary_type: _sty,
        salary_range_preset: _srp,
        certification: _cert,
        languages: _lng,
        portfolio_option: _po,
        screening_questions: _sq,
        ...dbForm
      } = form;
      void _bt; void _dp; void _cd; void _hp; void _st; void _et; void _fs;
      void _ja; void _sty; void _srp; void _cert; void _lng; void _po; void _sq;

      // Encode meta into requirements text so job detail + apply form can read
      // them without a schema change. Human-readable "Key: value" lines.
      const baseReq = stripRequirementsMeta(dbForm.requirements);
      const metaLines: string[] = [];
      if (form.certification) metaLines.push(`Certification: ${form.certification}`);
      if (form.languages && form.languages.length > 0)
        metaLines.push(`Languages: ${form.languages.join(", ")}`);
      if (form.portfolio_option) metaLines.push(`Portfolio: ${form.portfolio_option}`);
      if (form.screening_questions && form.screening_questions.length > 0)
        metaLines.push(`Screening: ${JSON.stringify(form.screening_questions)}`);
      const composedReq = [baseReq, metaLines.join("\n")].filter(Boolean).join("\n\n").trim();

      const cleaned: JobDraftInput = {
        ...dbForm,
        area: dbForm.area || null,
        address: dbForm.address || null,
        schedule: dbForm.schedule || null,
        experience_level: dbForm.experience_level || null,
        requirements: composedReq || null,
        salary_min: dbForm.salary_min ?? null,
        salary_max: dbForm.salary_max ?? null,
        openings: Math.min(50, Math.max(1, Number(dbForm.openings) || 1)),
        job_role: dbForm.job_role?.trim() || null,
        specific_role: dbForm.job_role?.trim() || null,
        work_location: dbForm.work_location || null,
        contact_person: dbForm.contact_person?.trim() || null,
        contact_mobile: dbForm.contact_mobile?.trim() || null,
        whatsapp_number: dbForm.whatsapp_number?.trim() || null,
        interview_mode: dbForm.interview_mode || null,
        shop_id: shopId,
      };
      const row = await saveJob({
        jobId,
        employerId: profile.id,
        userId: user.id,
        input: cleaned,
        publish,
      });
      setJobId(row.id);
      createdJobId = row.id;
      if (publish) {
        try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
        toast.success("Job posted successfully.", {
          description: `${row.title} is now live. Share it with candidates or view applications.`,
        });
        setPublishedJob(row);
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }
      } else {
        toast.success("Draft saved");
      }
    } catch (e: any) {
      const msg = e?.message ?? "Failed to save job";
      if (publish) {
        setPublishError(msg);
      }
      toast.error(msg);
    } finally {
      setSaving(null);
    }
    return createdJobId;
  }

  async function retryPublish() {
    // If the job was already created but only navigation failed, jump straight to it.
    if (jobId) {
      try {
        setPublishError(null);
        await navigate({ to: "/jobs/$jobId", params: { jobId } });
        return;
      } catch (navErr: any) {
        setPublishError(
          `Your job was published but we couldn't open it automatically. ${navErr?.message ?? ""}`.trim(),
        );
        return;
      }
    }
    await persist(true);
  }


  if (!isInitialized || loadingProfile) {
    return (
      <div className="min-h-screen bg-background p-8 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <div className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" aria-label="Go back" />
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold tracking-tight">Nexora</span>
          </Link>
          <div className="ml-auto text-xs text-muted-foreground">
            Posting as <span className="font-semibold text-heading">{profile?.business_name ?? "—"}</span>
          </div>
        </div>
      </div>

      <EmployerSetupModal open={showSetup} onClose={() => setShowSetup(false)} redirectTo="/hire/post-job" />

      {publishedJob ? (
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-6">
          <JobPublishedSuccess
            job={publishedJob}
            profile={profile}
            onPostAnother={() => {
              setPublishedJob(null);
              setJobId(undefined);
              setForm({
                ...EMPTY,
                city: profile?.city ?? "",
                contact_person: profile?.business_name ?? "",
                contact_mobile: profile?.phone ?? "",
                whatsapp_number: profile?.phone ?? "",
              });
              setSkillsInput("");
              setAttempted(new Set());
              setStep(0);
              try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
            }}
          />
        </div>
      ) : (
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-6">
        {draftRestored && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span className="text-heading">
              Welcome back — we restored your draft at <strong>{STEPS[step].label}</strong>.
            </span>
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
                setForm(EMPTY);
                setStep(0);
                setJobId(undefined);
                setSkillsInput("");
                setDraftRestored(false);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold hover:bg-muted"
            >
              Start over
            </button>
          </div>
        )}
        {/* Progress */}
        <div className="mb-6">


          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length} · <span className="text-heading">{STEPS[step].label}</span>
            </span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-gradient-cta h-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-4 hidden gap-2 md:flex">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  i === step
                    ? "bg-gradient-cta text-primary-foreground"
                    : i < step
                    ? "bg-primary/10 text-heading"
                    : "bg-card text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div
              ref={stepCardRef}
              data-testid="wizard-step-card"
              data-invalid-step={highlightInvalid ? "true" : "false"}
              className={cn(
                "rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow",
                highlightInvalid && "ring-2 ring-destructive ring-offset-2 border-destructive",
              )}
            >
              {step === 0 && (
                <DetailsStep
                  form={form}
                  update={update}
                  errors={attempted.has(0) ? errors : {}}
                />
              )}
              {step === 1 && (
                <LocationStep
                  form={form}
                  update={update}
                  errors={attempted.has(1) ? errors : {}}
                />
              )}
              {step === 2 && (
                <SalaryStep
                  form={form}
                  update={update}
                  errors={attempted.has(2) ? errors : {}}
                />
              )}

              {step === 3 && (
                <RequirementsStep
                  form={form}
                  update={update}
                  skillsInput={skillsInput}
                  setSkillsInput={setSkillsInput}
                />
              )}
              {step === 4 && (
                <ReviewStep
                  form={form}
                  profile={profile}
                  publishError={publishError}
                  onRetry={retryPublish}
                  onDismissError={() => setPublishError(null)}
                  retrying={saving === "publish"}
                  hasSavedJob={!!jobId}
                />
              )}
            </div>

            {/* Desktop action row */}
            <div className="mt-4 hidden items-center justify-between md:flex">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => persist(false)}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {saving === "draft" ? "Saving…" : "Save draft"}
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={tryContinue}
                    className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>

                ) : (
                  <button
                    type="button"
                    onClick={() => persist(true)}
                    disabled={saving !== null}
                    className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)] disabled:opacity-60"
                  >
                    {saving === "publish" ? "Publishing…" : "Publish job"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live preview
              </p>
              <LivePreview form={form} profile={profile} />
            </div>
          </aside>
        </div>
      </div>
      )}

      {/* Mobile sticky bottom action */}
      {!publishedJob && (
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-border bg-card/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-[var(--radius-button)] border border-border px-3 py-2.5 text-xs font-semibold disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => persist(false)}
          disabled={saving !== null}
          className="rounded-[var(--radius-button)] border border-border px-3 py-2.5 text-xs font-semibold disabled:opacity-60"
        >
          Draft
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={tryContinue}
            className="bg-gradient-cta text-primary-foreground flex-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold"
          >
            Continue
          </button>

        ) : (
          <button
            type="button"
            onClick={() => persist(true)}
            disabled={saving !== null}
            className="bg-gradient-cta text-primary-foreground flex-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        )}
      </div>
      )}
    </div>
  );
}

// ---------- Steps ----------

export type FormErrors = {
  title?: string;
  category?: string;
  description?: string;
  openings?: string;
  city?: string;
  salary_min?: string;
  salary_max?: string;
  contact_mobile?: string;
};

function validateForm(form: Form): FormErrors {
  const errs: FormErrors = {};
  const title = form.title.trim();
  if (title.length === 0) errs.title = "Job title is required.";
  else if (title.length < 3) errs.title = "Job title must be at least 3 characters.";
  else if (title.length > 80) errs.title = "Job title must be 80 characters or fewer.";

  if (!form.category || !form.category.trim())
    errs.category = "Please pick a beauty category.";

  const desc = form.description.trim();
  if (desc.length === 0) errs.description = "Description is required.";
  else if (desc.length < 10) errs.description = "Description must be at least 10 characters.";

  const openings = form.openings;
  if (openings === undefined || openings === null || Number.isNaN(openings))
    errs.openings = "Number of openings is required.";
  else if (!Number.isInteger(openings)) errs.openings = "Openings must be a whole number.";
  else if (openings < 1) errs.openings = "There must be at least 1 opening.";
  else if (openings > 50) errs.openings = "Openings cannot exceed 50.";

  const city = form.city.trim();
  if (city.length === 0) errs.city = "City is required.";
  else if (city.length < 2) errs.city = "Enter a valid city.";

  const mobile = (form.contact_mobile ?? "").replace(/\D/g, "");
  if (mobile.length === 0) errs.contact_mobile = "Contact mobile is required.";
  else if (mobile.length < 10) errs.contact_mobile = "Enter a valid 10-digit mobile.";


  const min = form.salary_min;
  const max = form.salary_max;
  const hasMin = typeof min === "number" && !Number.isNaN(min);
  const hasMax = typeof max === "number" && !Number.isNaN(max);
  if (hasMin && (min as number) < 0) errs.salary_min = "Salary can't be negative.";
  if (hasMax && (max as number) < 0) errs.salary_max = "Salary can't be negative.";
  if (hasMin && !hasMax) errs.salary_max = "Enter a maximum, or clear the minimum.";
  if (!hasMin && hasMax) errs.salary_min = "Enter a minimum, or clear the maximum.";
  if (hasMin && hasMax && (max as number) < (min as number))
    errs.salary_max = "Maximum must be greater than or equal to minimum.";

  return errs;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-heading mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs font-semibold text-destructive">
          {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const inputErrCls =
  "w-full rounded-lg border border-destructive bg-background px-3 py-2.5 text-sm outline-none focus:border-destructive";

const QUICK_START_TEMPLATES: { label: string; body: string }[] = [
  {
    label: "Hair salon role",
    body:
      "We are looking for a skilled [Specific Job Role] to join our salon team. The candidate should be confident in haircutting, styling, client consultation and maintaining a professional salon experience.",
  },
  {
    label: "Beauty parlour role",
    body:
      "We are looking for a professional [Specific Job Role] who is experienced in beauty services, client consultation, hygiene and customer satisfaction.",
  },
  {
    label: "Spa role",
    body:
      "We are looking for a skilled [Specific Job Role] who can deliver quality spa and wellness services while maintaining a premium client experience.",
  },
  {
    label: "Nail studio role",
    body:
      "We are looking for a creative [Specific Job Role] who is skilled in nail extensions, nail art, hygiene and client consultation.",
  },
  {
    label: "Bridal service role",
    body:
      "We are looking for a talented [Specific Job Role] with strong knowledge of bridal, party or professional makeup services and client handling.",
  },
  {
    label: "Freelancer role",
    body:
      "We are looking for a passionate freelance [Specific Job Role] who can deliver quality services on-demand while managing bookings, hygiene and client satisfaction.",
  },
  { label: "Write my own", body: "" },
];

function DetailsStep({
  form,
  update,
  errors,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  errors: FormErrors;
}) {

  const GENERAL_ROLES = [
    "Senior Beauty Professional",
    "Junior Beauty Professional",
    "Beauty Assistant",
    "Salon Executive",
    "Freelance Beauty Expert",
    "Trainee",
    "Other",
  ];
  const roleOptions = form.category
    ? ROLE_SUGGESTIONS[form.category] ?? GENERAL_ROLES
    : GENERAL_ROLES;
  const selectedRole = (form.job_role ?? "").trim();
  const titleValue = form.title.trim();
  const titleMatchesRole = selectedRole.length > 0 && titleValue === selectedRole;
  const [pendingTemplate, setPendingTemplate] = useState<{ label: string; body: string } | null>(null);
  const [activeQuickTemplate, setActiveQuickTemplate] = useState<string | null>(null);

  function fillQuickTemplate(t: { label: string; body: string }) {
    const roleForTemplate =
      (form.specific_role ?? "").trim() ||
      selectedRole ||
      form.category ||
      "beauty professional";
    const filled = t.body.replace(/\[Specific Job Role\]/g, roleForTemplate);
    update({ description: filled });
    setActiveQuickTemplate(t.label);
  }

  function onQuickTemplateClick(t: { label: string; body: string }) {
    if (t.body === "") {
      // "Write my own" — clear selection, do not touch description.
      setActiveQuickTemplate(t.label);
      return;
    }
    if (form.description.trim().length === 0) {
      fillQuickTemplate(t);
    } else {
      setPendingTemplate(t);
    }
  }


  function pickRole(role: string) {
    const next = selectedRole === role ? "" : role;
    const patch: Partial<Form> = { job_role: next };
    // Auto-fill title only when empty, so we never overwrite manual input.
    if (next && titleValue.length === 0) patch.title = next;
    update(patch);
  }

  function applyRoleAsTitle() {
    if (!selectedRole) return;
    update({ title: selectedRole });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Job details</h2>
      <Field label="Job title" error={errors.title} hint={`${form.title.trim().length}/80 characters`}>
        <input
          className={errors.title ? inputErrCls : inputCls}
          placeholder="Example: Senior Hair Stylist"
          aria-invalid={!!errors.title}
          maxLength={80}
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            Select a beauty category and role below to fill this faster.
          </p>
          {selectedRole && !titleMatchesRole && (
            <button
              type="button"
              onClick={applyRoleAsTitle}
              className="text-primary text-xs font-semibold underline-offset-2 hover:underline"
            >
              Use selected role as job title
            </button>
          )}
        </div>
      </Field>
      <Field
        label="Choose beauty category"
        hint="Select a category to see relevant role, skill and job description suggestions."
        error={errors.category}
      >
        <div
          role="radiogroup"
          aria-label="Choose beauty category"
          aria-invalid={!!errors.category}
          className={cn(
            "grid grid-cols-2 gap-2 sm:grid-cols-3 rounded-lg",
            errors.category && "ring-1 ring-destructive p-2",
          )}
        >
          {CATEGORIES.map((c) => {
            const active = form.category === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  if (form.category === c) return;
                  update({ category: c });
                  toast.success(`Suggestions updated for ${c}.`, { duration: 2000 });
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                  active
                    ? "border-primary bg-primary/10 text-heading shadow-[var(--shadow-glow)]"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
        {form.category && (
          <p className="text-muted-foreground mt-2 text-xs">Selected: {form.category}</p>
        )}
      </Field>
      <Field
        label="Specific job role"
        hint="Choose a suggested role or type your own."
      >
        <input
          className={inputCls}
          placeholder="Example: Bridal Hair Specialist"
          maxLength={80}
          value={form.job_role ?? ""}
          onChange={(e) => update({ job_role: e.target.value })}
        />
        {roleOptions.length > 0 && (
          <div className="mt-3">
            <p className="text-heading mb-2 text-xs font-semibold">Quick role suggestions</p>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => {
                const active = selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => pickRole(role)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      active
                        ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                    )}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Field>
      <Field label="Employment type">
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => {
            const active = form.job_type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update({ job_type: t })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Experience required" hint="Choose the level that best matches this role.">
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE.map((e) => {
            const value = experienceValueFor(e);
            const current = form.experience_level ?? experienceValueFor(EXPERIENCE[0]);
            const active = current === value;
            return (
              <button
                key={e}
                type="button"
                onClick={() => update({ experience_level: value })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {e}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Number of openings"
        hint="How many people are you hiring for this role? (1–50)"
        error={errors.openings}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              update({ openings: Math.max(1, (Number(form.openings) || 1) - 1) })
            }
            aria-label="Decrease openings"
            className="h-10 w-10 rounded-lg border border-border bg-background text-lg font-bold text-heading hover:bg-muted disabled:opacity-40"
            disabled={(Number(form.openings) || 1) <= 1}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            className={cn(errors.openings ? inputErrCls : inputCls, "w-24 text-center")}
            aria-invalid={!!errors.openings}
            value={form.openings ?? 1}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                update({ openings: undefined as unknown as number });
                return;
              }
              const n = parseInt(raw, 10);
              if (Number.isNaN(n)) return;
              update({ openings: Math.min(50, Math.max(1, n)) });
            }}
            onBlur={() => {
              if (!form.openings || form.openings < 1) update({ openings: 1 });
            }}
          />
          <button
            type="button"
            onClick={() =>
              update({ openings: Math.min(50, (Number(form.openings) || 1) + 1) })
            }
            aria-label="Increase openings"
            className="h-10 w-10 rounded-lg border border-border bg-background text-lg font-bold text-heading hover:bg-muted disabled:opacity-40"
            disabled={(Number(form.openings) || 1) >= 50}
          >
            +
          </button>
        </div>
      </Field>
      <Field
        label="Job description"
        hint="Describe the role, day-to-day work, and your salon culture."
        error={errors.description}
      >
        <textarea
          className={cn(errors.description ? inputErrCls : inputCls, "min-h-[140px] resize-y")}
          aria-invalid={!!errors.description}
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />
        <div className="mt-3">
          <p className="text-heading mb-2 text-xs font-semibold">Start with a template</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_START_TEMPLATES.map((t) => {
              const active = activeQuickTemplate === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => onQuickTemplateClick(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        {pendingTemplate && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10,37,64,0.5)" }}
            onClick={() => setPendingTemplate(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl p-6 shadow-[var(--shadow-float)]"
            >
              <h3 className="text-heading text-lg font-bold">Replace current description?</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                You already have a job description. Do you want to replace it with this template?
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingTemplate(null)}
                  className="border-border text-heading hover:bg-muted rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Keep my description
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fillQuickTemplate(pendingTemplate);
                    setPendingTemplate(null);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Replace description
                </button>
              </div>
            </div>
          </div>
        )}

        {(() => {
          const rawTemplates =
            (form.category && DESCRIPTION_TEMPLATES[form.category]) ||
            GENERAL_DESCRIPTION_TEMPLATES;
          if (!rawTemplates.length) return null;

          const PLACEHOLDER_TAIL =
            "\n\nRole: {role}\nCategory: {category}\nLocation: {city}\nExperience: {experience}\nOpenings: {openings}\nSalary: {salary}";

          const templates = rawTemplates.map((t) => ({
            ...t,
            body: `${t.body}${PLACEHOLDER_TAIL}`,
          }));

          const salary =
            form.salary_min != null && form.salary_max != null
              ? `₹${form.salary_min}–₹${form.salary_max}`
              : form.salary_min != null
                ? `₹${form.salary_min}+`
                : "";
          const values: Record<string, string> = {
            role: form.job_role?.trim() || "",
            category: form.category || "",
            city: form.city?.trim() || "",
            experience: form.experience_level || "",
            openings: form.openings ? String(form.openings) : "",
            salary,
          };
          const substitute = (body: string) =>
            body.replace(/\{(\w+)\}/g, (m, k: string) =>
              values[k] ? values[k] : m,
            );
          const extractTokens = (body: string) =>
            Array.from(
              new Set(Array.from(body.matchAll(/\{(\w+)\}/g)).map((x) => x[1])),
            );

          const insert = (body: string) => {
            const filled = substitute(body);
            const current = form.description.trim();
            const next = current.length === 0 ? filled : `${current}\n\n${filled}`;
            update({ description: next });
          };

          return (
            <div className="mt-3">
              <p className="text-heading mb-2 text-xs font-semibold">
                Description templates
                {form.category ? (
                  <span className="text-muted-foreground font-normal"> · {form.category}</span>
                ) : null}
              </p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => {
                  const tokens = extractTokens(t.body);
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => insert(t.body)}
                      title={substitute(t.body)}
                      className="border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition"
                    >
                      <span>+ {t.label}</span>
                      {tokens.length > 0 && (
                        <span className="flex flex-wrap gap-1">
                          {tokens.map((tok) => {
                            const filled = !!values[tok];
                            return (
                              <span
                                key={tok}
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                                  filled
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {`{${tok}}`}
                              </span>
                            );
                          })}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-muted-foreground mt-1.5 text-[11px]">
                Chips show the variables each template uses. Filled variables (highlighted) are replaced with your form values on insert; empty ones stay as{" "}
                <code>{"{placeholder}"}</code> so you can edit later.
              </p>
            </div>
          );
        })()}

      </Field>
    </div>
  );
}

function LocationStep({
  form,
  update,
  errors,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  errors: FormErrors;
}) {
  const chipCls = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-xs font-bold transition",
      active
        ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
    );

  // Compose schedule text from days + hours whenever they change.
  const composeSchedule = (patch: Partial<Form>) => {
    const next = { ...form, ...patch };
    const preset = next.days_preset ?? "";
    let daysText = "";
    if (preset === "Custom days") {
      daysText = (next.custom_days ?? []).join(", ");
    } else if (preset) {
      daysText = preset;
    }
    let hoursText = "";
    if (next.flexible_schedule) hoursText = "Flexible hours";
    else if (next.start_time && next.end_time) hoursText = `${next.start_time} – ${next.end_time}`;
    const schedule = [daysText, hoursText].filter(Boolean).join(" • ");
    update({ ...patch, schedule });
  };

  const selectDaysPreset = (preset: DayPreset) => {
    if (preset === "Custom days") {
      composeSchedule({ days_preset: preset });
      return;
    }
    composeSchedule({ days_preset: preset, custom_days: DAYS_FOR_PRESET[preset] });
  };

  const toggleCustomDay = (day: string) => {
    const current = new Set(form.custom_days ?? []);
    if (current.has(day)) current.delete(day);
    else current.add(day);
    // Preserve week order.
    const ordered = WEEK_DAYS.filter((d) => current.has(d));
    composeSchedule({ days_preset: "Custom days", custom_days: ordered });
  };

  const selectHoursPreset = (label: string) => {
    const preset = HOUR_PRESETS.find((h) => h.label === label);
    if (!preset) return;
    if (preset.flexible) {
      composeSchedule({
        hours_preset: label,
        flexible_schedule: true,
        start_time: "",
        end_time: "",
      });
      return;
    }
    if (preset.start && preset.end) {
      composeSchedule({
        hours_preset: label,
        flexible_schedule: false,
        start_time: preset.start,
        end_time: preset.end,
      });
      return;
    }
    // Custom time — keep manual inputs, clear flexible.
    composeSchedule({ hours_preset: label, flexible_schedule: false });
  };

  const [cityFocused, setCityFocused] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Location & schedule</h2>

      <Field label="Business type">
        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map((b) => {
            const active = form.business_type === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => update({ business_type: b })}
                aria-pressed={active}
                className={chipCls(active)}
              >
                {b}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="City" error={errors.city}>
          <input
            className={errors.city ? inputErrCls : inputCls}
            aria-invalid={!!errors.city}
            value={form.city}
            onChange={(e) => update({ city: e.target.value })}
            onFocus={() => setCityFocused(true)}
            onBlur={() => window.setTimeout(() => setCityFocused(false), 150)}
          />
          {cityFocused && (
            <div className="mt-2 flex flex-wrap gap-2">
              {CITY_QUICK_OPTIONS.map((c) => {
                const active = form.city === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      update({ city: c === "Other city" ? "" : c });
                    }}
                    className={chipCls(active)}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </Field>
        <Field label="Area / locality">
          <input
            className={inputCls}
            value={form.area ?? ""}
            onChange={(e) => update({ area: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Address (optional)">
        <input
          className={inputCls}
          value={form.address ?? ""}
          onChange={(e) => update({ address: e.target.value })}
        />
      </Field>

      <Field label="Work location">
        <div className="flex flex-wrap gap-2">
          {WORK_LOCATIONS.map((w) => {
            const active = form.work_location === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => update({ work_location: w })}
                aria-pressed={active}
                className={chipCls(active)}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Working days">
        <div className="flex flex-wrap gap-2">
          {DAY_PRESETS.map((p) => {
            const active = form.days_preset === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => selectDaysPreset(p)}
                aria-pressed={active}
                className={chipCls(active)}
              >
                {p}
              </button>
            );
          })}
        </div>
        {form.days_preset === "Custom days" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEK_DAYS.map((d) => {
              const active = (form.custom_days ?? []).includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleCustomDay(d)}
                  aria-pressed={active}
                  className={chipCls(active)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}
      </Field>

      <Field label="Working hours">
        <div className="flex flex-wrap gap-2">
          {HOUR_PRESETS.map((h) => {
            const active = form.hours_preset === h.label;
            return (
              <button
                key={h.label}
                type="button"
                onClick={() => selectHoursPreset(h.label)}
                aria-pressed={active}
                className={chipCls(active)}
              >
                {h.label}
              </button>
            );
          })}
        </div>
        {form.hours_preset === "Custom time" && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              className={inputCls}
              placeholder="Start time (e.g. 10 AM)"
              value={form.start_time ?? ""}
              onChange={(e) => composeSchedule({ start_time: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="End time (e.g. 8 PM)"
              value={form.end_time ?? ""}
              onChange={(e) => composeSchedule({ end_time: e.target.value })}
            />
          </div>
        )}
        {form.schedule && (
          <p className="text-muted-foreground mt-2 text-xs">
            Preview: <span className="text-heading font-semibold">{form.schedule}</span>
          </p>
        )}
      </Field>

      <Field label="Joining availability">
        <div className="flex flex-wrap gap-2">
          {JOINING_OPTIONS.map((j) => {
            const active = form.joining_availability === j;
            return (
              <button
                key={j}
                type="button"
                onClick={() => update({ joining_availability: j })}
                aria-pressed={active}
                className={chipCls(active)}
              >
                {j}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="mt-2 border-t border-border pt-4">
        <h3 className="text-heading mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Contact details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contact person" hint="Who should candidates reach out to?">
            <input
              className={inputCls}
              placeholder="e.g. Priya (HR)"
              value={form.contact_person ?? ""}
              onChange={(e) => update({ contact_person: e.target.value })}
            />
          </Field>
          <Field label="Contact mobile" error={errors.contact_mobile}>
            <input
              type="tel"
              inputMode="numeric"
              className={errors.contact_mobile ? inputErrCls : inputCls}
              placeholder="10-digit mobile"
              aria-invalid={!!errors.contact_mobile}
              value={form.contact_mobile ?? ""}
              onChange={(e) => update({ contact_mobile: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp number" hint="Optional — leave blank to use the contact mobile.">
            <input
              type="tel"
              inputMode="numeric"
              className={inputCls}
              placeholder="WhatsApp number"
              value={form.whatsapp_number ?? ""}
              onChange={(e) => update({ whatsapp_number: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function SalaryStep({
  form,
  update,
  errors,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  errors: FormErrors;
}) {
  const chipCls = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-xs font-bold transition",
      active
        ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
    );
  const selectRange = (
    r: { label: string; min: number; max: number | null },
    period: JobDraftInput["salary_period"],
  ) => {
    update({
      salary_range_preset: r.label,
      salary_min: r.min,
      salary_max: r.max,
      salary_period: period,
    });
  };
  const rangeSetFor = (
    type: string | undefined,
  ): { label: string; min: number; max: number | null }[] | null => {
    if (type === "Monthly salary") return MONTHLY_SALARY_RANGES;
    if (type === "Daily pay") return DAILY_PAY_RANGES;
    if (type === "Hourly pay") return HOURLY_PAY_RANGES;
    if (type === "Fixed + commission") return FIXED_COMMISSION_RANGES;
    return null;
  };
  const periodFor = (type: string | undefined): JobDraftInput["salary_period"] => {
    if (type === "Daily pay") return "daily" as JobDraftInput["salary_period"];
    if (type === "Hourly pay") return "hourly";
    return "monthly";
  };
  const rangeLabelFor = (type: string | undefined) => {
    if (type === "Monthly salary") return "Monthly salary range";
    if (type === "Daily pay") return "Daily pay range";
    if (type === "Hourly pay") return "Hourly pay range";
    if (type === "Fixed + commission") return "Fixed salary + commission";
    return "";
  };
  const customLabelFor = (type: string | undefined) =>
    type === "Fixed + commission" ? "Custom fixed salary" : "Custom amount";
  const activeRanges = rangeSetFor(form.salary_type);
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Salary & benefits</h2>

      <Field label="Salary type">
        <div className="flex flex-wrap gap-2">
          {SALARY_TYPES.map((s) => {
            const active = form.salary_type === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => update({ salary_type: s })}
                aria-pressed={active}
                className={chipCls(active)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Field>

      {activeRanges && (
        <Field label={rangeLabelFor(form.salary_type)}>
          <div className="flex flex-wrap gap-2">
            {activeRanges.map((r) => {
              const active = form.salary_range_preset === r.label;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => selectRange(r, periodFor(form.salary_type))}
                  aria-pressed={active}
                  className={chipCls(active)}
                >
                  {r.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => update({ salary_range_preset: customLabelFor(form.salary_type) })}
              aria-pressed={form.salary_range_preset === customLabelFor(form.salary_type)}
              className={chipCls(form.salary_range_preset === customLabelFor(form.salary_type))}
            >
              {customLabelFor(form.salary_type)}
            </button>
          </div>
        </Field>
      )}

      <div className="grid gap-4 md:grid-cols-3">

        <Field label="Min" error={errors.salary_min}>
          <input
            type="number"
            min={0}
            className={errors.salary_min ? inputErrCls : inputCls}
            aria-invalid={!!errors.salary_min}
            value={form.salary_min ?? ""}
            onChange={(e) =>
              update({ salary_min: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Max" error={errors.salary_max}>
          <input
            type="number"
            min={0}
            className={errors.salary_max ? inputErrCls : inputCls}
            aria-invalid={!!errors.salary_max}
            value={form.salary_max ?? ""}
            onChange={(e) =>
              update({ salary_max: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Period">
          <select
            className={inputCls}
            value={form.salary_period ?? "monthly"}
            onChange={(e) => update({ salary_period: e.target.value })}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value ?? "monthly"}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="space-y-3">
        <div>
          <span className="text-heading mb-2 block text-sm font-semibold">Benefit bundles</span>
          <div className="flex flex-wrap gap-2">
            {BENEFIT_BUNDLES.map((bundle) => {
              const allSelected = bundle.items.every((i) => form.benefits.includes(i));
              return (
                <button
                  type="button"
                  key={bundle.label}
                  onClick={() => {
                    // Add all missing bundle items; never remove existing selections.
                    const merged = Array.from(new Set([...form.benefits, ...bundle.items]));
                    update({ benefits: merged });
                  }}
                  aria-pressed={allSelected}
                  className={chipCls(allSelected)}
                  title={bundle.items.join(", ")}
                >
                  {bundle.label}
                </button>
              );
            })}
          </div>
          <p className="text-muted-foreground mt-1 text-[11px]">
            Bundles add all their benefits. Active only when every benefit inside is selected.
          </p>
        </div>
        <div>
          <span className="text-heading mb-2 block text-sm font-semibold">Benefits</span>
          <div className="flex flex-wrap gap-2">
            {BENEFITS.map((b) => {
              const on = form.benefits.includes(b);
              return (
                <button
                  type="button"
                  key={b}
                  onClick={() =>
                    update({
                      benefits: on
                        ? form.benefits.filter((x) => x !== b)
                        : [...form.benefits, b],
                    })
                  }
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    on
                      ? "bg-gradient-cta border-transparent text-primary-foreground"
                      : "border-border bg-card text-heading",
                  )}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

function RequirementsStep({
  form,
  update,
  skillsInput,
  setSkillsInput,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  skillsInput: string;
  setSkillsInput: (v: string) => void;
}) {
  function addSkill() {
    const v = skillsInput.trim();
    if (!v) return;
    if (form.skills.includes(v)) return;
    update({ skills: [...form.skills, v] });
    setSkillsInput("");
  }
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Requirements</h2>
      <Field label="Skills" hint="Press Enter to add.">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2">
          {form.skills.map((s) => (
            <span
              key={s}
              className="bg-muted text-heading inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
            >
              {s}
              <button
                type="button"
                onClick={() => update({ skills: form.skills.filter((x) => x !== s) })}
                className="text-muted-foreground hover:text-heading"
                aria-label={`Remove ${s}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
            placeholder="e.g. Balayage"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
        </div>
        {(() => {
          const suggested = SKILL_SUGGESTIONS[form.category] ?? [];
          if (suggested.length === 0) return null;
          const toggle = (s: string) => {
            const on = form.skills.includes(s);
            update({
              skills: on ? form.skills.filter((x) => x !== s) : [...form.skills, s],
            });
          };
          return (
            <div className="mt-3">
              <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wide font-semibold">
                Suggested for {form.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggested.map((s) => {
                  const on = form.skills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      aria-pressed={on}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        on
                          ? "bg-gradient-cta border-transparent text-primary-foreground"
                          : "border-border bg-card text-heading hover:border-primary/50",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </Field>
      <Field label="Additional requirements">
        <textarea
          className={cn(inputCls, "min-h-[120px] resize-y")}
          value={form.requirements ?? ""}
          onChange={(e) => update({ requirements: e.target.value })}
        />
      </Field>

      <Field label="Certification">
        <div className="flex flex-wrap gap-2">
          {CERTIFICATIONS.map((c) => {
            const active = form.certification === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => update({ certification: c })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Language preferences" hint="Select all that apply.">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => {
            const active = (form.languages ?? []).includes(l);
            return (
              <button
                key={l}
                type="button"
                onClick={() =>
                  update({
                    languages: active
                      ? (form.languages ?? []).filter((x) => x !== l)
                      : [...(form.languages ?? []), l],
                  })
                }
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-gradient-cta border-transparent text-primary-foreground"
                    : "border-border bg-card text-heading hover:border-primary/50",
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Portfolio requirement">
        <div className="flex flex-wrap gap-2">
          {PORTFOLIO_OPTIONS.map((p) => {
            const active = form.portfolio_option === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => update({ portfolio_option: p })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Interview mode" hint="How would you like to interview shortlisted candidates?">
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_MODES.map((m) => {
            const active = form.interview_mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => update({ interview_mode: m })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Field>

      <ScreeningQuestionsField
        value={form.screening_questions ?? []}
        onChange={(next) => update({ screening_questions: next })}
      />
    </div>
  );
}

const SCREENING_TYPE_LABELS: Record<ScreeningQuestionType, string> = {
  short: "Short answer",
  long: "Long answer",
  yesno: "Yes / No",
  number: "Number",
};

function ScreeningQuestionsField({
  value,
  onChange,
}: {
  value: ScreeningQuestion[];
  onChange: (next: ScreeningQuestion[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<ScreeningQuestionType>("short");

  const has = (q: string) => value.some((x) => x.q.trim().toLowerCase() === q.trim().toLowerCase());

  const addSuggested = (sq: ScreeningQuestion) => {
    if (has(sq.q)) return;
    onChange([...value, { q: sq.q, t: sq.t }]);
  };

  const addCustom = () => {
    const q = draft.trim();
    if (!q || has(q)) {
      setDraft("");
      return;
    }
    onChange([...value, { q, t: draftType }]);
    setDraft("");
    setDraftType("short");
  };

  const updateAt = (i: number, patch: Partial<ScreeningQuestion>) => {
    onChange(value.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  };
  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <Field label="Screening questions" hint="Ask candidates a few quick questions when they apply.">
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wide font-semibold">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SCREENING_QUESTIONS.map((sq) => {
              const on = has(sq.q);
              return (
                <button
                  key={sq.q}
                  type="button"
                  onClick={() => addSuggested(sq)}
                  disabled={on}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    on
                      ? "border-transparent bg-gradient-cta text-primary-foreground opacity-70"
                      : "border-border bg-card text-heading hover:border-primary/50",
                  )}
                >
                  {on ? "✓ " : "+ "}
                  {sq.q}
                </button>
              );
            })}
          </div>
        </div>

        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((q, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center"
              >
                <input
                  className={cn(inputCls, "flex-1")}
                  value={q.q}
                  onChange={(e) => updateAt(i, { q: e.target.value })}
                  placeholder="Question"
                />
                <select
                  className={cn(inputCls, "sm:w-44")}
                  value={q.t}
                  onChange={(e) => updateAt(i, { t: e.target.value as ScreeningQuestionType })}
                >
                  {(Object.keys(SCREENING_TYPE_LABELS) as ScreeningQuestionType[]).map((k) => (
                    <option key={k} value={k}>
                      {SCREENING_TYPE_LABELS[k]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-muted-foreground hover:text-destructive rounded-md px-2 py-1 text-xs font-semibold"
                  aria-label="Remove question"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={cn(inputCls, "flex-1")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Write a custom question"
          />
          <select
            className={cn(inputCls, "sm:w-44")}
            value={draftType}
            onChange={(e) => setDraftType(e.target.value as ScreeningQuestionType)}
          >
            {(Object.keys(SCREENING_TYPE_LABELS) as ScreeningQuestionType[]).map((k) => (
              <option key={k} value={k}>
                {SCREENING_TYPE_LABELS[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCustom}
            disabled={!draft.trim()}
            className="rounded-[var(--radius-button)] border border-border bg-card px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Add question
          </button>
        </div>
      </div>
    </Field>
  );
}


function ReviewStep({
  form,
  profile,
  publishError,
  onRetry,
  onDismissError,
  retrying,
  hasSavedJob,
}: {
  form: Form;
  profile: EmployerProfile | null;
  publishError: string | null;
  onRetry: () => void;
  onDismissError: () => void;
  retrying: boolean;
  hasSavedJob: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Review & publish</h2>
      <p className="text-sm text-muted-foreground">
        Please review the details below. You can go back to edit any section.
      </p>
      {publishError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-[var(--radius-card)] border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-destructive">
              {hasSavedJob ? "Couldn't open your job listing" : "Publish failed"}
            </div>
            <div className="mt-1 text-muted-foreground break-words">{publishError}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-destructive/40 bg-card px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", retrying && "animate-spin")} />
                {retrying ? "Retrying…" : hasSavedJob ? "Open job listing" : "Try again"}
              </button>
              <button
                type="button"
                onClick={onDismissError}
                className="rounded-[var(--radius-button)] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-heading"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <LivePreview form={form} profile={profile} />
    </div>
  );
}

function LivePreview({ form, profile }: { form: Form; profile: EmployerProfile | null }) {
  const fmt = (n: string | number | null | undefined) => {
    if (n === null || n === undefined || n === "") return "";
    const num = typeof n === "number" ? n : Number(n);
    return Number.isFinite(num) ? num.toLocaleString("en-IN") : String(n);
  };
  const periodLabel = (() => {
    switch (form.salary_period) {
      case "hourly": return "/hr";
      case "daily": return "/day";
      case "yearly": return "/yr";
      case "monthly":
      default: return "/mo";
    }
  })();
  const salary = (() => {
    const min = form.salary_min;
    const max = form.salary_max;
    if (!min && !max) return "Salary not disclosed";
    if (min && max) return `₹${fmt(min)} – ₹${fmt(max)} ${periodLabel}`;
    if (min) return `₹${fmt(min)}+ ${periodLabel}`;
    return `Up to ₹${fmt(max)} ${periodLabel}`;
  })();
  const meta = parseRequirementsMeta(form.requirements);
  const cleanRequirements = stripRequirementsMeta(form.requirements);
  const reqLines = cleanRequirements
    .split("\n")
    .map((l) => l.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
  const hoursText = form.flexible_schedule
    ? "Flexible hours"
    : form.start_time && form.end_time
    ? `${form.start_time} – ${form.end_time}`
    : "";
  return (
    <article className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Live preview
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-heading text-lg font-bold">{form.title || "Your job title"}</h3>
          <p className="text-muted-foreground truncate text-sm">{profile?.business_name ?? "Your business"}</p>
        </div>
        {form.category && (
          <span className="bg-primary/10 text-heading shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            {form.category}
          </span>
        )}
      </div>
      <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
        <MapPin className="h-3.5 w-3.5" /> {form.area || "Area"}, {form.city || "City"}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {form.job_type && (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-heading">
            {form.job_type}
          </span>
        )}
        {form.experience_level && (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-heading">
            {form.experience_level}
          </span>
        )}
        {form.joining_availability && (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-heading">
            Joins: {form.joining_availability}
          </span>
        )}
        {hoursText && (
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-heading">
            {hoursText}
          </span>
        )}
      </div>

      {form.skills.length > 0 && (
        <div className="mt-3">
          <div className="text-muted-foreground mb-1 text-[10px] font-bold uppercase tracking-wider">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {form.skills.slice(0, 10).map((s) => (
              <span key={s} className="bg-muted text-heading rounded-full px-2 py-0.5 text-[11px] font-semibold">
                {s}
              </span>
            ))}
            {form.skills.length > 10 && (
              <span className="text-muted-foreground text-[11px] font-semibold">+{form.skills.length - 10} more</span>
            )}
          </div>
        </div>
      )}

      {form.benefits.length > 0 && (
        <div className="mt-3">
          <div className="text-muted-foreground mb-1 text-[10px] font-bold uppercase tracking-wider">Benefits</div>
          <ul className="grid grid-cols-1 gap-1">
            {form.benefits.slice(0, 8).map((b) => (
              <li key={b} className="text-heading flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="text-primary h-3.5 w-3.5 shrink-0" /> {b}
              </li>
            ))}
            {form.benefits.length > 8 && (
              <li className="text-muted-foreground text-[11px] font-semibold">+{form.benefits.length - 8} more</li>
            )}
          </ul>
        </div>
      )}

      {(reqLines.length > 0 || meta.certification || meta.languages.length > 0 || meta.portfolio) && (
        <div className="mt-3">
          <div className="text-muted-foreground mb-1 text-[10px] font-bold uppercase tracking-wider">Requirements</div>
          {reqLines.length > 0 && (
            <ul className="space-y-0.5">
              {reqLines.map((l, i) => (
                <li key={i} className="text-heading text-xs">• {l}</li>
              ))}
            </ul>
          )}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {meta.certification && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-heading">
                {meta.certification}
              </span>
            )}
            {meta.languages.map((l) => (
              <span key={l} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-heading">
                {l}
              </span>
            ))}
            {meta.portfolio && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-heading">
                {meta.portfolio}
              </span>
            )}
          </div>
        </div>
      )}

      {form.description && (
        <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{form.description}</p>
      )}

      <div className="border-border mt-4 flex items-end justify-between border-t pt-3">
        <div className="min-w-0">
          <div className="text-heading flex items-center gap-1 text-sm font-black">
            <IndianRupee className="h-3.5 w-3.5" />
            <span className="truncate">{salary.replace(/^₹/, "")}</span>
          </div>
          {(form.openings ?? 0) > 0 && (
            <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
              {form.openings} opening{(form.openings ?? 0) > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <span className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-4 py-2 text-xs font-bold">
          <Briefcase className="h-3.5 w-3.5" /> Apply
        </span>
      </div>
    </article>
  );
}

function JobPublishedSuccess({
  job,
  profile,
  onPostAnother,
}: {
  job: JobRow;
  profile: EmployerProfile | null;
  onPostAnother: () => void;
}) {
  const salaryText = (() => {
    const min = job.salary_min;
    const max = job.salary_max;
    if (!min && !max) return "Not disclosed";
    const period =
      job.salary_period === "hourly" ? "/hr" : job.salary_period === "yearly" ? "/yr" : "/mo";
    if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()} ${period}`;
    return `₹${(min ?? max)!.toLocaleString()} ${period}`;
  })();
  const locationText = [job.area, job.city].filter(Boolean).join(", ") || job.city;
  const postedDate = new Date(job.published_at ?? job.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-card)] border border-primary/30 bg-card p-6 shadow-[var(--shadow-card)] md:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-heading text-2xl font-extrabold">
            Your job post has been published successfully.
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Candidates can now discover and apply to your listing.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Job title
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-lg font-bold text-heading">
            <Briefcase className="h-4 w-4 text-primary" aria-hidden />
            <span className="truncate">{job.title}</span>
          </dd>
          {profile?.business_name && (
            <div className="mt-1 text-xs text-muted-foreground">at {profile.business_name}</div>
          )}
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Location
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-heading">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            {locationText}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Salary
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-heading">
            <IndianRupee className="h-4 w-4 text-primary" aria-hidden />
            {salaryText}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </dt>
          <dd className="mt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Published
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Posted
          </dt>
          <dd className="mt-1 text-sm font-semibold text-heading">{postedDate}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/owner/jobs"
          className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]"
        >
          View My Job Posts
        </Link>
        <button
          type="button"
          onClick={onPostAnother}
          className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-heading hover:bg-muted"
        >
          Post Another Job
        </button>
        <Link
          to="/jobs/$jobId"
          params={{ jobId: job.id }}
          className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-heading hover:bg-muted"
        >
          View Applications
        </Link>
      </div>
    </div>
  );
}
