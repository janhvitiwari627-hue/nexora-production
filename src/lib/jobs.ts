// Client-side Supabase helpers for the jobs module.
// Uses `as any` casts where generated types haven't caught up with the new tables.
import { supabase } from "@/integrations/supabase/client";

export type EmployerProfile = {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  city: string;
  state: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type JobRow = {
  id: string;
  employer_id: string;
  posted_by: string;
  title: string;
  category: string;
  description: string;
  job_type: string;
  experience_level: string | null;
  city: string;
  area: string | null;
  address: string | null;
  schedule: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  benefits: string[] | null;
  requirements: string | null;
  skills: string[] | null;
  status: "draft" | "published" | "closed";
  published_at: string | null;
  applicants_count: number;
  created_at: string;
  updated_at: string;
  employer?: EmployerProfile | null;
};

const table = (name: string) => (supabase as any).from(name);

export async function getMyEmployerProfile(userId: string): Promise<EmployerProfile | null> {
  const { data, error } = await table("employer_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as EmployerProfile | null) ?? null;
}

export async function upsertEmployerProfile(
  userId: string,
  input: Omit<EmployerProfile, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<EmployerProfile> {
  const { data, error } = await table("employer_profiles")
    .upsert({ user_id: userId, ...input }, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as EmployerProfile;
}

export type JobDraftInput = {
  title: string;
  category: string;
  description: string;
  job_type: string;
  experience_level?: string | null;
  city: string;
  area?: string | null;
  address?: string | null;
  schedule?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_period?: string | null;
  benefits?: string[];
  requirements?: string | null;
  skills?: string[];
};

export async function saveJob(params: {
  jobId?: string;
  employerId: string;
  userId: string;
  input: JobDraftInput;
  publish: boolean;
}): Promise<JobRow> {
  const { jobId, employerId, userId, input, publish } = params;
  const payload: any = {
    employer_id: employerId,
    posted_by: userId,
    ...input,
    status: publish ? "published" : "draft",
  };
  if (publish) payload.published_at = new Date().toISOString();

  if (jobId) {
    const { data, error } = await table("jobs").update(payload).eq("id", jobId).select("*").single();
    if (error) throw error;
    return data as JobRow;
  }
  const { data, error } = await table("jobs").insert(payload).select("*").single();
  if (error) throw error;
  return data as JobRow;
}

export async function listPublishedJobs(limit = 50): Promise<JobRow[]> {
  const { data, error } = await table("jobs")
    .select("*, employer:employer_profiles(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as JobRow[];
}

export type JobApplication = {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  job?: (JobRow & { employer?: EmployerProfile | null }) | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isRealJobId = (id: string) => UUID_RE.test(id);

export async function applyToJob(params: {
  jobId: string;
  applicantId: string;
  coverNote?: string | null;
}): Promise<JobApplication> {
  const { jobId, applicantId, coverNote } = params;
  const { data, error } = await table("job_applications")
    .upsert(
      {
        job_id: jobId,
        applicant_id: applicantId,
        cover_note: coverNote ?? null,
        status: "submitted",
      },
      { onConflict: "job_id,applicant_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as JobApplication;
}

export async function listMyApplications(
  applicantId: string,
  options?: { signal?: AbortSignal },
): Promise<JobApplication[]> {
  const query = table("job_applications")
    .select("*, job:jobs(*, employer:employer_profiles(*))")
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });
  const { data, error } = await (options?.signal
    ? // supabase-js exposes abortSignal on the builder
      (query as unknown as { abortSignal: (s: AbortSignal) => typeof query })
        .abortSignal(options.signal)
    : query);
  if (error) throw error;
  return (data ?? []) as JobApplication[];
}
