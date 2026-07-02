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
  openings: number;
  job_role: string | null;
  work_location: string | null;
  contact_person: string | null;
  contact_mobile: string | null;
  whatsapp_number: string | null;
  interview_mode: string | null;
  shop_id: string | null;
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
  openings?: number;
  job_role?: string | null;
  work_location?: string | null;
  contact_person?: string | null;
  contact_mobile?: string | null;
  whatsapp_number?: string | null;
  interview_mode?: string | null;
  shop_id?: string | null;
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

export async function getMyShopId(userId: string): Promise<string | null> {
  const { data, error } = await table("salon_owners")
    .select("salon_id")
    .eq("user_id", userId)
    .eq("is_approved", true)
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data?.salon_id as string | undefined) ?? null;
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

export async function withdrawApplication(applicationId: string, applicantId: string): Promise<void> {
  const { error } = await table("job_applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .eq("applicant_id", applicantId);
  if (error) throw error;
}

export type MyJobPost = JobRow & {
  total_applications: number;
  new_applications: number;
};

export async function listMyJobPosts(userId: string): Promise<MyJobPost[]> {
  const { data: jobs, error } = await table("jobs")
    .select("*")
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (jobs ?? []) as JobRow[];
  if (rows.length === 0) return [];
  const ids = rows.map((j) => j.id);
  const { data: apps } = await table("job_applications")
    .select("job_id,status")
    .in("job_id", ids);
  const counts = new Map<string, { total: number; fresh: number }>();
  for (const a of (apps ?? []) as { job_id: string; status: string }[]) {
    const c = counts.get(a.job_id) ?? { total: 0, fresh: 0 };
    c.total += 1;
    if (a.status === "submitted") c.fresh += 1;
    counts.set(a.job_id, c);
  }
  return rows.map((j) => ({
    ...j,
    total_applications: counts.get(j.id)?.total ?? 0,
    new_applications: counts.get(j.id)?.fresh ?? 0,
  }));
}

export async function closeJobPost(jobId: string, userId: string): Promise<void> {
  const { error } = await table("jobs")
    .update({ status: "closed" })
    .eq("id", jobId)
    .eq("posted_by", userId);
  if (error) throw error;
}
