import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, GraduationCap, MapPin, Search, Sparkles, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/shared/BackButton";
import { useAuthStore } from "@/stores/authStore";
import { getMyEmployerProfile, listPublishedJobs, type JobRow } from "@/lib/jobs";
import { EmployerSetupModal } from "@/pages/jobs/EmployerSetupModal";

const JOBS = [
  {
    id: "j1",
    title: "Senior Hair Stylist",
    salon: "Looks Unisex Salon",
    area: "Malviya Nagar",
    city: "Jaipur",
    salary: "₹35k–55k",
    type: "Full-time",
    featured: true,
    posted: "2d ago",
    tags: ["Balayage", "Bridal"],
  },
  {
    id: "j2",
    title: "Beauty Therapist",
    salon: "Bliss Spa",
    area: "C-Scheme",
    city: "Jaipur",
    salary: "₹28k–40k",
    type: "Full-time",
    featured: true,
    posted: "3d ago",
    tags: ["Facial", "Threading"],
  },
  {
    id: "j3",
    title: "Master Barber",
    salon: "The Barber Co.",
    area: "Vaishali Nagar",
    city: "Jaipur",
    salary: "₹40k–60k",
    type: "Full-time",
    featured: false,
    posted: "5d ago",
    tags: ["Fade", "Beard"],
  },
  {
    id: "j4",
    title: "Nail Technician",
    salon: "Nail Boutique",
    area: "Raja Park",
    city: "Jaipur",
    salary: "₹22k–32k",
    type: "Part-time",
    featured: false,
    posted: "1w ago",
    tags: ["Gel", "Art"],
  },
  {
    id: "j5",
    title: "Spa Therapist",
    salon: "Studio Noir",
    area: "Mansarovar",
    city: "Jaipur",
    salary: "₹30k–45k",
    type: "Full-time",
    featured: false,
    posted: "1w ago",
    tags: ["Aromatherapy"],
  },
  {
    id: "j6",
    title: "Bridal Makeup Artist",
    salon: "Bridal by Aanya",
    area: "C-Scheme",
    city: "Jaipur",
    salary: "Per project",
    type: "Freelance",
    featured: true,
    posted: "Today",
    tags: ["HD", "Airbrush"],
  },
];

const TYPES = ["All types", "Full-time", "Part-time", "Freelance"];

type JobCardData = {
  id: string;
  title: string;
  salon: string;
  area: string;
  city: string;
  salary: string;
  type: string;
  featured: boolean;
  posted: string;
  tags: string[];
  href?: string;
};

function fmtSalary(min: number | null, max: number | null, period: string | null): string {
  if (!min && !max) return "Salary not disclosed";
  const p = period === "hourly" ? "/hr" : period === "yearly" ? "/yr" : "/mo";
  const f = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);
  if (min && max) return `₹${f(min)}–${f(max)}${p}`;
  return `₹${f((min || max) as number)}${p}`;
}

