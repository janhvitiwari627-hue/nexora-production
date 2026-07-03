import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Briefcase, Users, CheckCircle2, XCircle, Eye, Search, CalendarClock,
  UserCheck, TrendingUp, Ban,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_JOBS, MOCK_APPLICANTS, type Applicant } from "@/pages/jobs/mockJobs";

type AppStatus = Applicant["stage"];

const STATUS_STYLES: Record<AppStatus, string> = {
  Applied: "bg-slate-100 text-slate-700",
  Screening: "bg-blue-100 text-blue-700",
  Interview: "bg-amber-100 text-amber-700",
  Offer: "bg-violet-100 text-violet-700",
  Hired: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

export function AdminJobsPage() {
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [jobs, setJobs] = useState(
    MOCK_JOBS.map((j, i) => ({
      ...j,
      status: (i % 5 === 0 ? "pending" : i % 7 === 0 ? "flagged" : "active") as
        | "active" | "pending" | "flagged" | "closed",
    })),
  );
  const [q, setQ] = useState("");

  const stats = useMemo(() => {
    const totalApplicants = applicants.length;
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === "active").length,
      pendingJobs: jobs.filter((j) => j.status === "pending").length,
      totalApplicants,
      interviews: applicants.filter((a) => a.stage === "Interview").length,
      offers: applicants.filter((a) => a.stage === "Offer").length,
      hired: applicants.filter((a) => a.stage === "Hired").length,
    };
  }, [jobs, applicants]);

  const setJobStatus = (id: string, s: (typeof jobs)[number]["status"]) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: s } : j)));
    toast.success(`Job ${s}`);
  };

  const setAppStage = (id: string, s: AppStatus) => {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, stage: s } : a)));
    toast.success(`Application marked ${s}`);
  };

  const filteredJobs = jobs.filter(
    (j) =>
      !q ||
      j.title.toLowerCase().includes(q.toLowerCase()) ||
      j.business.toLowerCase().includes(q.toLowerCase()) ||
      j.city.toLowerCase().includes(q.toLowerCase()),
  );

  const KPIS = [
    { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "text-indigo-600" },
    { label: "Active Postings", value: stats.activeJobs, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Pending Approval", value: stats.pendingJobs, icon: CalendarClock, color: "text-amber-600" },
    { label: "Total Applicants", value: stats.totalApplicants, icon: Users, color: "text-violet-600" },
    { label: "Interview Requests", value: stats.interviews, icon: CalendarClock, color: "text-blue-600" },
    { label: "Hire Requests", value: stats.offers, icon: UserCheck, color: "text-fuchsia-600" },
    { label: "Hired", value: stats.hired, icon: CheckCircle2, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs & Hiring Control</h1>
        <p className="text-sm text-muted-foreground">
          Full control over job postings, applications, interview & hire requests across the platform.
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
                      <TableCell className="font-medium">{j.title}</TableCell>
                      <TableCell>{j.business}</TableCell>
                      <TableCell>{j.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{j.applicants}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            j.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : j.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : j.status === "flagged"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-100 text-slate-700"
                          }
                        >
                          {j.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${j.title}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {j.status === "pending" && (
                            <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => setJobStatus(j.id, "active")}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setJobStatus(j.id, "closed")}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <ApplicationsTable applicants={applicants} onSet={setAppStage} />
        </TabsContent>

        <TabsContent value="interviews" className="mt-4">
          <ApplicationsTable
            applicants={applicants.filter((a) => a.stage === "Interview" || a.stage === "Screening")}
            onSet={setAppStage}
            title="Interview requests awaiting admin action"
          />
        </TabsContent>

        <TabsContent value="hires" className="mt-4">
          <ApplicationsTable
            applicants={applicants.filter((a) => a.stage === "Offer" || a.stage === "Hired")}
            onSet={setAppStage}
            title="Hire requests & confirmed hires"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicationsTable({
  applicants,
  onSet,
  title = "All applications",
}: {
  applicants: Applicant[];
  onSet: (id: string, s: AppStatus) => void;
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.city}</TableCell>
                <TableCell>{a.experience}</TableCell>
                <TableCell>{"★".repeat(a.rating)}</TableCell>
                <TableCell>
                  <Badge className={STATUS_STYLES[a.stage]}>{a.stage}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => onSet(a.id, "Interview")}>
                      Interview
                    </Button>
                    <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => onSet(a.id, "Hired")}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => onSet(a.id, "Rejected")}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {applicants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No applications in this bucket.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
