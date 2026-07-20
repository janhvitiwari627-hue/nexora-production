import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/shared/BackButton";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { Modal } from "@/components/shared/Modal";
import { MOCK_JOBS, type JobCategory, type JobType, type Job } from "./mockJobs";
import { applyToJob, isRealJobId, listPublishedJobs, type JobRow } from "@/lib/jobs";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES: JobCategory[] = [
  "Stylist",
  "Barber",
  "Beautician",
  "Spa Therapist",
  "Nail Artist",
  "Manager",
  "Receptionist",
];
const TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Freelance"];
const EXPERIENCE_LEVELS = ["Any", "Fresher", "1-3 years", "3-5 years", "5+ years"] as const;
type ExpLevel = (typeof EXPERIENCE_LEVELS)[number];

type UnifiedJob = Job & { isReal: boolean; salaryMin: number; salaryMax: number };

function fmtSalary(min: number | null, max: number | null, period: string | null) {
  if (!min && !max) return "Salary not disclosed";
  const p = period === "hourly" ? "/hr" : period === "yearly" ? "/yr" : "/mo";
  const f = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);
  if (min && max) return `₹${f(min)}–${f(max)}${p}`;
  return `₹${f((min || max) as number)}${p}`;
}
function daysSince(iso: string | null) {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
function normalizeCategory(c: string): JobCategory {
  return CATEGORIES.find((x) => x.toLowerCase() === c.toLowerCase()) ?? "Stylist";
}
function normalizeType(t: string): JobType {
  return TYPES.find((x) => x.toLowerCase() === t.toLowerCase()) ?? "Full-time";
}
// Extract a numeric monthly-salary midpoint from a raw job for filtering/sort.
function parseSalaryFromMock(text: string): { min: number; max: number } {
  const nums = Array.from(text.matchAll(/(\d+)/g)).map((m) => Number(m[1]));
  if (nums.length >= 2) return { min: nums[0] * 1000, max: nums[1] * 1000 };
  if (nums.length === 1) return { min: nums[0] * 1000, max: nums[0] * 1000 };
  return { min: 0, max: 0 };
}
function parseExperience(text: string): number {
  const nums = Array.from(text.matchAll(/(\d+)/g)).map((m) => Number(m[1]));
  return nums[0] ?? 0;
}
function fromReal(j: JobRow & { employer?: { business_name: string } | null }): UnifiedJob {
  return {
    id: j.id,
    title: j.title,
    business: j.employer?.business_name ?? "Nexora Partner",
    city: j.city,
    area: j.area ?? "",
    category: normalizeCategory(j.category),
    type: normalizeType(j.job_type),
    salary: fmtSalary(j.salary_min, j.salary_max, j.salary_period),
    experience: j.experience_level === "flexible" ? "Flexible" : (j.experience_level ?? "Any"),
    postedDays: daysSince(j.published_at),
    applicants: j.applicants_count ?? 0,
    description: j.description,
    responsibilities: [],
    requirements: j.requirements ? [j.requirements] : [],
    benefits: j.benefits ?? [],
    isReal: true,
    salaryMin: j.salary_min ?? 0,
    salaryMax: j.salary_max ?? j.salary_min ?? 0,
  };
}

export function JobSearchPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState<JobCategory | "all">("all");
  const [types, setTypes] = useState<JobType[]>([]);
  const [minSalary, setMinSalary] = useState<number>(0);
  const [exp, setExp] = useState<ExpLevel>("Any");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [latestOnly, setLatestOnly] = useState(false);
  const [sort, setSort] = useState<"recent" | "salary" | "applicants">("recent");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [realJobs, setRealJobs] = useState<UnifiedJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Applied job IDs (real jobs only, from DB) + demo applies (local session)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [candidateSubmitted, setCandidateSubmitted] = useState<boolean | null>(null);

  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ job: UnifiedJob; appliedAt: string } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await listPublishedJobs(100);
        if (!alive) return;
        setRealJobs(rows.map((r) => fromReal(r as never)));
      } catch (e) {
        console.warn("[jobs/search] failed to load jobs", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load applied job IDs + candidate profile completion for the current user.
  useEffect(() => {
    if (!user) {
      setAppliedIds(new Set());
      setCandidateSubmitted(null);
      return;
    }
    let alive = true;
    (async () => {
      const [apps, cand] = await Promise.all([
        (
          supabase as never as {
            from: (n: string) => {
              select: (c: string) => {
                eq: (
                  c: string,
                  v: string,
                ) => {
                  neq: (c: string, v: string) => Promise<{ data: { job_id: string }[] | null }>;
                };
              };
            };
          }
        )
          .from("job_applications")
          .select("job_id")
          .eq("applicant_id", user.id)
          .neq("status", "withdrawn"),
        (
          supabase as never as {
            from: (n: string) => {
              select: (c: string) => {
                eq: (
                  c: string,
                  v: string,
                ) => {
                  maybeSingle: () => Promise<{ data: { is_submitted: boolean } | null }>;
                };
              };
            };
          }
        )
          .from("candidate_profiles")
          .select("is_submitted")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (!alive) return;
      setAppliedIds(new Set((apps.data ?? []).map((r) => r.job_id)));
      setCandidateSubmitted(!!cand.data?.is_submitted);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const allJobs = useMemo<UnifiedJob[]>(() => {
    const mocks: UnifiedJob[] = MOCK_JOBS.map((m) => {
      const s = parseSalaryFromMock(m.salary);
      return { ...m, isReal: false, salaryMin: s.min, salaryMax: s.max };
    });
    return [...realJobs, ...mocks];
  }, [realJobs]);

  const filtered = useMemo(() => {
    const myCity = (profile?.city ?? "").toLowerCase();
    let r = allJobs.filter((j) => {
      if (
        q &&
        !(
          j.title.toLowerCase().includes(q.toLowerCase()) ||
          j.business.toLowerCase().includes(q.toLowerCase())
        )
      )
        return false;
      if (
        loc &&
        !(
          j.city.toLowerCase().includes(loc.toLowerCase()) ||
          j.area.toLowerCase().includes(loc.toLowerCase())
        )
      )
        return false;
      if (cat !== "all" && j.category !== cat) return false;
      if (types.length > 0 && !types.includes(j.type)) return false;
      if (minSalary > 0 && j.salaryMax < minSalary) return false;
      if (exp !== "Any") {
        const yrs = parseExperience(j.experience);
        if (exp === "Fresher" && yrs > 1) return false;
        if (exp === "1-3 years" && (yrs < 1 || yrs > 3)) return false;
        if (exp === "3-5 years" && (yrs < 3 || yrs > 5)) return false;
        if (exp === "5+ years" && yrs < 5) return false;
      }
      if (nearbyOnly) {
        if (!myCity || !j.city.toLowerCase().includes(myCity)) return false;
      }
      if (latestOnly && j.postedDays > 7) return false;
      return true;
    });
    if (sort === "recent") r = [...r].sort((a, b) => a.postedDays - b.postedDays);
    if (sort === "salary") r = [...r].sort((a, b) => b.salaryMax - a.salaryMax);
    if (sort === "applicants") r = [...r].sort((a, b) => b.applicants - a.applicants);
    return r;
  }, [allJobs, q, loc, cat, types, minSalary, exp, nearbyOnly, latestOnly, sort, profile?.city]);

  const isApplied = (id: string) => appliedIds.has(id);

  async function handleApply(j: UnifiedJob) {
    // Not logged in → login
    if (!user) {
      try {
        sessionStorage.setItem("nexora:postLoginRedirect", "/jobs/search");
      } catch {
        // ignore
      }
      navigate({ to: "/login", search: { redirect: "/jobs/search" } as never });
      return;
    }
    // Profile incomplete → /jobs/profile
    if (candidateSubmitted === false) {
      toast.info("Please complete your candidate profile before applying.");
      navigate({ to: "/jobs/profile" });
      return;
    }
    // Already applied
    if (isApplied(j.id)) return;

    setApplyingId(j.id);
    try {
      if (isRealJobId(j.id)) {
        await applyToJob({ jobId: j.id, applicantId: user.id, coverNote: null });
      } else {
        // Demo listing — record locally so the UI reflects it.
        await new Promise((res) => setTimeout(res, 300));
      }
      const nextApplied = new Set(appliedIds);
      nextApplied.add(j.id);
      setAppliedIds(nextApplied);
      setSuccess({ job: j, appliedAt: new Date().toISOString() });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not submit application";
      if (/duplicate|unique|already/i.test(msg)) {
        setAppliedIds((prev) => new Set(prev).add(j.id));
        toast.info("You've already applied for this job.");
      } else {
        toast.error(msg);
      }
    } finally {
      setApplyingId(null);
    }
  }

  const hasActiveFilters =
    !!q ||
    !!loc ||
    cat !== "all" ||
    types.length > 0 ||
    minSalary > 0 ||
    exp !== "Any" ||
    nearbyOnly ||
    latestOnly;

  return (
    <>
      <PublicPageHeader />
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-3">
          <BackButton />
          <h1 className="text-heading text-3xl font-bold">Find Your Next Job</h1>
          <p className="text-muted-foreground">
            Discover opportunities at top salons, spas & studios
          </p>
        </header>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_auto]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder="Job title, skills, or company"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder="City or area"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
              />
            </div>
            <Button>Search</Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={cat === "all" ? "default" : "outline"}
            onClick={() => setCat("all")}
          >
            All
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={cat === c ? "default" : "outline"}
              onClick={() => setCat(c)}
            >
              {c}
            </Button>
          ))}
          <Button
            size="sm"
            variant={nearbyOnly ? "default" : "outline"}
            onClick={() => setNearbyOnly((v) => !v)}
            disabled={!profile?.city}
            title={!profile?.city ? "Add your city in your profile to use Nearby" : undefined}
          >
            <MapPin className="mr-1 h-3.5 w-3.5" /> Nearby
          </Button>
          <Button
            size="sm"
            variant={latestOnly ? "default" : "outline"}
            onClick={() => setLatestOnly((v) => !v)}
          >
            <Clock className="mr-1 h-3.5 w-3.5" /> Latest
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card>
              <CardContent className="space-y-5 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Job Type
                  </Label>
                  {TYPES.map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Checkbox
                        id={t}
                        checked={types.includes(t)}
                        onCheckedChange={(v) =>
                          setTypes((p) => (v ? [...p, t] : p.filter((x) => x !== t)))
                        }
                      />
                      <Label htmlFor={t} className="cursor-pointer text-sm">
                        {t}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Min. Salary
                    </Label>
                    <span className="text-xs font-semibold">
                      {minSalary > 0 ? `₹${Math.round(minSalary / 1000)}k/mo` : "Any"}
                    </span>
                  </div>
                  <Slider
                    value={[minSalary]}
                    onValueChange={(v) => setMinSalary(v[0] ?? 0)}
                    min={0}
                    max={100000}
                    step={5000}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Experience
                  </Label>
                  <Select value={exp} onValueChange={(v) => setExp(v as ExpLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setQ("");
                      setLoc("");
                      setCat("all");
                      setTypes([]);
                      setMinSalary(0);
                      setExp("Any");
                      setNearbyOnly(false);
                      setLatestOnly(false);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {loading ? "Loading jobs…" : `${filtered.length} jobs found`}
              </p>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary">Salary (High)</SelectItem>
                  <SelectItem value="applicants">Most Applicants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!loading && filtered.length === 0 && (
              <Card>
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground text-sm">No jobs match your filters.</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((j) => {
                const applied = isApplied(j.id);
                const busy = applyingId === j.id;
                return (
                  <Card key={j.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to="/jobs/$jobId"
                            params={{ jobId: j.id }}
                            className="text-lg font-semibold hover:underline"
                          >
                            {j.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">{j.business}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Save"
                          onClick={() =>
                            setSaved((p) => {
                              const n = new Set(p);
                              if (n.has(j.id)) n.delete(j.id);
                              else n.add(j.id);
                              return n;
                            })
                          }
                        >
                          <Bookmark
                            className={`h-4 w-4 ${saved.has(j.id) ? "fill-primary text-primary" : ""}`}
                          />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">
                          <Briefcase className="mr-1 h-3 w-3" />
                          {j.type}
                        </Badge>
                        <Badge variant="outline">
                          <MapPin className="mr-1 h-3 w-3" />
                          {j.area ? `${j.area}, ` : ""}
                          {j.city}
                        </Badge>
                        <Badge variant="outline">{j.experience}</Badge>
                        {j.isReal && (
                          <Badge
                            className="bg-primary/10 text-primary border-primary/20"
                            variant="outline"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1 font-semibold text-primary">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {j.salary}
                        </span>
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Users className="h-3 w-3" /> {j.applicants}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3" /> Posted {j.postedDays}d ago
                        </div>
                        {applied ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Already Applied
                            </Badge>
                            <Button asChild size="sm" variant="outline">
                              <Link to="/jobs/applications">View Application</Link>
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => handleApply(j)} disabled={busy}>
                            {busy ? "Applying…" : "Apply Now"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!success} onClose={() => setSuccess(null)} size="sm">
        {success && (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="bg-primary/10 grid h-16 w-16 place-items-center rounded-full">
              <CheckCircle2 className="text-primary h-9 w-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-heading text-xl font-bold">
                Application submitted successfully.
              </h3>
            </div>
            <div className="w-full space-y-1 rounded-lg bg-muted/40 p-3 text-left text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Job</span>
                <span className="font-medium">{success.job.title}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Salon</span>
                <span className="font-medium">{success.job.business}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Applied</span>
                <span className="font-medium">
                  {new Date(success.appliedAt).toLocaleString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-blue-100 text-blue-800">Applied</Badge>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link to="/jobs/applications">View My Applications</Link>
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setSuccess(null)}>
                Continue Searching
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
