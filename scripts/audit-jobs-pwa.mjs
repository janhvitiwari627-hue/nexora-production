#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const required = [
  "src/routes/app.jobs.tsx",
  "src/routes/app.jobs.index.tsx",
  "src/routes/app.jobs.applications.tsx",
  "src/routes/app.jobs.profile.tsx",
  "src/routes/app.jobs.saved.tsx",
  "src/routes/app.jobs.support.tsx",
  "src/pages/jobs/app/JobsAppShell.tsx",
  "src/pages/jobs/app/SavedJobsPage.tsx",
  "supabase/migrations/20260716170000_jobs_pwa_saved_jobs.sql",
  "supabase/migrations/20260716173000_candidate_resume_storage.sql",
];
const failures = required.filter((path) => !existsSync(path)).map((path) => `Missing ${path}`);

const shell = readFileSync("src/pages/jobs/app/JobsAppShell.tsx", "utf8");
for (const label of ["Jobs", "Applications", "Profile", "Saved", "Support"]) {
  if (!shell.includes(`label: "${label}"`)) failures.push(`Missing ${label} bottom navigation`);
}

const jobs = readFileSync("src/lib/jobs.ts", "utf8");
for (const helper of ["saveJobForLater", "removeSavedJob", "listSavedJobs"]) {
  if (!jobs.includes(`function ${helper}`)) failures.push(`Missing backend helper ${helper}`);
}

const manifest = JSON.parse(readFileSync("public/manifests/jobs.webmanifest", "utf8"));
if (!String(manifest.start_url).startsWith("/app/jobs")) {
  failures.push("Jobs PWA manifest does not launch the jobs app");
}

const migration = readFileSync(
  "supabase/migrations/20260716170000_jobs_pwa_saved_jobs.sql",
  "utf8",
);
if (!migration.includes("ENABLE ROW LEVEL SECURITY") || !migration.includes("auth.uid()")) {
  failures.push("Saved jobs migration is missing user-scoped RLS");
}

if (failures.length) {
  console.error("Jobs PWA audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  "Jobs PWA audit passed: routes, role navigation, saved jobs backend, RLS and manifest are connected.",
);
