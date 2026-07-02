import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, Briefcase, Check, MapPin, RefreshCw, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  getMyEmployerProfile,
  saveJob,
  type EmployerProfile,
  type JobDraftInput,
} from "@/lib/jobs";
import { EmployerSetupModal } from "@/pages/jobs/EmployerSetupModal";
import { BackButton } from "@/components/shared/BackButton";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Hair",
  "Skin",
  "Makeup",
  "Nails",
  "Spa & Massage",
  "Barber",
  "Front Desk",
  "Management",
  "Other",
];
const JOB_TYPES = ["Full-time", "Part-time", "Freelance", "Internship"];
const EXPERIENCE = ["Fresher", "1–3 years", "3–5 years", "5+ years"];
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
  category: CATEGORIES[0],
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
  const { user, isInitialized } = useAuthStore();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const initialDraft = typeof window !== "undefined" ? loadDraft() : null;
  const [step, setStep] = useState<number>(initialDraft?.step ?? 0);
  const [form, setForm] = useState<Form>(initialDraft?.form ?? EMPTY);
  const [jobId, setJobId] = useState<string | undefined>(initialDraft?.jobId);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [skillsInput, setSkillsInput] = useState(initialDraft?.skillsInput ?? "");
  const [draftRestored, setDraftRestored] = useState<boolean>(!!initialDraft && (initialDraft.step > 0 || initialDraft.form.title.length > 0));
  const [publishError, setPublishError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [highlightInvalid, setHighlightInvalid] = useState(false);
  const stepCardRef = useRef<HTMLDivElement | null>(null);

  // Persist wizard state to localStorage so it survives session expiry / re-login.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: PersistedDraft = { step, form, jobId, skillsInput, userId: user?.id };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [step, form, jobId, skillsInput, user?.id]);

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
        else if (!form.city) setForm((f) => ({ ...f, city: p.city }));
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, user]);


  const update = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const errors = useMemo(() => validateForm(form), [form]);
  const markAttempted = (i: number) =>
    setAttempted((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));

  const stepInvalid = (i: number) => {
    if (i === 0) return !!(errors.title || errors.description);
    if (i === 1) return !!errors.city;
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
        toast.success("Job published successfully");
        try {
          await navigate({ to: "/jobs/$jobId", params: { jobId: row.id } });
        } catch (navErr: any) {
          // Job was created but navigation failed — surface a retry that goes to detail page.
          setPublishError(
            `Your job was published but we couldn't open it automatically. ${navErr?.message ?? ""}`.trim(),
          );
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
            <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-[var(--shadow-card)]">
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

      {/* Mobile sticky bottom action */}
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
    </div>
  );
}

// ---------- Steps ----------

export type FormErrors = {
  title?: string;
  description?: string;
  city?: string;
  salary_min?: string;
  salary_max?: string;
};

function validateForm(form: Form): FormErrors {
  const errs: FormErrors = {};
  const title = form.title.trim();
  if (title.length === 0) errs.title = "Job title is required.";
  else if (title.length < 3) errs.title = "Job title must be at least 3 characters.";
  else if (title.length > 100) errs.title = "Job title must be 100 characters or fewer.";

  const desc = form.description.trim();
  if (desc.length === 0) errs.description = "Description is required.";
  else if (desc.length < 10) errs.description = "Description must be at least 10 characters.";

  const city = form.city.trim();
  if (city.length === 0) errs.city = "City is required.";
  else if (city.length < 2) errs.city = "Enter a valid city.";

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
  return (
    <div className="space-y-4">
      <h2 className="text-heading text-xl font-bold">Job details</h2>
      <Field label="Job title" error={errors.title}>
        <input
          className={errors.title ? inputErrCls : inputCls}
          placeholder="e.g. Senior Hair Stylist"
          aria-invalid={!!errors.title}
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Category">
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => update({ category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Job type">
          <select
            className={inputCls}
            value={form.job_type}
            onChange={(e) => update({ job_type: e.target.value })}
          >
            {JOB_TYPES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label="Description"
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
      <Field label="Experience level">
        <select
          className={inputCls}
          value={form.experience_level ?? EXPERIENCE[0]}
          onChange={(e) => update({ experience_level: e.target.value })}
        >
          {EXPERIENCE.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </Field>
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
