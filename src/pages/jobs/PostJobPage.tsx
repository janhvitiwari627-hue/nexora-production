import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Briefcase, Check, CheckCircle2, IndianRupee, MapPin, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  getJobForEmployer,
  getMyEmployerProfile,
  getMyShopId,
  saveJob,
  type EmployerProfile,
  type JobDraftInput,
  type JobRow,
} from "@/lib/jobs";
import { EmployerSetupModal } from "@/pages/jobs/EmployerSetupModal";
import { BackButton } from "@/components/shared/BackButton";
import { cn } from "@/lib/utils";

const WORK_LOCATIONS = ["Onsite", "Remote", "Hybrid"];
const INTERVIEW_MODES = ["In-person", "Phone call", "Video call", "WhatsApp"];

const CATEGORIES = [
  "Hair Stylist",
  "Barber",
  "Makeup Artist",
  "Nail Artist",
  "Beauty Therapist",
  "Spa Therapist",
  "Massage Therapist",
  "Skin Therapist",
  "Eyelash / Brow Artist",
  "Tattoo Artist",
  "Salon Manager",
  "Receptionist",
  "Salon Assistant",
  "Hair Colourist",
  "Bridal Makeup Artist",
  "Freelancer",
  "Other",
];
const JOB_TYPES = ["Full-time", "Part-time", "Freelance", "Contract", "Internship", "Temporary"];
const EXPERIENCE = [
  "Fresher welcome",
  "0–1 years",
  "1–2 years",
  "2–4 years",
  "4–6 years",
  "6+ years",
];
const PERIODS: { label: string; value: JobDraftInput["salary_period"] }[] = [
  { label: "per month", value: "monthly" },
  { label: "per year", value: "yearly" },
  { label: "per hour", value: "hourly" },
];
const BENEFITS = [
  "PF & ESI",
  "Health insurance",
  "Incentives",
  "Paid leave",
  "Meals",
  "Training",
  "Product allowance",
  "Travel allowance",
];

// Quick-select role suggestions grouped by beauty category.
// Selecting a chip fills the "Specific job role" field (single-choice) and, if
// Job Title is empty, mirrors into Job Title. Manual typing stays available.
const ROLE_SUGGESTIONS: Record<string, string[]> = {
  "Hair Stylist": ["Senior Hair Stylist", "Junior Hair Stylist", "Hair Stylist Trainee", "Bridal Hair Specialist", "Hair Extensions Specialist"],
  Barber: ["Senior Barber", "Junior Barber", "Master Barber", "Beard Grooming Specialist"],
  "Makeup Artist": ["Senior Makeup Artist", "Junior Makeup Artist", "Party Makeup Artist", "HD Makeup Artist", "Airbrush Makeup Artist"],
  "Bridal Makeup Artist": ["Senior Bridal Makeup Artist", "Bridal Hair & Makeup Artist", "South Indian Bridal Specialist", "Muslim Bridal Specialist"],
  "Nail Artist": ["Senior Nail Technician", "Junior Nail Technician", "Nail Art Specialist", "Gel & Acrylic Specialist"],
  "Beauty Therapist": ["Senior Beauty Therapist", "Junior Beauty Therapist", "Facial Specialist", "Waxing Specialist"],
  "Spa Therapist": ["Senior Spa Therapist", "Junior Spa Therapist", "Ayurvedic Therapist", "Aromatherapy Specialist"],
  "Massage Therapist": ["Senior Massage Therapist", "Deep Tissue Specialist", "Thai Massage Therapist", "Swedish Massage Therapist"],
  "Skin Therapist": ["Senior Skin Therapist", "Advanced Facial Specialist", "Acne & Pigmentation Specialist", "Laser Skin Therapist"],
  "Eyelash / Brow Artist": ["Lash Extension Specialist", "Brow Lamination Specialist", "Microblading Artist", "Lash Lift Specialist"],
  "Tattoo Artist": ["Senior Tattoo Artist", "Junior Tattoo Artist", "Permanent Makeup Artist"],
  "Hair Colourist": ["Senior Hair Colourist", "Balayage Specialist", "Global Colour Specialist", "Highlights Specialist"],
  "Salon Manager": ["Salon Manager", "Assistant Salon Manager", "Operations Manager", "Branch Manager"],
  Receptionist: ["Salon Receptionist", "Front Desk Executive", "Guest Relations Executive"],
  "Salon Assistant": ["Salon Assistant", "Shampoo Assistant", "Beauty Assistant", "Trainee Assistant"],
  Freelancer: ["Freelance Hair Stylist", "Freelance Makeup Artist", "Freelance Bridal Artist", "Freelance Nail Artist"],
  Other: ["Trainer / Educator", "Photographer", "Content Creator"],
};

