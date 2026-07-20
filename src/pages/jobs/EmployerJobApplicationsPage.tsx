import { useEffect, useState } from "react";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Clock,
  Download,
  MessageCircle,
  PhoneCall,
  Eye,
  Star,
  XCircle,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  getJobForEmployer,
  listApplicationsForJob,
  updateApplicationStatus,
  type ApplicationWithCandidate,
  type JobRow,
} from "@/lib/jobs";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const route = getRouteApi("/jobs/applications/$jobId");

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-amber-100 text-amber-900",
  shortlisted: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
  hired: "bg-violet-100 text-violet-900",
  withdrawn: "bg-muted text-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Applied",
  reviewed: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
  withdrawn: "Withdrawn",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function experienceLabel(exp: any): string | null {
  if (!exp) return null;
  if (Array.isArray(exp) && exp.length > 0) {
    const years = exp.reduce((sum: number, e: any) => sum + (Number(e?.years) || 0), 0);
    if (years > 0) return `${years} yr${years > 1 ? "s" : ""} experience`;
    return `${exp.length} role${exp.length > 1 ? "s" : ""}`;
  }
  return null;
}

function normalisePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 10 ? `91${digits}` : digits;
}

function CardSkeleton() {
  return (
    <Card>
      <CardContent className="flex gap-4 p-5">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployerJobApplicationsPage() {
  const { jobId } = route.useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobRow | null>(null);
  const [apps, setApps] = useState<ApplicationWithCandidate[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [j, a] = await Promise.all([
        getJobForEmployer(jobId, user.id),
        listApplicationsForJob(jobId),
      ]);
      if (!j) {
        toast.error("Job not found or you don't have access");
        navigate({ to: "/jobs/my-posts" });
        return;
      }
      setJob(j);
      setApps(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, user?.id]);

  const changeStatus = async (
    app: ApplicationWithCandidate,
    status: "reviewed" | "shortlisted" | "rejected" | "hired",
  ) => {
    setPendingId(app.id);
    try {
      await updateApplicationStatus(app.id, status);
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
      toast.success("Application status updated.", {
        description: `Marked as ${STATUS_LABEL[status]}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update status";
      toast.error(message);
    } finally {
      setPendingId(null);
    }
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const filters: Array<{ key: string; label: string }> = [
    { key: "all", label: `All (${apps.length})` },
    { key: "submitted", label: "Applied" },
    { key: "reviewed", label: "Under Review" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "hired", label: "Hired" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link to="/jobs/my-posts">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to my posts
          </Link>
        </Button>

        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Applications received
          </p>
          <h1 className="text-2xl font-bold text-heading">
            {job?.title ?? (loading ? "Loading…" : "Job")}
          </h1>
          {job && (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {[job.area, job.city].filter(Boolean).join(", ") || "Location TBD"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {apps.length} application{apps.length === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-heading"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-heading">
                {apps.length === 0 ? "No applications yet" : "No applications match this filter"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {apps.length === 0
                  ? "Share your job post to reach more candidates."
                  : "Try switching to a different status."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => {
              const c = app.candidate;
              const name = c?.full_name || "Candidate";
              const phone = c?.phone;
              const email = c?.email;
              const waPhone = normalisePhone(phone);
              const busy = pendingId === app.id;
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <Card key={app.id}>
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
                    <div className="flex items-start gap-3">
                      {c?.avatar_url ? (
                        <img
                          src={c.avatar_url}
                          alt={name}
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {initials || "?"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-heading">{name}</h3>
                        <Badge className={STATUS_TONE[app.status] ?? "bg-muted"}>
                          {STATUS_LABEL[app.status] ?? app.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {phone}
                          </span>
                        )}
                        {email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> {email}
                          </span>
                        )}
                        {c?.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {c.city}
                          </span>
                        )}
                        {experienceLabel(c?.experience) && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {experienceLabel(c?.experience)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> Applied {fmtDate(app.created_at)}
                        </span>
                      </div>

                      {c?.skills && c.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 8).map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {app.cover_note && (
                        <p className="rounded-md bg-muted/50 p-3 text-sm text-foreground">
                          {app.cover_note}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        {c?.resume_url && (
                          <Button asChild size="sm" variant="outline">
                            <a href={c.resume_url} target="_blank" rel="noreferrer">
                              <Download className="mr-1.5 h-4 w-4" /> Resume
                            </a>
                          </Button>
                        )}
                        {waPhone && (
                          <Button asChild size="sm" variant="outline">
                            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer">
                              <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                            </a>
                          </Button>
                        )}
                        {phone && (
                          <Button asChild size="sm" variant="outline">
                            <a href={`tel:${phone}`}>
                              <PhoneCall className="mr-1.5 h-4 w-4" /> Call
                            </a>
                          </Button>
                        )}
                        <div className="ml-auto flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || app.status === "reviewed"}
                            onClick={() => changeStatus(app, "reviewed")}
                          >
                            <Eye className="mr-1.5 h-4 w-4" /> Under Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || app.status === "shortlisted"}
                            onClick={() => changeStatus(app, "shortlisted")}
                          >
                            <Star className="mr-1.5 h-4 w-4" /> Shortlist
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || app.status === "rejected"}
                            onClick={() => changeStatus(app, "rejected")}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={busy || app.status === "hired"}
                            onClick={() => changeStatus(app, "hired")}
                          >
                            <Trophy className="mr-1.5 h-4 w-4" /> Hire
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
