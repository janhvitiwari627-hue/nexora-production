import { createFileRoute } from "@tanstack/react-router";
import { Bell, BriefcaseBusiness, FileText, Search, Store, UserRoundCheck } from "lucide-react";
import { RoleAppLandingPage } from "@/pages/public/RoleAppLandingPage";

export const Route = createFileRoute("/jobs-app")({
  head: () => ({ meta: [{ title: "Nexora Beauty Jobs App" }] }),
  component: JobsAppPage,
});

function JobsAppPage() {
  return (
    <RoleAppLandingPage
      kind="jobs"
      eyebrow="Beauty Jobs App"
      title="Beauty industry jobs, bina confusion."
      description="Candidates job search aur applications manage karein; salon owners vacancies aur applicants handle karein."
      startPath="/app/jobs"
      audience="beauty professionals and salon employers"
      features={[
        {
          icon: Search,
          title: "Find jobs",
          description: "Role, skill and location ke hisaab se openings search karein.",
        },
        {
          icon: FileText,
          title: "Simple profile",
          description: "Experience, skills and preferred job details add karein.",
        },
        {
          icon: BriefcaseBusiness,
          title: "Applications",
          description: "Applied jobs aur current status ek jagah dekhein.",
        },
        {
          icon: Store,
          title: "Post openings",
          description: "Salon owners clear job requirements publish kar sakte hain.",
        },
        {
          icon: UserRoundCheck,
          title: "Review candidates",
          description: "Relevant applicants shortlist and contact karein.",
        },
        {
          icon: Bell,
          title: "Job updates",
          description: "Application and vacancy updates receive karein.",
        },
      ]}
    />
  );
}
