import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { listMyApplications, type JobApplication } from "@/lib/jobs";

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-amber-100 text-amber-900",
  shortlisted: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
  hired: "bg-violet-100 text-violet-900",
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MyApplicationsWidget() {
  const { user, isInitialized } = useAuthStore();
  const [apps, setApps] = useState<JobApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized || !user) return;
    let alive = true;
    listMyApplications(user.id)
      .then((rows) => alive && setApps(rows))
      .catch((e) =>
        alive && setError(e instanceof Error ? e.message : "Failed to load applications"),
      );
    return () => {
      alive = false;
    };
  }, [isInitialized, user]);

  if (!isInitialized || !user) return null;

  const visible = apps?.slice(0, 4) ?? null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">My Applications</h2>
        <Button asChild size="sm" variant="ghost">
          <Link to="/jobs/applications">View all</Link>
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-rose-600">{error}</CardContent>
        </Card>
      )}

      {!error && apps === null && (
        <Card>
          <CardContent className="text-muted-foreground p-4 text-sm">
            Loading applications…
          </CardContent>
        </Card>
      )}

      {!error && apps && apps.length === 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="font-semibold">No applications yet</div>
              <p className="text-muted-foreground text-sm">
                Browse open roles and apply in under a minute.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/jobs">Find a job</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && visible && visible.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((a) => {
            const j = a.job;
            const title = j?.title ?? "Job";
            const biz = j?.employer?.business_name ?? "Employer";
            const loc = j ? `${j.area ? `${j.area}, ` : ""}${j.city}` : "";
            return (
              <li key={a.id}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{title}</div>
                        <div className="text-muted-foreground truncate text-sm">{biz}</div>
                      </div>
                      <Badge className={STATUS_TONE[a.status] ?? "bg-muted"}>
                        {a.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                      {j?.job_type && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> {j.job_type}
                        </span>
                      )}
                      {loc && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {loc}
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Applied {fmtDateTime(a.created_at)}
                      </span>
                      {a.updated_at && a.updated_at !== a.created_at && (
                        <span title={`Updated ${fmtDateTime(a.updated_at)}`}>
                          Updated {fmtDateTime(a.updated_at)}
                        </span>
                      )}
                    </div>
                    {j && (
                      <div className="flex justify-end">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/jobs/$jobId" params={{ jobId: j.id }}>
                            View job
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
