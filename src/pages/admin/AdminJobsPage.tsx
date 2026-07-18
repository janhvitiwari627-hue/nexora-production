import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Briefcase, Users, CheckCircle2, XCircle, Search, CalendarClock,
  UserCheck, TrendingUp, Ban, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type JobRow = {
  id: string;
  title: string | null;
  business_name: string | null;
  city: string | null;
  status: string | null;
  applicants_count: number | null;
  created_at: string;
  posted_by: string | null;
};

type AppRow = {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  cover_note: string | null;
  jobs: { title: string | null; business_name: string | null } | null;
  candidate_profiles: { full_name: string | null; city: string | null; experience_years: number | null } | null;
};

const JOB_STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-700",
  paused: "bg-amber-100 text-amber-700",
  closed: "bg-rose-100 text-rose-700",
  flagged: "bg-rose-100 text-rose-700",
  pending_approval: "bg-amber-100 text-amber-700",
};

const APP_STATUS_STYLES: Record<string, string> = {
  applied: "bg-slate-100 text-slate-700",
  screening: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offer: "bg-violet-100 text-violet-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export function AdminJobsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const jobsQ = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,business_name,city,status,applicants_count,created_at,posted_by")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as JobRow[];
    },
  });

  const appsQ = useQuery({
    queryKey: ["admin", "job_applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(
          "id,job_id,applicant_id,status,created_at,cover_note,jobs(title,business_name),candidate_profiles(full_name,city,experience_years)",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as AppRow[];
    },
  });

  const jobs = jobsQ.data ?? [];
  const apps = appsQ.data ?? [];

  const stats = useMemo(() => ({
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "published").length,
    pendingJobs: jobs.filter((j) => j.status === "pending_approval" || j.status === "draft").length,
    totalApplicants: apps.length,
    interviews: apps.filter((a) => a.status === "interview" || a.status === "screening").length,
    offers: apps.filter((a) => a.status === "offer").length,
    hired: apps.filter((a) => a.status === "hired").length,
  }), [jobs, apps]);

  const updateJob = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`Job marked ${v.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateApp = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`Application marked ${v.status}`);
      qc.invalidateQueries({ queryKey: ["admin", "job_applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredJobs = jobs.filter((j) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (j.title ?? "").toLowerCase().includes(s) ||
      (j.business_name ?? "").toLowerCase().includes(s) ||
      (j.city ?? "").toLowerCase().includes(s)
    );
  });

  const KPIS = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-indigo-600" },
    { label: "Published", value: stats.activeJobs, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Pending Approval", value: stats.pendingJobs, icon: CalendarClock, color: "text-amber-600" },
    { label: "Applicants", value: stats.totalApplicants, icon: Users, color: "text-violet-600" },
    { label: "Interviews", value: stats.interviews, icon: CalendarClock, color: "text-blue-600" },
    { label: "Offers", value: stats.offers, icon: UserCheck, color: "text-fuchsia-600" },
    { label: "Hired", value: stats.hired, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs &amp; Hiring Control</h1>
        <p className="text-sm text-muted-foreground">
          Live view of every job posting, application, interview and hire request across the platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <k.icon className={`h-4 w-4 ${k.color}`} />
              <div className="mt-2 text-2xl font-bold">{k.value}</div>
              <div className="text-xs text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interview Requests</TabsTrigger>
          <TabsTrigger value="hires">Hire Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base">Job Postings</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search job, business, city…"
                  className="pl-8"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {jobsQ.isLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs…
                </div>
              ) : jobsQ.error ? (
                <div className="py-8 text-sm text-rose-600">Failed to load jobs.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((j) => (
                      <TableRow key={j.id}>
                        <TableCell className="font-medium">{j.title ?? "—"}</TableCell>
                        <TableCell>{j.business_name ?? "—"}</TableCell>
                        <TableCell>{j.city ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{j.applicants_count ?? 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={JOB_STATUS_STYLES[j.status ?? ""] ?? "bg-slate-100 text-slate-700"}>
                            {j.status ?? "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            {j.status !== "published" && (
                              <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => updateJob.mutate({ id: j.id, status: "published" })}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {j.status !== "closed" && (
                              <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => updateJob.mutate({ id: j.id, status: "closed" })}>
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredJobs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                          No jobs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <ApplicationsTable data={apps} loading={appsQ.isLoading} onSet={(id, s) => updateApp.mutate({ id, status: s })} />
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          <ApplicationsTable
            data={apps.filter((a) => a.status === "interview" || a.status === "screening")}
            loading={appsQ.isLoading}
            onSet={(id, s) => updateApp.mutate({ id, status: s })}
            title="Interview requests awaiting admin action"
          />
        </TabsContent>

        <TabsContent value="hires" className="mt-4">
          <ApplicationsTable
            data={apps.filter((a) => a.status === "offer" || a.status === "hired")}
            loading={appsQ.isLoading}
            onSet={(id, s) => updateApp.mutate({ id, status: s })}
            title="Hire requests &amp; confirmed hires"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicationsTable({
  data,
  loading,
  onSet,
  title = "All applications",
}: {
  data: AppRow[];
  loading: boolean;
  onSet: (id: string, status: string) => void;
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading applications…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.candidate_profiles?.full_name ?? a.applicant_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{a.candidate_profiles?.city ?? "—"}</TableCell>
                  <TableCell>
                    {a.candidate_profiles?.experience_years != null
                      ? `${a.candidate_profiles.experience_years} yrs`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.jobs?.title ?? "—"}
                    {a.jobs?.business_name ? (
                      <span className="text-muted-foreground"> · {a.jobs.business_name}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge className={APP_STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-700"}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => onSet(a.id, "interview")}>
                        Interview
                      </Button>
                      <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => onSet(a.id, "hired")}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => onSet(a.id, "rejected")}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No applications in this bucket.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
