import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, Briefcase, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { MOCK_JOBS, type JobCategory, type JobType, type Job } from "./mockJobs";
import { listPublishedJobs, type JobRow } from "@/lib/jobs";

const CATEGORIES: JobCategory[] = ["Stylist", "Barber", "Beautician", "Spa Therapist", "Nail Artist", "Manager", "Receptionist"];
const TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Freelance"];

type UnifiedJob = Job & { isReal: boolean };

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
  const match = CATEGORIES.find((x) => x.toLowerCase() === c.toLowerCase());
  return match ?? "Stylist";
}
function normalizeType(t: string): JobType {
  const match = TYPES.find((x) => x.toLowerCase() === t.toLowerCase());
  return match ?? "Full-time";
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
    experience: j.experience_level ?? "Any",
    postedDays: daysSince(j.published_at),
    applicants: j.applicants_count ?? 0,
    description: j.description,
    responsibilities: [],
    requirements: j.requirements ? [j.requirements] : [],
    benefits: j.benefits ?? [],
    isReal: true,
  };
}

export function JobSearchPage() {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState<JobCategory | "all">("all");
  const [types, setTypes] = useState<JobType[]>([]);
  const [sort, setSort] = useState<"recent" | "salary" | "applicants">("recent");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [realJobs, setRealJobs] = useState<UnifiedJob[]>([]);
  const [loading, setLoading] = useState(true);

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

  const allJobs = useMemo<UnifiedJob[]>(
    () => [...realJobs, ...MOCK_JOBS.map((m) => ({ ...m, isReal: false }))],
    [realJobs],
  );

  const filtered = useMemo(() => {
    let r = allJobs.filter(j =>
      (!q || j.title.toLowerCase().includes(q.toLowerCase()) || j.business.toLowerCase().includes(q.toLowerCase())) &&
      (!loc || j.city.toLowerCase().includes(loc.toLowerCase()) || j.area.toLowerCase().includes(loc.toLowerCase())) &&
      (cat === "all" || j.category === cat) &&
      (types.length === 0 || types.includes(j.type))
    );
    if (sort === "recent") r = [...r].sort((a, b) => a.postedDays - b.postedDays);
    if (sort === "applicants") r = [...r].sort((a, b) => b.applicants - a.applicants);
    return r;
  }, [allJobs, q, loc, cat, types, sort]);

  return (
    <>
      <PublicPageHeader />
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-3">
          <BackButton />
          <h1 className="text-heading text-3xl font-bold">Find Your Next Job</h1>
          <p className="text-muted-foreground">Discover opportunities at top salons, spas & studios</p>
        </header>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_auto]">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Job title, skills, or company" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="relative">
              <MapPin className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input className="pl-9" placeholder="City or area" value={loc} onChange={e => setLoc(e.target.value)} />
            </div>
            <Button>Search</Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={cat === "all" ? "default" : "outline"} onClick={() => setCat("all")}>All</Button>
          {CATEGORIES.map(c => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>{c}</Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> Filters</div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Job Type</Label>
                  {TYPES.map(t => (
                    <div key={t} className="flex items-center gap-2">
                      <Checkbox id={t} checked={types.includes(t)} onCheckedChange={v => setTypes(p => v ? [...p, t] : p.filter(x => x !== t))} />
                      <Label htmlFor={t} className="cursor-pointer text-sm">{t}</Label>
                    </div>
                  ))}
                </div>
                {(q || loc || cat !== "all" || types.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      setQ("");
                      setLoc("");
                      setCat("all");
                      setTypes([]);
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
              <Select value={sort} onValueChange={v => setSort(v as typeof sort)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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
              {filtered.map(j => (
                <Card key={j.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="text-lg font-semibold hover:underline">{j.title}</Link>
                        <p className="text-sm text-muted-foreground">{j.business}</p>
                      </div>
                      <Button size="icon" variant="ghost" aria-label="Save" onClick={() => setSaved(p => { const n = new Set(p); if (n.has(j.id)) n.delete(j.id); else n.add(j.id); return n; })}>
                        <Bookmark className={`h-4 w-4 ${saved.has(j.id) ? "fill-primary text-primary" : ""}`} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary"><Briefcase className="mr-1 h-3 w-3" />{j.type}</Badge>
                      <Badge variant="outline"><MapPin className="mr-1 h-3 w-3" />{j.area ? `${j.area}, ` : ""}{j.city}</Badge>
                      <Badge variant="outline">{j.experience}</Badge>
                      {j.isReal && <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">New</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{j.salary}</span>
                      <span className="text-muted-foreground inline-flex items-center gap-1"><Users className="h-3 w-3" /> {j.applicants}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-muted-foreground text-xs">Posted {j.postedDays}d ago</div>
                      <Button asChild size="sm">
                        <Link to="/jobs/$jobId" params={{ jobId: j.id }}>View & Apply</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
