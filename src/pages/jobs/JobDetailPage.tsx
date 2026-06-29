import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, Briefcase, Building2, Check, Clock, MapPin, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { MOCK_JOBS } from "./mockJobs";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

export function JobDetailPage({ jobId }: { jobId: string }) {
  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];

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
                <Button size="sm" onClick={() => toast.success("Application submitted")}>
                  Apply Now
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">
                <Briefcase className="mr-1 h-3 w-3" />
                {job.type}
              </Badge>
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {job.area}, {job.city}
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
            <p>{job.description}</p>
            <BulletGroup title="Responsibilities" items={job.responsibilities} />
            <BulletGroup title="Requirements" items={job.requirements} />
            <BulletGroup title="Benefits" items={job.benefits} />
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
            <div className="grid gap-3 md:grid-cols-3">
              <Stat label="Founded" value="2018" />
              <Stat label="Team Size" value="25+" />
              <Stat label="Avg Rating" value="4.8 ★" />
            </div>
            <Button variant="outline" size="sm">
              View Company Profile
            </Button>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 md:hidden">
          <Button
            className="w-full"
            size="lg"
            onClick={() => toast.success("Application submitted")}
          >
            Apply Now
          </Button>
        </div>
      </div>
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
