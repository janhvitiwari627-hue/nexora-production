import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, FilePlus2, Search, UsersRound } from "lucide-react";
import { JobPortalPage } from "@/pages/public/JobPortalPage";

export function JobsAppHomePage() {
  return (
    <>
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4">
          <Link to="/jobs/search" className="rounded-2xl border p-3 text-sm font-bold">
            <Search className="mb-2 h-5 w-5 text-orange-600" /> Search jobs
          </Link>
          <Link to="/hire/post-job" className="rounded-2xl border p-3 text-sm font-bold">
            <FilePlus2 className="mb-2 h-5 w-5 text-orange-600" /> Post a salon job
          </Link>
          <Link to="/jobs/my-posts" className="rounded-2xl border p-3 text-sm font-bold">
            <BriefcaseBusiness className="mb-2 h-5 w-5 text-orange-600" /> My job posts
          </Link>
          <Link to="/app/jobs/applications" className="rounded-2xl border p-3 text-sm font-bold">
            <UsersRound className="mb-2 h-5 w-5 text-orange-600" /> Status & interviews
          </Link>
        </div>
      </section>
      <JobPortalPage />
    </>
  );
}
