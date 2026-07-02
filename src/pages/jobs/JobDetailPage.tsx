import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bookmark,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Share2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_JOBS } from "./mockJobs";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { Modal } from "@/components/shared/Modal";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { applyToJob, isRealJobId, type JobRow } from "@/lib/jobs";

type DetailView = {
  id: string;
  title: string;
  business: string;
  area: string;
  city: string;
  type: string;
  postedDays: number;
  applicants: number;
  salary: string;
  experience: string;
  category: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  isReal: boolean;
};

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

function fromRealJob(j: JobRow & { employer?: { business_name: string } | null }): DetailView {
  return {
    id: j.id,
    title: j.title,
    business: j.employer?.business_name ?? "Nexora Partner",
    area: j.area ?? "",
    city: j.city,
    type: j.job_type,
    postedDays: daysSince(j.published_at),
    applicants: j.applicants_count ?? 0,
    salary: fmtSalary(j.salary_min, j.salary_max, j.salary_period),
    experience: j.experience_level ?? "Not specified",
    category: j.category,
    description: j.description,
    responsibilities: [],
    requirements: j.requirements ? [j.requirements] : [],
    benefits: j.benefits ?? [],
    isReal: true,
  };
}

export function JobDetailPage({ jobId }: { jobId: string }) {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [job, setJob] = useState<DetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMode, setSuccessMode] = useState<"real" | "demo">("real");
  const [applyOpen, setApplyOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [application, setApplication] = useState<{
    id: string;
    cover_note: string | null;
    status: string;
    created_at: string;
  } | null>(null);
  const alreadyApplied = Boolean(application);
  const [checkingApplied, setCheckingApplied] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; phone?: string }>({});

  useEffect(() => {
    let alive = true;
    async function run() {
      if (isRealJobId(jobId)) {
        const { data, error } = await supabase
          .from("jobs")
          .select("*, employer:employer_profiles(*)")
          .eq("id", jobId)
          .maybeSingle();
        if (!alive) return;
        if (!error && data) {
          setJob(fromRealJob(data as never));
          setLoading(false);
          return;
        }
      }
      const mock = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];
      if (!alive) return;
      setJob({ ...mock, isReal: false });
      setLoading(false);
    }
    run();
    return () => {
      alive = false;
    };
  }, [jobId]);

  // Check whether current user has already applied for this real job.
  useEffect(() => {
    let alive = true;
    async function check() {
      if (!user || !isRealJobId(jobId)) {
        setApplication(null);
        return;
      }
      setCheckingApplied(true);
      const { data } = await (supabase as never as { from: (n: string) => { select: (c: string) => { eq: (c: string, v: string) => { eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { id: string; cover_note: string | null; status: string; created_at: string } | null }> } } } } })
        .from("job_applications")
        .select("id, cover_note, status, created_at")
        .eq("job_id", jobId)
        .eq("applicant_id", user.id)
        .maybeSingle();
      if (!alive) return;
      setApplication(data ?? null);
      setCheckingApplied(false);
    }
    check();
    return () => {
      alive = false;
    };
  }, [user, jobId]);

  function openApply() {
    if (!job) return;
    if (!user) {
      try {
        sessionStorage.setItem("nexora:postLoginRedirect", `/jobs/${jobId}`);
      } catch {
        // ignore
      }
      navigate({ to: "/login", search: { redirect: `/jobs/${jobId}` } as never });
      return;
    }
    if (alreadyApplied) return;
    setFullName(profile?.full_name ?? user.user_metadata?.full_name ?? "");
    setEmail(profile?.email ?? user.email ?? "");
    setPhone(profile?.mobile ?? user.user_metadata?.mobile ?? "");
    setCoverNote("");
    setErrors({});
    setApplyOpen(true);
  }

  function validate() {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email";
    if (!/^[0-9+()\-\s]{7,15}$/.test(phone.trim())) next.phone = "Enter a valid phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmitApply(e: React.FormEvent) {
    e.preventDefault();
    if (applying || !job || !user) return;
    if (!validate()) return;

    const payloadJobId = jobId;
    const notePieces = [
      `Name: ${fullName.trim()}`,
      `Email: ${email.trim()}`,
      `Phone: ${phone.trim()}`,
    ];
    if (coverNote.trim()) notePieces.push("", coverNote.trim());
    const note = notePieces.join("\n");

    if (!isRealJobId(payloadJobId)) {
      console.info("[apply] demo submission payload:", { jobId: payloadJobId, coverNote: note });
      toast.success("Application submitted (demo)");
      setApplyOpen(false);
      setApplication({
        id: `demo-${payloadJobId}`,
        cover_note: note,
        status: "submitted",
        created_at: new Date().toISOString(),
      });
      setSuccessMode("demo");
      setSuccessOpen(true);
      return;
    }

    setApplying(true);
    try {
      const app = await applyToJob({
        jobId: payloadJobId,
        applicantId: user.id,
        coverNote: note,
      });
      if (app.job_id !== payloadJobId) {
        throw new Error(`Server recorded jobId ${app.job_id}, expected ${payloadJobId}`);
      }
      toast.success("Application submitted successfully.");
      setApplyOpen(false);
      setAlreadyApplied(true);
      setSuccessMode("real");
      setSuccessOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit application";
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  }

  if (loading || !job) {
    return (
      <>
        <PublicPageHeader />
        <div className="mx-auto max-w-5xl p-6">
          <div className="text-muted-foreground text-sm">Loading job…</div>
        </div>
      </>
    );
  }

  const applyLabel = applying
    ? "Submitting…"
    : alreadyApplied
      ? "Applied"
      : !user
        ? "Sign in to Apply"
        : "Apply Now";

  return (
    <>
      <PublicPageHeader />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>{job.business.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-heading text-2xl font-bold">{job.title}</h1>
                  <p className="text-muted-foreground">{job.business}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Saved")}>
                  <Bookmark className="h-4 w-4" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                {alreadyApplied ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate({ to: "/jobs/applications" })}
                  >
                    <CheckCircle2 className="h-4 w-4" /> View Application
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={openApply}
                    disabled={applying || checkingApplied}
                    data-testid="apply-button"
                  >
                    {applyLabel}
                  </Button>
                )}
              </div>
            </div>
            {alreadyApplied && (
              <div className="border-primary/30 bg-primary/5 text-primary flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                You have already applied for this job.
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">
                <Briefcase className="mr-1 h-3 w-3" />
                {job.type}
              </Badge>
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {job.area}{job.area && job.city ? ", " : ""}{job.city}
              </Badge>
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Posted {job.postedDays}d ago
              </Badge>
              <Badge variant="outline">
                <Users className="mr-1 h-3 w-3" />
                {job.applicants} applicants
              </Badge>
            </div>
            <div className="bg-muted/30 grid gap-4 rounded-lg p-4 md:grid-cols-3">
              <Stat label="Salary" value={job.salary} />
              <Stat label="Experience" value={job.experience} />
              <Stat label="Category" value={job.category} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <p className="whitespace-pre-line">{job.description}</p>
            {job.responsibilities.length > 0 && (
              <BulletGroup title="Responsibilities" items={job.responsibilities} />
            )}
            {job.requirements.length > 0 && (
              <BulletGroup title="Requirements" items={job.requirements} />
            )}
            {job.benefits.length > 0 && <BulletGroup title="Benefits" items={job.benefits} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> About {job.business}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              A premium {job.category.toLowerCase()} destination in {job.city}, serving 1,000+ happy
              clients monthly with a team of certified professionals.
            </p>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 md:hidden">
          {alreadyApplied ? (
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              onClick={() => navigate({ to: "/jobs/applications" })}
            >
              <CheckCircle2 className="h-4 w-4" /> View Application
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={openApply}
              disabled={applying || checkingApplied}
            >
              {applyLabel}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={applyOpen}
        onClose={() => (applying ? undefined : setApplyOpen(false))}
        title={`Apply — ${job.title}`}
        size="md"
      >
        <form onSubmit={handleSubmitApply} className="space-y-4 p-6">
          <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs">
            <div className="text-muted-foreground">Applying to</div>
            <div className="text-heading font-semibold">{job.title}</div>
            <div className="text-muted-foreground">{job.business}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="apply-name">Full name</Label>
              <Input
                id="apply-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={applying}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-destructive text-xs">{errors.fullName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apply-email">Email</Label>
              <Input
                id="apply-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={applying}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apply-phone">Phone number</Label>
            <Input
              id="apply-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={applying}
              aria-invalid={!!errors.phone}
              placeholder="+91 98xxxxxxxx"
            />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cover-note">Cover letter (optional)</Label>
            <Textarea
              id="cover-note"
              rows={5}
              maxLength={1000}
              placeholder={`Tell ${job.business} why you're a good fit…`}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              disabled={applying}
            />
            <div className="text-muted-foreground text-right text-[11px]">
              {coverNote.length}/1000
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApplyOpen(false)}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={applying}>
              <Send className="h-4 w-4" />
              {applying ? "Submitting application…" : "Submit application"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} size="sm">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="bg-primary/10 grid h-16 w-16 place-items-center rounded-full">
            <CheckCircle2 className="text-primary h-9 w-9" />
          </div>
          <div className="space-y-1">
            <h3 className="text-heading text-xl font-bold">Application submitted!</h3>
            <p className="text-muted-foreground text-sm">
              {successMode === "demo"
                ? "This is a demo listing — your interest has been recorded. You'll see it in your applications."
                : `Your application for ${job.title} at ${job.business} has been sent. The employer will review it shortly.`}
            </p>
          </div>
          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setSuccessOpen(false)}>
              Keep browsing
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setSuccessOpen(false);
                navigate({ to: "/jobs/applications" });
              }}
            >
              View applications
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs uppercase tracking-wider">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function BulletGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 font-semibold">{title}</div>
      <ul className="space-y-1.5">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2">
            <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
