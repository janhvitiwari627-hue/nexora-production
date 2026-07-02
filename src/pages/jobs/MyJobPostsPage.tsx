import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  Users,
  Sparkles,
  Pencil,
  XCircle,
  Eye,
  Plus,
  Send,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { listMyJobPosts, closeJobPost, setJobStatus, type MyJobPost } from "@/lib/jobs";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const STATUS_TONE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-900",
  draft: "bg-amber-100 text-amber-900",
  closed: "bg-muted text-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  closed: "Closed",
};

function formatSalary(min: number | null, max: number | null, period: string | null) {
  if (!min && !max) return "Salary not disclosed";
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const range = min && max ? `${fmt(min)} – ${fmt(max)}` : fmt((min ?? max) as number);
  return period ? `${range} / ${period}` : range;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MyJobPostsPage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<MyJobPost[]>([]);
  const [closingId, setClosingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await listMyJobPosts(user.id);
      setPosts(rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load your posts";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleClose = async (id: string) => {
    if (!user) return;
    if (!confirm("Close this job post? Candidates will no longer see it.")) return;
    setClosingId(id);
    try {
      await closeJobPost(id, user.id);
      toast.success("Job closed");
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "closed" } : p)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not close job";
      toast.error(message);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Employer</p>
            <h1 className="text-2xl font-bold text-heading">My Job Posts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage every job you've posted, track applications and close roles you've filled.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/hire/post-job">
              <Plus className="mr-1.5 h-4 w-4" /> Post a Job
            </Link>
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-heading">
                  You have not posted any job yet.
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Post your first opening and start receiving applications from local talent.
                </p>
              </div>
              <Button asChild>
                <Link to="/hire/post-job">
                  <Plus className="mr-1.5 h-4 w-4" /> Post a Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((job) => {
              const location = [job.area, job.city].filter(Boolean).join(", ") || "Location TBD";
              const canEdit = job.status !== "closed";
              const canClose = job.status === "published";
              return (
                <Card key={job.id} className="transition hover:shadow-md">
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-heading">{job.title}</h3>
                        <Badge className={STATUS_TONE[job.status] ?? "bg-muted"}>
                          {STATUS_LABEL[job.status] ?? job.status}
                        </Badge>
                        {job.new_applications > 0 && (
                          <Badge className="bg-primary/10 text-primary">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {job.new_applications} new
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Posted {formatDate(job.published_at ?? job.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {job.total_applications} application
                          {job.total_applications === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/jobs/applications/$jobId" params={{ jobId: job.id }}>
                          <Eye className="mr-1.5 h-4 w-4" /> View Applications
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        disabled={!canEdit}
                        aria-disabled={!canEdit}
                      >
                        <Link to="/hire/post-job">
                          <Pencil className="mr-1.5 h-4 w-4" /> Edit Job
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClose(job.id)}
                        disabled={!canClose || closingId === job.id}
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        {closingId === job.id ? "Closing…" : "Close Job"}
                      </Button>
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