const STEPS = [
  { key: "details", label: "Job details" },
  { key: "location", label: "Location & schedule" },
  { key: "salary", label: "Salary & benefits" },
  { key: "requirements", label: "Requirements" },
  { key: "review", label: "Review & publish" },
] as const;

type Form = Required<
  Pick<JobDraftInput, "title" | "category" | "description" | "job_type" | "city">
> &
  JobDraftInput & { benefits: string[]; skills: string[] };

const EMPTY: Form = {
  title: "",
  category: "",
  description: "",
  job_type: JOB_TYPES[0],
  experience_level: EXPERIENCE[0],
  city: "",
  area: "",
  address: "",
  schedule: "",
  salary_min: null,
  salary_max: null,
  salary_period: "monthly",
  benefits: [],
  requirements: "",
  skills: [],
  openings: 1,
  job_role: "",
  work_location: WORK_LOCATIONS[0],
  contact_person: "",
  contact_mobile: "",
  whatsapp_number: "",
  interview_mode: INTERVIEW_MODES[0],
  shop_id: null,
};

const DRAFT_STORAGE_KEY = "nexora:postJobWizard:v1";

type PersistedDraft = { step: number; form: Form; jobId?: string; skillsInput: string; userId?: string };

function loadDraft(): PersistedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedDraft;
  } catch {
    return null;
  }
}