function relTime(iso: string | null): string {
  if (!iso) return "recently";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function toCardData(j: JobRow): JobCardData {
  return {
    id: j.id,
    title: j.title,
    salon: j.employer?.business_name ?? "Nexora Partner",
    area: j.area ?? "",
    city: j.city,
    salary: fmtSalary(j.salary_min, j.salary_max, j.salary_period),
    type: j.job_type,
    featured: false,
    posted: relTime(j.published_at),
    tags: j.skills ?? [],
    href: `/jobs/${j.id}`,
  };
}

export function JobPortalPage({ initialRole = "seeker" }: { initialRole?: "seeker" | "employer" }) {
  const [role, setRole] = useState<"seeker" | "employer">(initialRole);
  const [q, setQ] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [remoteJobs, setRemoteJobs] = useState<JobCardData[]>([]);
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const { user, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    listPublishedJobs(50)
      .then((rows) => setRemoteJobs(rows.map(toCardData)))
      .catch(() => setRemoteJobs([]));
  }, []);

  const allJobs: JobCardData[] = useMemo(() => {
    if (remoteJobs.length === 0) return JOBS as JobCardData[];
    return [...remoteJobs, ...(JOBS as JobCardData[])];
  }, [remoteJobs]);

  const filtered = allJobs.filter(
    (j) =>
      (type === "All types" || j.type === type) &&
      (q === "" ||
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        j.salon.toLowerCase().includes(q.toLowerCase())),
  );
  const featured = allJobs.filter((j) => j.featured).slice(0, 6);
  const featuredForDisplay = featured.length > 0 ? featured : allJobs.slice(0, 6);

  async function handlePostJob() {
    if (!isInitialized) return;
    if (!user) {
      try {
        sessionStorage.setItem("nexora:postLoginRedirect", "/hire/post-job");
      } catch {
        // ignore
      }
      navigate({ to: "/login", search: { redirect: "/hire/post-job" } as never });
      return;
    }
    const profile = await getMyEmployerProfile(user.id).catch(() => null);
    if (profile) {
      navigate({ to: "/hire/post-job" });
    } else {
      setShowEmployerModal(true);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" aria-label="Go back" />
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold tracking-tight">
              Nexora
            </span>
          </Link>
        </div>
      </div>

      <section className="from-primary/10 to-accent/10 border-border border-b bg-gradient-to-br py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="bg-card border-border mx-auto mb-6 inline-flex rounded-full border p-1">
            <Link
              to="/jobs"
              className={cn(
                "rounded-full px-5 py-2 text-sm font-bold transition",
                role === "seeker" ? "bg-gradient-cta text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Find a job
            </Link>
            <Link
              to="/hire"
              className={cn(
                "rounded-full px-5 py-2 text-sm font-bold transition",
                role === "employer" ? "bg-gradient-cta text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Hire talent
            </Link>
          </div>
          <h1
            className="text-heading text-center text-4xl font-black tracking-tight md:text-6xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {role === "seeker" ? "Find your next role" : "Hire the best in beauty"}
          </h1>
          <p className="text-muted-foreground mt-3 text-center text-base md:text-lg">
            {role === "seeker"
              ? "1,200+ salon jobs across India. Get hired in days."
              : "Post a role and meet 50,000+ verified stylists & therapists."}
          </p>

          {role === "seeker" ? (
            <div className="border-border bg-card mx-auto mt-8 flex max-w-3xl flex-wrap items-center gap-2 rounded-[var(--radius-card)] border p-3 shadow-[var(--shadow-card)]">
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="text-muted-foreground h-4 w-4" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Job title, salon or skill"
                  className="placeholder:text-muted-foreground w-full bg-transparent py-2 text-sm outline-none"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-muted rounded-[var(--radius-button)] px-3 py-2 text-sm font-semibold"
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]">
                Search
              </button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <button
                onClick={handlePostJob}
                className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-[var(--shadow-glow)]"
              >
                Post a job free
              </button>
              {!user && isInitialized && (
                <p className="text-muted-foreground mt-3 text-xs">
                  Create an employer account to post your beauty job for free.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <EmployerSetupModal
        open={showEmployerModal}
        onClose={() => setShowEmployerModal(false)}
      />

      {/* Featured carousel */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h2 className="text-heading mb-4 inline-flex items-center gap-2 text-xl font-bold">
          <TrendingUp className="text-warning h-5 w-5" /> Featured jobs
        </h2>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {featuredForDisplay.map((j) => (
            <JobCard key={j.id} job={j} compact />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <h2 className="text-heading mb-4 text-xl font-bold">All openings ({filtered.length})</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 md:px-6">
          <GraduationCap className="h-16 w-16 shrink-0" />
          <div className="flex-1">
            <h3 className="text-2xl font-black md:text-3xl">Upskill at Nexora Academy</h3>
            <p className="mt-2 text-white/80">
              Industry-recognised certifications in hair, skin, makeup and spa — boost your earning
              potential 2x.
            </p>
          </div>
          <Link
            to="/academy"
            className="bg-card text-heading rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-xl"
          >
            Explore courses
          </Link>
        </div>
      </section>
    </div>
  );
}

function JobCard({ job, compact }: { job: JobCardData; compact?: boolean }) {
  return (
    <article
      className={cn(
        "border-border bg-card hover:border-primary/40 hover:shadow-[var(--shadow-card)] flex flex-col rounded-[var(--radius-card)] border p-5 transition",
        compact ? "min-w-[300px] snap-start" : "",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-heading text-base font-bold">{job.title}</h3>
          <p className="text-muted-foreground text-sm">{job.salon}</p>
        </div>
        {job.featured && (
          <span className="bg-warning/15 text-heading rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            <Star className="inline h-3 w-3 fill-warning text-warning" /> Featured
          </span>
        )}
      </div>
      <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
        <MapPin className="h-3.5 w-3.5" /> {job.area}, {job.city}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.tags.map((t) => (
          <span
            key={t}
            className="bg-muted text-heading rounded-full px-2 py-0.5 text-[11px] font-semibold"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="border-border mt-4 flex items-end justify-between border-t pt-3">
        <div>
          <div className="text-heading text-sm font-black">{job.salary}</div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
            {job.type} · {job.posted}
          </div>
        </div>
        <Link
          to={job.href ?? "/jobs"}
          className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-4 py-2 text-xs font-bold"
        >
          <Briefcase className="h-3.5 w-3.5" /> Apply
        </Link>
      </div>
    </article>
  );
}
