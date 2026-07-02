import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { listMyApplications, type JobApplication } from "@/lib/jobs";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-amber-100 text-amber-900",
  shortlisted: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
  hired: "bg-violet-100 text-violet-900",
};

export function MyApplicationsPage() {
  const { user, isInitialized } = useAuthStore();
  const [apps, setApps] = useState<JobApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized || !user) return;
    let alive = true;
    listMyApplications(user.id)
      .then((rows) => {
        if (alive) setApps(rows);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load applications");
      });
    return () => {
      alive = false;
    };
  }, [isInitialized, user]);

  if (!isInitialized) {
    return (
      <>
        <PublicPageHeader />
        <div className="mx-auto max-w-4xl p-6 text-sm text-muted-foreground">Loading…</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PublicPageHeader />
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          <h1 className="text-heading text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground text-sm">Sign in to view your applications.</p>
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicPageHeader />
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground text-sm">
              Track jobs you have applied to and their status.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/jobs">Browse jobs</Link>
          </Button>
        </header>

        {error && (
          <Card>
            <CardContent className="p-6 text-sm text-rose-600">{error}</CardContent>
          </Card>
        )}

        {apps === null && !error && (
          <div className="text-muted-foreground text-sm">Loading applications…</div>
        )}

        {apps && apps.length === 0 && (
          <Card>
            <CardContent className="space-y-3 p-8 text-center">
              <p className="text-muted-foreground">You have not applied to any jobs yet.</p>
              <Button asChild>
                <Link to="/jobs">Find a job</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {apps && apps.length > 0 && (
          <ul className="space-y-3">
            {apps.map((a) => {
              const j = a.job;
              const title = j?.title ?? "Job";
              const biz = j?.employer?.business_name ?? "Employer";
              const loc = j ? `${j.area ? `${j.area}, ` : ""}${j.city}` : "";
              return (
                <li key={a.id}>
                  <Card>
                    <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
                      <div className="space-y-1">
                        <div className="font-semibold">{title}</div>
                        <div className="text-muted-foreground text-sm">{biz}</div>
                        <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                          {j?.job_type && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {j.job_type}
                            </span>
                          )}
                          {loc && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {loc}
                            </span>
                          )}
                          <span>
                            Applied {new Date(a.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={STATUS_TONE[a.status] ?? "bg-muted"}>
                          {a.status.replace(/_/g, " ")}
                        </Badge>
                        {j && (
                          <Button asChild size="sm" variant="outline">
                            <Link to="/jobs/$jobId" params={{ jobId: j.id }}>
                              View job
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