export function PostJobPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/hire/post-job" }) as { jobId?: string };
  const editJobId = search.jobId;
  const { user, isInitialized } = useAuthStore();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  // When editing, ignore any persisted wizard draft — we hydrate from the job row.
  const initialDraft = typeof window !== "undefined" && !editJobId ? loadDraft() : null;
  const [step, setStep] = useState<number>(initialDraft?.step ?? 0);
  const [form, setForm] = useState<Form>(initialDraft?.form ?? EMPTY);
  const [jobId, setJobId] = useState<string | undefined>(editJobId ?? initialDraft?.jobId);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [skillsInput, setSkillsInput] = useState(initialDraft?.skillsInput ?? "");
  const [draftRestored, setDraftRestored] = useState<boolean>(!!initialDraft && (initialDraft.step > 0 || initialDraft.form.title.length > 0));
  const [publishError, setPublishError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [highlightInvalid, setHighlightInvalid] = useState(false);
  const stepCardRef = useRef<HTMLDivElement | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [publishedJob, setPublishedJob] = useState<JobRow | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(!!editJobId);

  // Persist wizard state to localStorage so it survives session expiry / re-login.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (editJobId) return; // don't overwrite the localStorage draft while editing
    try {
      const payload: PersistedDraft = { step, form, jobId, skillsInput, userId: user?.id };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [step, form, jobId, skillsInput, user?.id, editJobId]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      try {
        sessionStorage.setItem("nexora:postLoginRedirect", "/hire/post-job");
      } catch {}
      navigate({ to: "/login", search: { redirect: "/hire/post-job" } as never });
      return;
    }
    getMyEmployerProfile(user.id)
      .then((p) => {
        setProfile(p);
        if (!p) setShowSetup(true);
        else if (!editJobId) {
          setForm((f) => ({
            ...f,
            city: f.city || p.city,
            contact_mobile: f.contact_mobile || p.phone || "",
            contact_person: f.contact_person || p.business_name || "",
            whatsapp_number: f.whatsapp_number || p.phone || "",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
    getMyShopId(user.id).then((sid) => setShopId(sid)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);

  // Load an existing job for editing.
  useEffect(() => {
    if (!editJobId || !user) return;
    let cancelled = false;
    setLoadingEdit(true);
    setDraftRestored(false);
    getJobForEmployer(editJobId, user.id)
      .then((job) => {
        if (cancelled) return;
        if (!job) {
          toast.error("Job not found or you don't have access");
          navigate({ to: "/jobs/my-posts" });
          return;
        }
        setJobId(job.id);
        setForm({
          title: job.title ?? "",
          category: job.category ?? "",
          description: job.description ?? "",
          job_type: job.job_type ?? JOB_TYPES[0],
          experience_level: job.experience_level ?? EXPERIENCE[0],
          city: job.city ?? "",
          area: job.area ?? "",
          address: job.address ?? "",
          schedule: job.schedule ?? "",
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_period: (job.salary_period as any) ?? "monthly",
          benefits: job.benefits ?? [],
          requirements: job.requirements ?? "",
          skills: job.skills ?? [],
          openings: job.openings ?? 1,
          job_role: job.job_role ?? "",
          work_location: job.work_location ?? WORK_LOCATIONS[0],
          contact_person: job.contact_person ?? "",
          contact_mobile: job.contact_mobile ?? "",
          whatsapp_number: job.whatsapp_number ?? "",
          interview_mode: job.interview_mode ?? INTERVIEW_MODES[0],
          shop_id: job.shop_id ?? null,
        });
        setSkillsInput((job.skills ?? []).join(", "));
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load job";
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoadingEdit(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editJobId, user, navigate]);



  const update = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const errors = useMemo(() => validateForm(form), [form]);
  const markAttempted = (i: number) =>
    setAttempted((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  const stepInvalid = (i: number) => {
    if (i === 0) return !!(errors.title || errors.category || errors.description || errors.openings);
    if (i === 1) return !!(errors.city || errors.contact_mobile);
    if (i === 2) return !!(errors.salary_min || errors.salary_max);
    return false;
  };

  

  function tryContinue() {
    if (stepInvalid(step)) {
      markAttempted(step);
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function firstInvalidStep(): number | null {
    for (let i = 0; i <= 3; i++) if (stepInvalid(i)) return i;
    return null;
  }


  async function persist(publish: boolean) {
    if (!user || !profile) {
      setShowSetup(true);
      return;
    }
    if (publish) {
      const bad = firstInvalidStep();
      if (bad !== null) {
        // Reveal errors on every step up through the failing one and jump there.
        setAttempted(new Set([0, 1, 2, 3]));
        setStep(bad);
        setHighlightInvalid(true);
        // Scroll the wizard card into view and pulse the ring highlight.
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            stepCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          window.setTimeout(() => setHighlightInvalid(false), 1600);
        }
        toast.error("Please fix the highlighted fields before publishing.");
        return;
      }
    }
    setSaving(publish ? "publish" : "draft");
    if (publish) setPublishError(null);

    let createdJobId: string | undefined;
    try {
      const cleaned: JobDraftInput = {
        ...form,
        area: form.area || null,
        address: form.address || null,
        schedule: form.schedule || null,
        experience_level: form.experience_level || null,
        requirements: form.requirements || null,
        salary_min: form.salary_min ?? null,
        salary_max: form.salary_max ?? null,
        openings: Math.min(50, Math.max(1, Number(form.openings) || 1)),
        job_role: form.job_role?.trim() || null,
        work_location: form.work_location || null,
        contact_person: form.contact_person?.trim() || null,
        contact_mobile: form.contact_mobile?.trim() || null,
        whatsapp_number: form.whatsapp_number?.trim() || null,
        interview_mode: form.interview_mode || null,
        shop_id: shopId,
      };
      const row = await saveJob({
        jobId,
        employerId: profile.id,
        userId: user.id,
        input: cleaned,
        publish,
      });
      setJobId(row.id);
      createdJobId = row.id;
      if (publish) {
        try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
        toast.success("Job posted successfully.", {
          description: `${row.title} is now live. Share it with candidates or view applications.`,
        });
        setPublishedJob(row);
        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }
      } else {
        toast.success("Draft saved");
      }
    } catch (e: any) {
      const msg = e?.message ?? "Failed to save job";
      if (publish) {
        setPublishError(msg);
      }
      toast.error(msg);
    } finally {
      setSaving(null);
    }
    return createdJobId;
  }

  async function retryPublish() {
    // If the job was already created but only navigation failed, jump straight to it.
    if (jobId) {
      try {
        setPublishError(null);
        await navigate({ to: "/jobs/$jobId", params: { jobId } });
        return;
      } catch (navErr: any) {
        setPublishError(
          `Your job was published but we couldn't open it automatically. ${navErr?.message ?? ""}`.trim(),
        );
        return;
      }
    }
    await persist(true);
  }


  if (!isInitialized || loadingProfile) {
    return (
      <div className="min-h-screen bg-background p-8 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <div className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
          <BackButton size="icon" aria-label="Go back" />
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-lg font-extrabold tracking-tight">Nexora</span>
          </Link>
          <div className="ml-auto text-xs text-muted-foreground">
            Posting as <span className="font-semibold text-heading">{profile?.business_name ?? "—"}</span>
          </div>
        </div>
      </div>

      <EmployerSetupModal open={showSetup} onClose={() => setShowSetup(false)} redirectTo="/hire/post-job" />

      {publishedJob ? (
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:px-6">
          <JobPublishedSuccess
            job={publishedJob}
            profile={profile}
            onPostAnother={() => {
              setPublishedJob(null);
              setJobId(undefined);
              setForm({
                ...EMPTY,
                city: profile?.city ?? "",
                contact_person: profile?.business_name ?? "",
                contact_mobile: profile?.phone ?? "",
                whatsapp_number: profile?.phone ?? "",
              });
              setSkillsInput("");
              setAttempted(new Set());
              setStep(0);
              try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
            }}
          />
        </div>
      ) : (
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-6">
        {draftRestored && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <span className="text-heading">
              Welcome back — we restored your draft at <strong>{STEPS[step].label}</strong>.
            </span>
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem(DRAFT_STORAGE_KEY); } catch {}
                setForm(EMPTY);
                setStep(0);
                setJobId(undefined);
                setSkillsInput("");
                setDraftRestored(false);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold hover:bg-muted"
            >
              Start over
            </button>
          </div>
        )}
        {/* Progress */}
        <div className="mb-6">


          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>
              Step {step + 1} of {STEPS.length} · <span className="text-heading">{STEPS[step].label}</span>
            </span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-gradient-cta h-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-4 hidden gap-2 md:flex">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  i === step
                    ? "bg-gradient-cta text-primary-foreground"
                    : i < step
                    ? "bg-primary/10 text-heading"
                    : "bg-card text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div
              ref={stepCardRef}
              data-testid="wizard-step-card"
              data-invalid-step={highlightInvalid ? "true" : "false"}
              className={cn(
                "rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow",
                highlightInvalid && "ring-2 ring-destructive ring-offset-2 border-destructive",
              )}
            >
              {step === 0 && (
                <DetailsStep
                  form={form}
                  update={update}
                  errors={attempted.has(0) ? errors : {}}
                />
              )}
              {step === 1 && (
                <LocationStep
                  form={form}
                  update={update}
                  errors={attempted.has(1) ? errors : {}}
                />
              )}
              {step === 2 && (
                <SalaryStep
                  form={form}
                  update={update}
                  errors={attempted.has(2) ? errors : {}}
                />
              )}

              {step === 3 && (
                <RequirementsStep
                  form={form}
                  update={update}
                  skillsInput={skillsInput}
                  setSkillsInput={setSkillsInput}
                />
              )}
              {step === 4 && (
                <ReviewStep
                  form={form}
                  profile={profile}
                  publishError={publishError}
                  onRetry={retryPublish}
                  onDismissError={() => setPublishError(null)}
                  retrying={saving === "publish"}
                  hasSavedJob={!!jobId}
                />
              )}
            </div>

            {/* Desktop action row */}
            <div className="mt-4 hidden items-center justify-between md:flex">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => persist(false)}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {saving === "draft" ? "Saving…" : "Save draft"}
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={tryContinue}
                    className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>

                ) : (
                  <button
                    type="button"
                    onClick={() => persist(true)}
                    disabled={saving !== null}
                    className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)] disabled:opacity-60"
                  >
                    {saving === "publish" ? "Publishing…" : "Publish job"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live preview
              </p>
              <LivePreview form={form} profile={profile} />
            </div>
          </aside>
        </div>
      </div>
      )}

      {/* Mobile sticky bottom action */}
      {!publishedJob && (
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-border bg-card/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-[var(--radius-button)] border border-border px-3 py-2.5 text-xs font-semibold disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => persist(false)}
          disabled={saving !== null}
          className="rounded-[var(--radius-button)] border border-border px-3 py-2.5 text-xs font-semibold disabled:opacity-60"
        >
          Draft
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={tryContinue}
            className="bg-gradient-cta text-primary-foreground flex-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold"
          >
            Continue
          </button>

        ) : (
          <button
            type="button"
            onClick={() => persist(true)}
            disabled={saving !== null}
            className="bg-gradient-cta text-primary-foreground flex-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        )}
      </div>
      )}
    </div>
  );
}

// ---------- Steps ----------

export type FormErrors = {
  title?: string;
  category?: string;
  description?: string;
  openings?: string;
  city?: string;
  salary_min?: string;
  salary_max?: string;
  contact_mobile?: string;
};

function validateForm(form: Form): FormErrors {
  const errs: FormErrors = {};
  const title = form.title.trim();
  if (title.length === 0) errs.title = "Job title is required.";
  else if (title.length < 3) errs.title = "Job title must be at least 3 characters.";
  else if (title.length > 80) errs.title = "Job title must be 80 characters or fewer.";

  if (!form.category || !form.category.trim())
    errs.category = "Please pick a beauty category.";

  const desc = form.description.trim();
  if (desc.length === 0) errs.description = "Description is required.";
  else if (desc.length < 10) errs.description = "Description must be at least 10 characters.";

  const openings = form.openings;
  if (openings === undefined || openings === null || Number.isNaN(openings))
    errs.openings = "Number of openings is required.";
  else if (!Number.isInteger(openings)) errs.openings = "Openings must be a whole number.";
  else if (openings < 1) errs.openings = "There must be at least 1 opening.";
  else if (openings > 50) errs.openings = "Openings cannot exceed 50.";

  const city = form.city.trim();
  if (city.length === 0) errs.city = "City is required.";
  else if (city.length < 2) errs.city = "Enter a valid city.";

  const mobile = (form.contact_mobile ?? "").replace(/\D/g, "");
  if (mobile.length === 0) errs.contact_mobile = "Contact mobile is required.";
  else if (mobile.length < 10) errs.contact_mobile = "Enter a valid 10-digit mobile.";


  const min = form.salary_min;
  const max = form.salary_max;
  const hasMin = typeof min === "number" && !Number.isNaN(min);
  const hasMax = typeof max === "number" && !Number.isNaN(max);
  if (hasMin && (min as number) < 0) errs.salary_min = "Salary can't be negative.";
  if (hasMax && (max as number) < 0) errs.salary_max = "Salary can't be negative.";
  if (hasMin && !hasMax) errs.salary_max = "Enter a maximum, or clear the minimum.";
  if (!hasMin && hasMax) errs.salary_min = "Enter a minimum, or clear the maximum.";
  if (hasMin && hasMax && (max as number) < (min as number))
    errs.salary_max = "Maximum must be greater than or equal to minimum.";

  return errs;
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-heading mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-xs font-semibold text-destructive">
          {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const inputErrCls =
  "w-full rounded-lg border border-destructive bg-background px-3 py-2.5 text-sm outline-none focus:border-destructive";

function DetailsStep({
  form,
  update,
  errors,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  errors: FormErrors;
}) {
  const GENERAL_ROLES = [
    "Senior Beauty Professional",
    "Junior Beauty Professional",
    "Beauty Assistant",
    "Salon Executive",
    "Freelance Beauty Expert",
    "Trainee",
    "Other",
  ];
  const roleOptions = form.category
    ? ROLE_SUGGESTIONS[form.category] ?? GENERAL_ROLES
    : GENERAL_ROLES;
  const selectedRole = (form.job_role ?? "").trim();
  const titleValue = form.title.trim();
  const titleMatchesRole = selectedRole.length > 0 && titleValue === selectedRole;

  function pickRole(role: string) {
    const next = selectedRole === role ? "" : role;
    const patch: Partial<Form> = { job_role: next };
    // Auto-fill title only when empty, so we never overwrite manual input.
    if (next && titleValue.length === 0) patch.title = next;
    update(patch);
  }

  function applyRoleAsTitle() {
    if (!selectedRole) return;
    update({ title: selectedRole });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Job details</h2>
      <Field label="Job title" error={errors.title} hint={`${form.title.trim().length}/80 characters`}>
        <input
          className={errors.title ? inputErrCls : inputCls}
          placeholder="Example: Senior Hair Stylist"
          aria-invalid={!!errors.title}
          maxLength={80}
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            Select a beauty category and role below to fill this faster.
          </p>
          {selectedRole && !titleMatchesRole && (
            <button
              type="button"
              onClick={applyRoleAsTitle}
              className="text-primary text-xs font-semibold underline-offset-2 hover:underline"
            >
              Use selected role as job title
            </button>
          )}
        </div>
      </Field>
      <Field
        label="Choose beauty category"
        hint="Select a category to see relevant role, skill and job description suggestions."
        error={errors.category}
      >
        <div
          role="radiogroup"
          aria-label="Choose beauty category"
          aria-invalid={!!errors.category}
          className={cn(
            "grid grid-cols-2 gap-2 sm:grid-cols-3 rounded-lg",
            errors.category && "ring-1 ring-destructive p-2",
          )}
        >
          {CATEGORIES.map((c) => {
            const active = form.category === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  if (form.category === c) return;
                  update({ category: c });
                  toast.success(`Suggestions updated for ${c}.`, { duration: 2000 });
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                  active
                    ? "border-primary bg-primary/10 text-heading shadow-[var(--shadow-glow)]"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
        {form.category && (
          <p className="text-muted-foreground mt-2 text-xs">Selected: {form.category}</p>
        )}
      </Field>
      <Field
        label="Specific job role"
        hint={
          form.category
            ? "Tap a suggestion or type your own."
            : "Optional — pick a category above to see quick suggestions."
        }
      >
        <input
          className={inputCls}
          placeholder="Example: Bridal Hair Specialist"
          maxLength={80}
          value={form.job_role ?? ""}
          onChange={(e) => update({ job_role: e.target.value })}
        />
        {roleOptions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {roleOptions.map((role) => {
              const active = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => pickRole(role)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                  )}
                >
                  {role}
                </button>
              );
            })}
          </div>
        )}
      </Field>
      <Field label="Employment type">
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => {
            const active = form.job_type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => update({ job_type: t })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Experience required" hint="Choose the level that best matches this role.">
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE.map((e) => {
            const active = (form.experience_level ?? EXPERIENCE[0]) === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => update({ experience_level: e })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {e}
              </button>
            );
          })}
        </div>
      </Field>
      <Field
        label="Number of openings"
        hint="How many people are you hiring for this role? (1–50)"
        error={errors.openings}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              update({ openings: Math.max(1, (Number(form.openings) || 1) - 1) })
            }
            aria-label="Decrease openings"
            className="h-10 w-10 rounded-lg border border-border bg-background text-lg font-bold text-heading hover:bg-muted disabled:opacity-40"
            disabled={(Number(form.openings) || 1) <= 1}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            step={1}
            className={cn(errors.openings ? inputErrCls : inputCls, "w-24 text-center")}
            aria-invalid={!!errors.openings}
            value={form.openings ?? 1}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                update({ openings: undefined as unknown as number });
                return;
              }
              const n = parseInt(raw, 10);
              if (Number.isNaN(n)) return;
              update({ openings: Math.min(50, Math.max(1, n)) });
            }}
            onBlur={() => {
              if (!form.openings || form.openings < 1) update({ openings: 1 });
            }}
          />
          <button
            type="button"
            onClick={() =>
              update({ openings: Math.min(50, (Number(form.openings) || 1) + 1) })
            }
            aria-label="Increase openings"
            className="h-10 w-10 rounded-lg border border-border bg-background text-lg font-bold text-heading hover:bg-muted disabled:opacity-40"
            disabled={(Number(form.openings) || 1) >= 50}
          >
            +
          </button>
        </div>
      </Field>
      <Field
        label="Job description"
        hint="Describe the role, day-to-day work, and your salon culture."
        error={errors.description}
      >
        <textarea
          className={cn(errors.description ? inputErrCls : inputCls, "min-h-[140px] resize-y")}
          aria-invalid={!!errors.description}
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </Field>
    </div>
  );
}

function LocationStep({
  form,
  update,
  errors,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  errors: FormErrors;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Location & schedule</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="City" error={errors.city}>
          <input
            className={errors.city ? inputErrCls : inputCls}
            aria-invalid={!!errors.city}
            value={form.city}
            onChange={(e) => update({ city: e.target.value })}
          />
        </Field>
        <Field label="Area / locality">
          <input
            className={inputCls}
            value={form.area ?? ""}
            onChange={(e) => update({ area: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Address (optional)">
        <input
          className={inputCls}
          value={form.address ?? ""}
          onChange={(e) => update({ address: e.target.value })}
        />
      </Field>
      <Field label="Schedule" hint="e.g. Mon–Sat, 10 AM – 8 PM">
        <input
          className={inputCls}
          value={form.schedule ?? ""}
          onChange={(e) => update({ schedule: e.target.value })}
        />
      </Field>
      <Field label="Work location">
        <div className="flex flex-wrap gap-2">
          {WORK_LOCATIONS.map((w) => {
            const active = form.work_location === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => update({ work_location: w })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {w}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="mt-2 border-t border-border pt-4">
        <h3 className="text-heading mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Contact details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contact person" hint="Who should candidates reach out to?">
            <input
              className={inputCls}
              placeholder="e.g. Priya (HR)"
              value={form.contact_person ?? ""}
              onChange={(e) => update({ contact_person: e.target.value })}
            />
          </Field>
          <Field label="Contact mobile" error={errors.contact_mobile}>
            <input
              type="tel"
              inputMode="numeric"
              className={errors.contact_mobile ? inputErrCls : inputCls}
              placeholder="10-digit mobile"
              aria-invalid={!!errors.contact_mobile}
              value={form.contact_mobile ?? ""}
              onChange={(e) => update({ contact_mobile: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp number" hint="Optional — leave blank to use the contact mobile.">
            <input
              type="tel"
              inputMode="numeric"
              className={inputCls}
              placeholder="WhatsApp number"
              value={form.whatsapp_number ?? ""}
              onChange={(e) => update({ whatsapp_number: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function SalaryStep({
  form,
  update,
  errors,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  errors: FormErrors;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Salary & benefits</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Min" error={errors.salary_min}>
          <input
            type="number"
            min={0}
            className={errors.salary_min ? inputErrCls : inputCls}
            aria-invalid={!!errors.salary_min}
            value={form.salary_min ?? ""}
            onChange={(e) =>
              update({ salary_min: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Max" error={errors.salary_max}>
          <input
            type="number"
            min={0}
            className={errors.salary_max ? inputErrCls : inputCls}
            aria-invalid={!!errors.salary_max}
            value={form.salary_max ?? ""}
            onChange={(e) =>
              update({ salary_max: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Period">
          <select
            className={inputCls}
            value={form.salary_period ?? "monthly"}
            onChange={(e) => update({ salary_period: e.target.value })}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value ?? "monthly"}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div>
        <span className="text-heading mb-2 block text-sm font-semibold">Benefits</span>
        <div className="flex flex-wrap gap-2">
          {BENEFITS.map((b) => {
            const on = form.benefits.includes(b);

            return (
              <button
                type="button"
                key={b}
                onClick={() =>
                  update({
                    benefits: on ? form.benefits.filter((x) => x !== b) : [...form.benefits, b],
                  })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  on
                    ? "bg-gradient-cta border-transparent text-primary-foreground"
                    : "border-border bg-card text-heading",
                )}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RequirementsStep({
  form,
  update,
  skillsInput,
  setSkillsInput,
}: {
  form: Form;
  update: (p: Partial<Form>) => void;
  skillsInput: string;
  setSkillsInput: (v: string) => void;
}) {
  function addSkill() {
    const v = skillsInput.trim();
    if (!v) return;
    if (form.skills.includes(v)) return;
    update({ skills: [...form.skills, v] });
    setSkillsInput("");
  }
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Requirements</h2>
      <Field label="Skills" hint="Press Enter to add.">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2">
          {form.skills.map((s) => (
            <span
              key={s}
              className="bg-muted text-heading inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
            >
              {s}
              <button
                type="button"
                onClick={() => update({ skills: form.skills.filter((x) => x !== s) })}
                className="text-muted-foreground hover:text-heading"
                aria-label={`Remove ${s}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
            placeholder="e.g. Balayage"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
        </div>
      </Field>
      <Field label="Additional requirements">
        <textarea
          className={cn(inputCls, "min-h-[120px] resize-y")}
          value={form.requirements ?? ""}
          onChange={(e) => update({ requirements: e.target.value })}
        />
      </Field>
      <Field label="Interview mode" hint="How would you like to interview shortlisted candidates?">
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_MODES.map((m) => {
            const active = form.interview_mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => update({ interview_mode: m })}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-transparent bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-heading",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function ReviewStep({
  form,
  profile,
  publishError,
  onRetry,
  onDismissError,
  retrying,
  hasSavedJob,
}: {
  form: Form;
  profile: EmployerProfile | null;
  publishError: string | null;
  onRetry: () => void;
  onDismissError: () => void;
  retrying: boolean;
  hasSavedJob: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Review & publish</h2>
      <p className="text-sm text-muted-foreground">
        Please review the details below. You can go back to edit any section.
      </p>
      {publishError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-[var(--radius-card)] border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-destructive">
              {hasSavedJob ? "Couldn't open your job listing" : "Publish failed"}
            </div>
            <div className="mt-1 text-muted-foreground break-words">{publishError}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-destructive/40 bg-card px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", retrying && "animate-spin")} />
                {retrying ? "Retrying…" : hasSavedJob ? "Open job listing" : "Try again"}
              </button>
              <button
                type="button"
                onClick={onDismissError}
                className="rounded-[var(--radius-button)] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-heading"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      <LivePreview form={form} profile={profile} />
    </div>
  );
}

function LivePreview({ form, profile }: { form: Form; profile: EmployerProfile | null }) {
  const salary =
    form.salary_min || form.salary_max
      ? `₹${form.salary_min ?? ""}${form.salary_max ? `–${form.salary_max}` : ""} ${
          form.salary_period ?? "monthly"
        }`
      : "Salary not disclosed";
  return (
    <article className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-heading text-lg font-bold">{form.title || "Your job title"}</h3>
          <p className="text-muted-foreground text-sm">{profile?.business_name ?? "Your business"}</p>
        </div>
        <span className="bg-primary/10 text-heading rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
          {form.category}
        </span>
      </div>
      <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
        <MapPin className="h-3.5 w-3.5" /> {form.area || "Area"}, {form.city || "City"}
      </div>
      {form.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {form.skills.map((s) => (
            <span
              key={s}
              className="bg-muted text-heading rounded-full px-2 py-0.5 text-[11px] font-semibold"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {form.description && (
        <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{form.description}</p>
      )}
      <div className="border-border mt-4 flex items-end justify-between border-t pt-3">
        <div>
          <div className="text-heading text-sm font-black">{salary}</div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
            {form.job_type}
          </div>
        </div>
        <span className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-4 py-2 text-xs font-bold">
          <Briefcase className="h-3.5 w-3.5" /> Apply
        </span>
      </div>
    </article>
  );
}

function JobPublishedSuccess({
  job,
  profile,
  onPostAnother,
}: {
  job: JobRow;
  profile: EmployerProfile | null;
  onPostAnother: () => void;
}) {
  const salaryText = (() => {
    const min = job.salary_min;
    const max = job.salary_max;
    if (!min && !max) return "Not disclosed";
    const period =
      job.salary_period === "hourly" ? "/hr" : job.salary_period === "yearly" ? "/yr" : "/mo";
    if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()} ${period}`;
    return `₹${(min ?? max)!.toLocaleString()} ${period}`;
  })();
  const locationText = [job.area, job.city].filter(Boolean).join(", ") || job.city;
  const postedDate = new Date(job.published_at ?? job.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[var(--radius-card)] border border-primary/30 bg-card p-6 shadow-[var(--shadow-card)] md:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-heading text-2xl font-extrabold">
            Your job post has been published successfully.
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Candidates can now discover and apply to your listing.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Job title
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-lg font-bold text-heading">
            <Briefcase className="h-4 w-4 text-primary" aria-hidden />
            <span className="truncate">{job.title}</span>
          </dd>
          {profile?.business_name && (
            <div className="mt-1 text-xs text-muted-foreground">at {profile.business_name}</div>
          )}
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Location
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-heading">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            {locationText}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Salary
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-heading">
            <IndianRupee className="h-4 w-4 text-primary" aria-hidden />
            {salaryText}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </dt>
          <dd className="mt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Published
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Posted
          </dt>
          <dd className="mt-1 text-sm font-semibold text-heading">{postedDate}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/owner/jobs"
          className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)]"
        >
          View My Job Posts
        </Link>
        <button
          type="button"
          onClick={onPostAnother}
          className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-heading hover:bg-muted"
        >
          Post Another Job
        </button>
        <Link
          to="/jobs/$jobId"
          params={{ jobId: job.id }}
          className="inline-flex items-center gap-1 rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-heading hover:bg-muted"
        >
          View Applications
        </Link>
      </div>
    </div>
  );
}
