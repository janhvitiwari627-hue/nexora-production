export type JobType = "Full-time" | "Part-time" | "Contract" | "Freelance";
export type JobCategory =
  | "Stylist"
  | "Barber"
  | "Beautician"
  | "Spa Therapist"
  | "Nail Artist"
  | "Manager"
  | "Receptionist";

export interface Job {
  id: string;
  title: string;
  business: string;
  city: string;
  area: string;
  category: JobCategory;
  type: JobType;
  salary: string;
  experience: string;
  postedDays: number;
  applicants: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  saved?: boolean;
}

export const MOCK_JOBS: Job[] = Array.from({ length: 12 }).map((_, i) => {
  const cats: JobCategory[] = [
    "Stylist",
    "Barber",
    "Beautician",
    "Spa Therapist",
    "Nail Artist",
    "Manager",
    "Receptionist",
  ];
  const cat = cats[i % cats.length];
  const types: JobType[] = ["Full-time", "Part-time", "Contract", "Freelance"];
  return {
    id: `job-${i + 1}`,
    title: `${cat} (${i % 2 === 0 ? "Senior" : "Junior"})`,
    business: ["Luxe Hair & Spa", "Urban Cuts", "Bloom Beauty", "Serene Spa"][i % 4],
    city: ["Mumbai", "Delhi", "Bangalore", "Pune"][i % 4],
    area: ["Bandra West", "South Ex", "Indiranagar", "Koregaon Park"][i % 4],
    category: cat,
    type: types[i % types.length],
    salary: `₹${20 + i * 2}k – ₹${40 + i * 3}k / month`,
    experience: `${1 + (i % 5)}–${3 + (i % 5)} yrs`,
    postedDays: (i % 7) + 1,
    applicants: 4 + i * 3,
    description:
      "We're looking for passionate professionals to join our growing team in a fast-paced, premium salon environment.",
    responsibilities: [
      "Deliver excellent client service",
      "Maintain hygiene & safety standards",
      "Drive upsells & retention",
    ],
    requirements: ["Relevant certification", "Customer-first mindset", "Team player"],
    benefits: ["Health insurance", "Performance bonus", "Paid training", "Staff discounts"],
  };
});

export interface Applicant {
  id: string;
  name: string;
  city: string;
  experience: string;
  stage: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected";
  rating: number;
  avatarSeed: string;
}

export const MOCK_APPLICANTS: Applicant[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `app-${i + 1}`,
  name:
    ["Aarav M.", "Priya S.", "Rohan I.", "Sneha R.", "Kabir D.", "Anaya P."][i % 6] + ` ${i + 1}`,
  city: ["Mumbai", "Delhi", "Bangalore"][i % 3],
  experience: `${1 + (i % 6)} yrs`,
  stage: (["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"] as const)[i % 6],
  rating: 3 + (i % 3),
  avatarSeed: `a${i}`,
}));
