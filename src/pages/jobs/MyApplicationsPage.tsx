import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import type { ApplicationsSearch } from "@/routes/jobs.applications";

const applicationsRoute = getRouteApi("/jobs/applications");
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, MapPin, Clock, Search, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { listMyApplications, type JobApplication } from "@/lib/jobs";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

function ApplicationSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );
}

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  reviewed: "bg-amber-100 text-amber-900",
  shortlisted: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
  hired: "bg-violet-100 text-violet-900",
  withdrawn: "bg-muted text-foreground",
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
  withdrawn: "Withdrawn",
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "reviewed", label: "Reviewed" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

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

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function MyApplicationsPage() {
  const { user, isInitialized } = useAuthStore();
  const search = applicationsRoute.useSearch();
  const navigate = useNavigate({ from: "/jobs/applications" });
  const filter = search.status;
  const q = search.q;
  const setFilter = (status: string) =>
    navigate({
      search: (prev: ApplicationsSearch) => ({
        ...prev,
        status: status as ApplicationsSearch["status"],
      }),
      replace: false,
    });
  // Local input value; the URL `q` is only updated after the user pauses typing
  // so we don't spam history entries or trigger a skeleton reload per keystroke.
  const [qInput, setQInput] = useState<string>(q);
  useEffect(() => {
    // Keep the input in sync when q changes from elsewhere (back/forward, reset).
    setQInput(q);
  }, [q]);
  useEffect(() => {
    if (qInput === q) return;
    const t = setTimeout(() => {
      navigate({
        search: (prev: ApplicationsSearch) => ({ ...prev, q: qInput }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [qInput, q, navigate]);

  const [apps, setApps] = useState<JobApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!isInitialized || !user) return;
    let alive = true;
    setError(null);
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
  }, [isInitialized, user, refreshTick]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps?.length ?? 0 };
    for (const a of apps ?? []) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps]);

  const filtered = useMemo(() => {
    if (!apps) return null;
    const needle = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (!needle) return true;
      const hay = [
        a.job?.title,
        a.job?.employer?.business_name,
        a.job?.city,
        a.job?.area,
        a.job?.job_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [apps, filter, q]);

  // Brief skeleton reload when filter/query changes for perceived responsiveness
  const [isReloading, setIsReloading] = useState(false);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setIsReloading(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const t = setTimeout(() => setIsReloading(false), 350);
    return () => clearTimeout(t);
  }, [filter, q]);

  // Also reset when the underlying data reloads
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [refreshTick, apps]);

  const visible = useMemo(
    () => (filtered ? filtered.slice(0, visibleCount) : null),
    [filtered, visibleCount],
  );
  const hasMore = !!filtered && visibleCount < filtered.length;

  // Infinite scroll via IntersectionObserver
  // Skip while reloading so the transient skeleton window can't trigger
  // duplicate page-size bumps (the sentinel unmounts, but we also guard
  // the callback in case an in-flight entry fires before disconnect).
  useEffect(() => {
    if (!hasMore || isReloading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (isReloading) return;
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visible, isReloading]);

  if (!isInitialized) {
    return (
      <>
        <PublicPageHeader />
        <div className="text-muted-foreground mx-auto max-w-5xl p-6 text-sm">Loading…</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PublicPageHeader />
        <div className="mx-auto max-w-5xl space-y-4 p-6">
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
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-heading text-2xl font-bold">My Applications</h1>
            <p className="text-muted-foreground text-sm">
              Track every role you have applied to, with live status and timestamps.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshTick((t) => t + 1)}
              aria-label="Refresh"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{counts[f.key] ?? 0}</span>
            </button>
          ))}
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, employer, city…"
              className="pl-8"
            />
          </div>
        </div>

        {error && (
          <Card>
            <CardContent className="p-6 text-sm text-rose-600">{error}</CardContent>
          </Card>
        )}

        {!error && (apps === null || isReloading) && (
          <ul className="space-y-3" aria-busy="true" aria-live="polite">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <ApplicationSkeleton />
              </li>
            ))}
          </ul>
        )}

        {!error && !isReloading && apps && apps.length === 0 && (
          <Card>
            <CardContent className="space-y-3 p-8 text-center">
              <p className="text-muted-foreground">You have not applied to any jobs yet.</p>
              <Button asChild>
                <Link to="/jobs">Find a job</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!error && !isReloading && filtered && apps && apps.length > 0 && filtered.length === 0 && (
          <Card>
            <CardContent className="text-muted-foreground p-6 text-sm">
              No applications match your filter.
            </CardContent>
          </Card>
        )}

        {!error && !isReloading && visible && filtered && visible.length > 0 && (
          <>
            <ul className="space-y-3">
              {visible.map((a) => {
                const j = a.job;
                const title = j?.title ?? "Job";
                const biz = j?.employer?.business_name ?? "Employer";
                const loc = j ? `${j.area ? `${j.area}, ` : ""}${j.city}` : "";
                const updated = a.updated_at && a.updated_at !== a.created_at;
                return (
                  <li key={a.id}>
                    <Card>
                      <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-heading font-semibold">{title}</div>
                            <Badge className={STATUS_TONE[a.status] ?? "bg-muted"}>
                              {STATUS_LABEL[a.status] ?? a.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground text-sm">{biz}</div>
                          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
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
                            <span
                              className="inline-flex items-center gap-1"
                              title={fmtDateTime(a.created_at)}
                            >
                              <Clock className="h-3 w-3" />
                              Applied {relative(a.created_at)}
                            </span>
                            {updated && (
                              <span title={fmtDateTime(a.updated_at)}>
                                Updated {relative(a.updated_at)}
                              </span>
                            )}
                          </div>
                          {a.cover_note && (
                            <p className="text-muted-foreground border-border line-clamp-2 border-l-2 pl-3 text-xs italic">
                              {a.cover_note}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
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

            {hasMore ? (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-6"
                aria-hidden="true"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  Load more
                </Button>
              </div>
            ) : (
              filtered.length > PAGE_SIZE && (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  You've reached the end · {filtered.length} applications
                </p>
              )
            )}
          </>
        )}
      </div>
    </>
  );
}
