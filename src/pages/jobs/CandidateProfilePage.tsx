import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, CheckCircle2, Loader2, Plus, RefreshCw, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { ProfileImageDropzone } from "@/components/shared/ProfileImageDropzone";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

const STEPS = [
  "Personal",
  "Skills",
  "Experience",
  "Education",
  "Certifications",
  "Portfolio",
  "Video",
  "Resume",
  "Review & Submit",
];

export function CandidateProfilePage() {
  const { user, profile, refreshProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState({ name: "", email: "", phone: "", city: "", bio: "" });
  const [skills, setSkills] = useState<string[]>(["Hair Coloring", "Keratin"]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState([{ company: "", role: "", from: "", to: "" }]);
  const [education, setEducation] = useState([{ school: "", course: "", year: "" }]);
  const [certs, setCerts] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [video, setVideo] = useState<string>("");
  const [resume, setResume] = useState<string>("");
  const [uploadingResume, setUploadingResume] = useState(false);

  const [avatar, setAvatar] = useState<string>(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  useEffect(() => {
    setAvatar(profile?.avatar_url || "");
  }, [profile?.avatar_url]);

  function classifyUploadError(err: unknown, stage: "upload" | "sign" | "profile"): string {
    if (!navigator.onLine) {
      return "You appear to be offline. Check your connection and tap Retry.";
    }
    const anyErr = err as { name?: string; message?: string; statusCode?: number; status?: number };
    const raw = (anyErr?.message ?? "").toString();
    const lower = raw.toLowerCase();
    const status = Number(anyErr?.statusCode ?? anyErr?.status ?? 0);

    if (anyErr?.name === "AbortError" || lower.includes("timeout") || lower.includes("timed out")) {
      return "The upload timed out. Please check your connection and try again.";
    }
    if (lower.includes("network") || lower.includes("failed to fetch") || lower.includes("load failed")) {
      return "Network error while uploading. Please try again.";
    }
    if (status === 401 || lower.includes("unauthorized") || lower.includes("jwt")) {
      return "Your session has expired. Please sign in again and retry.";
    }
    if (status === 403 || lower.includes("row-level security") || lower.includes("not allowed")) {
      return "You don't have permission to upload this image.";
    }
    if (status === 413 || lower.includes("payload too large") || lower.includes("too large")) {
      return "That image is too large. Please choose a file under 5 MB.";
    }
    if (status === 415 || lower.includes("mime") || lower.includes("content type")) {
      return "Unsupported image type. Please use JPG, PNG, or WEBP.";
    }
    if (status === 429 || lower.includes("rate")) {
      return "Too many uploads in a short time. Please wait a moment and retry.";
    }
    if (lower.includes("could not decode") || lower.includes("invalid image") || lower.includes("decode")) {
      return "We couldn't read this image file. It may be corrupted — please try a different one.";
    }
    if (status >= 500) {
      return "The server had a problem saving your photo. Please try again shortly.";
    }
    switch (stage) {
      case "upload":  return "We couldn't upload your photo. Please try again.";
      case "sign":    return "Uploaded, but we couldn't generate a preview link. Please retry.";
      case "profile": return "Photo uploaded, but saving it to your profile failed. Please retry.";
    }
  }

  async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const e = new Error(`${label} timed out`);
        (e as Error & { name: string }).name = "AbortError";
        reject(e);
      }, ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }

  async function handleAvatarFile(file: File) {
    if (!user) {
      const msg = "Please sign in to upload a profile image.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }
    setUploadError(null);
    setUploading(true);
    setUploadProgress(10);
    const preview = URL.createObjectURL(file);
    setAvatar(preview);
    let stage: "upload" | "sign" | "profile" = "upload";
    try {
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      setUploadProgress(35);
      const { error: upErr } = await withTimeout(
        supabase.storage
          .from("profile-images")
          .upload(path, file, { upsert: true, contentType: file.type }),
        30_000,
        "Upload",
      );
      if (upErr) throw upErr;
      stage = "sign";
      setUploadProgress(70);
      const { data: signed, error: signErr } = await withTimeout(
        supabase.storage.from("profile-images").createSignedUrl(path, 60 * 60 * 24 * 365),
        15_000,
        "Sign URL",
      );
      if (signErr) throw signErr;
      const url = signed.signedUrl;
      stage = "profile";
      setUploadProgress(90);
      const { error: updErr } = await withTimeout(
        Promise.resolve(supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id)),
        15_000,
        "Save profile",
      );
      if (updErr) throw updErr;
      setUploadProgress(100);
      setAvatar(url);
      setLastFailedFile(null);
      await refreshProfile();
      toast.success("Profile image updated");
    } catch (err) {
      console.error("[candidate profile image] stage=", stage, err);
      const msg = classifyUploadError(err, stage);
      setUploadError(msg);
      setLastFailedFile(file);
      toast.error(msg);
      setAvatar(profile?.avatar_url || "");
    } finally {
      URL.revokeObjectURL(preview);
      setUploading(false);
      setTimeout(() => setUploadProgress(null), 400);
    }
  }

  function handleRetryUpload() {
    if (lastFailedFile) void handleAvatarFile(lastFailedFile);
  }

  async function handleAvatarRemove() {
    if (!user) return;
    const previous = avatar;
    setAvatar("");
    setUploadError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile image removed");
    } catch (err) {
      console.error("[candidate profile image remove]", err);
      setUploadError("We couldn't remove your profile image. Please try again.");
      toast.error("Could not remove profile image");
      setAvatar(previous);
    }
  }

  async function handleResumeFile(file: File) {
    if (!user) {
      toast.error("Resume upload karne ke liye login karein.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Sirf PDF resume upload karein.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume maximum 5 MB ka ho sakta hai.");
      return;
    }
    setUploadingResume(true);
    try {
      const path = `${user.id}/resume-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("candidate-resumes")
        .upload(path, file, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;
      const { data, error: signError } = await supabase.storage
        .from("candidate-resumes")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signError) throw signError;
      setResume(data.signedUrl);
      toast.success("Resume uploaded securely.");
    } catch (error) {
      console.error("[candidate resume upload]", error);
      toast.error("Resume upload nahi ho paaya. Dobara try karein.");
    } finally {
      setUploadingResume(false);
    }
  }

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    candidateId: string;
    name: string;
    completion: number;
  } | null>(null);

  // Load any existing candidate profile so returning users see their data.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!alive || !data) return;
      setPersonal({
        name: data.full_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        city: data.city ?? "",
        bio: data.bio ?? "",
      });
      if (Array.isArray(data.skills) && data.skills.length) setSkills(data.skills);
      if (Array.isArray(data.experience) && data.experience.length) setExperience(data.experience);
      if (Array.isArray(data.education) && data.education.length) setEducation(data.education);
      if (Array.isArray(data.certifications)) setCerts(data.certifications);
      if (Array.isArray(data.portfolio_urls)) setPortfolio(data.portfolio_urls);
      if (data.video_url) setVideo(data.video_url);
      if (data.resume_url) setResume(data.resume_url);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  function computeCompletion() {
    let filled = 0;
    let total = 6;
    if (personal.name.trim()) filled++;
    if (personal.email.trim()) filled++;
    if (personal.phone.trim()) filled++;
    if (personal.city.trim()) filled++;
    if (skills.length > 0) filled++;
    if (experience.some((e) => e.company || e.role) || education.some((e) => e.school)) filled++;
    return Math.round((filled / total) * 100);
  }

  async function handleSubmitProfile() {
    if (!user) {
      toast.error("Please sign in to submit your profile.");
      return;
    }
    if (!personal.name.trim() || !personal.phone.trim()) {
      const msg = "Please add your full name and phone before submitting.";
      setSubmitError(msg);
      toast.error(msg);
      setStep(0);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        user_id: user.id,
        full_name: personal.name.trim() || null,
        email: personal.email.trim() || null,
        phone: personal.phone.trim() || null,
        city: personal.city.trim() || null,
        bio: personal.bio.trim() || null,
        avatar_url: avatar || null,
        skills,
        experience: experience.filter((e) => e.company || e.role),
        education: education.filter((e) => e.school || e.course),
        certifications: certs,
        portfolio_urls: portfolio,
        video_url: video || null,
        resume_url: resume || null,
        is_submitted: true,
        submitted_at: new Date().toISOString(),
      };
      const { data, error } = await (supabase as any)
        .from("candidate_profiles")
        .upsert(payload, { onConflict: "user_id" })
        .select("id")
        .single();
      if (error) throw error;

      // Also mirror the basics on the shared profile row.
      await (supabase as any)
        .from("profiles")
        .update({
          full_name: payload.full_name,
          mobile: payload.phone,
          city: payload.city,
        })
        .eq("id", user.id);

      await refreshProfile();
      setSubmitted({
        candidateId: data.id as string,
        name: payload.full_name || "Candidate",
        completion: computeCompletion(),
      });
      toast.success("Profile submitted successfully.", {
        description: "You can now apply for jobs.",
      });
    } catch (err) {
      console.error("[candidate profile submit]", err);
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "We couldn't submit your profile. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  if (submitted) {
    return (
      <>
        <PublicPageHeader />
        <div className="mx-auto max-w-2xl space-y-6 p-6">
          <Card>
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-heading text-2xl font-bold">
                  Your candidate profile has been submitted successfully.
                </h1>
                <p className="text-muted-foreground text-sm">
                  You can now apply to jobs and track your applications.
                </p>
              </div>

              <dl className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-left text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Candidate Name
                  </dt>
                  <dd className="font-medium">{submitted.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Profile Completion
                  </dt>
                  <dd className="font-medium">{submitted.completion}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Application Ready
                  </dt>
                  <dd className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <Check className="h-4 w-4" /> Ready to apply
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">
                    Candidate ID
                  </dt>
                  <dd className="font-mono text-xs">{submitted.candidateId}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link to="/jobs/search">Search Jobs</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/jobs/applications">View My Applications</Link>
                </Button>
                <Button variant="ghost" onClick={() => setSubmitted(null)}>
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }


  return (
    <>
      <PublicPageHeader />
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <header>
          <h1 className="text-heading text-2xl font-bold">Your Candidate Profile</h1>
          <p className="text-muted-foreground text-sm">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </header>

        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            {step === 0 && (
              <>
                <Field label="Profile Image">
                  <ProfileImageDropzone
                    value={avatar}
                    onFile={handleAvatarFile}
                    onRemove={handleAvatarRemove}
                    onRetry={handleRetryUpload}
                    canRetry={!!lastFailedFile}
                    uploading={uploading}
                    progress={uploadProgress}
                    error={uploadError}
                  />
                </Field>
                <Field label="Full Name">
                  <Input
                    value={personal.name}
                    onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={personal.email}
                    onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={personal.phone}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  />
                </Field>
                <Field label="City">
                  <Input
                    value={personal.city}
                    onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                  />
                </Field>
                <Field label="Short Bio">
                  <Textarea
                    rows={3}
                    value={personal.bio}
                    onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Add a skill">
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && skillInput.trim()) {
                          setSkills([...skills, skillInput.trim()]);
                          setSkillInput("");
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (skillInput.trim()) {
                          setSkills([...skills, skillInput.trim()]);
                          setSkillInput("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </Field>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSkills(skills.filter((_, j) => j !== i))}
                    >
                      {s} ✕
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {experience.map((e, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 grid gap-2 rounded-lg border p-3 md:grid-cols-2"
                  >
                    <Input
                      placeholder="Company"
                      value={e.company}
                      onChange={(ev) =>
                        setExperience((p) =>
                          p.map((x, j) => (j === i ? { ...x, company: ev.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="Role"
                      value={e.role}
                      onChange={(ev) =>
                        setExperience((p) =>
                          p.map((x, j) => (j === i ? { ...x, role: ev.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="From (YYYY)"
                      value={e.from}
                      onChange={(ev) =>
                        setExperience((p) =>
                          p.map((x, j) => (j === i ? { ...x, from: ev.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="To (YYYY or Present)"
                      value={e.to}
                      onChange={(ev) =>
                        setExperience((p) =>
                          p.map((x, j) => (j === i ? { ...x, to: ev.target.value } : x)),
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:col-span-2"
                      onClick={() => setExperience((p) => p.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="text-destructive h-4 w-4" /> Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    setExperience((p) => [...p, { company: "", role: "", from: "", to: "" }])
                  }
                >
                  <Plus className="h-4 w-4" /> Add Experience
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                {education.map((e, i) => (
                  <div
                    key={i}
                    className="bg-muted/30 grid gap-2 rounded-lg border p-3 md:grid-cols-3"
                  >
                    <Input
                      placeholder="School/Academy"
                      value={e.school}
                      onChange={(ev) =>
                        setEducation((p) =>
                          p.map((x, j) => (j === i ? { ...x, school: ev.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="Course"
                      value={e.course}
                      onChange={(ev) =>
                        setEducation((p) =>
                          p.map((x, j) => (j === i ? { ...x, course: ev.target.value } : x)),
                        )
                      }
                    />
                    <Input
                      placeholder="Year"
                      value={e.year}
                      onChange={(ev) =>
                        setEducation((p) =>
                          p.map((x, j) => (j === i ? { ...x, year: ev.target.value } : x)),
                        )
                      }
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEducation((p) => [...p, { school: "", course: "", year: "" }])}
                >
                  <Plus className="h-4 w-4" /> Add Education
                </Button>
              </div>
            )}

            {step === 4 && <UploadList label="Certifications" items={certs} setItems={setCerts} />}

            {step === 5 && (
              <UploadList
                label="Portfolio Images"
                items={portfolio}
                setItems={setPortfolio}
                accept="image/*"
              />
            )}

            {step === 6 && (
              <div className="space-y-3">
                <Label>Video Resume (optional)</Label>
                <label className="bg-muted/30 hover:bg-muted grid cursor-pointer place-items-center rounded-xl border-2 border-dashed py-10 text-center">
                  <Video className="text-muted-foreground mb-2 h-8 w-8" />
                  <div className="font-medium">{video || "Click to upload (max 60s)"}</div>
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0]?.name || "")}
                  />
                </label>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-3">
                <Label>Resume (PDF)</Label>
                <label className="bg-muted/30 hover:bg-muted grid cursor-pointer place-items-center rounded-xl border-2 border-dashed py-10 text-center">
                  <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                  <div className="font-medium">
                    {uploadingResume ? "Uploading resume…" : resume ? "Resume uploaded" : "Upload PDF resume"}
                  </div>
                  <input
                    hidden
                    type="file"
                    accept="application/pdf"
                    disabled={uploadingResume}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleResumeFile(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <div className="text-heading mb-2 font-semibold">Review your details</div>
                  <ul className="text-muted-foreground space-y-1">
                    <li><span className="font-medium text-foreground">Name:</span> {personal.name || "—"}</li>
                    <li><span className="font-medium text-foreground">Email:</span> {personal.email || "—"}</li>
                    <li><span className="font-medium text-foreground">Phone:</span> {personal.phone || "—"}</li>
                    <li><span className="font-medium text-foreground">City:</span> {personal.city || "—"}</li>
                    <li><span className="font-medium text-foreground">Skills:</span> {skills.join(", ") || "—"}</li>
                    <li><span className="font-medium text-foreground">Experience:</span> {experience.filter((e) => e.company || e.role).length} entries</li>
                    <li><span className="font-medium text-foreground">Education:</span> {education.filter((e) => e.school).length} entries</li>
                    <li><span className="font-medium text-foreground">Resume:</span> {resume || "—"}</li>
                  </ul>
                </div>
                <p className="text-muted-foreground text-xs">
                  By submitting, your profile becomes visible to employers when you apply for jobs.
                </p>
                {submitError && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    <span>{submitError}</span>
                    <Button size="sm" variant="outline" onClick={handleSubmitProfile} disabled={submitting}>
                      <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>Continue</Button>
              ) : (
                <Button onClick={handleSubmitProfile} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting your profile...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> Submit Profile
                    </>
                  )}
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function UploadList({
  label,
  items,
  setItems,
  accept,
}: {
  label: string;
  items: string[];
  setItems: (v: string[]) => void;
  accept?: string;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <label className="bg-muted/30 hover:bg-muted grid cursor-pointer place-items-center rounded-xl border-2 border-dashed py-10 text-center">
        <Upload className="text-muted-foreground mb-2 h-6 w-6" />
        <div className="text-sm font-medium">Click to upload</div>
        <input
          hidden
          type="file"
          multiple
          accept={accept}
          onChange={(e) =>
            setItems([...items, ...Array.from(e.target.files ?? []).map((f) => f.name)])
          }
        />
      </label>
      {items.length > 0 && (
        <ul className="space-y-1 text-sm">
          {items.map((it, i) => (
            <li key={i} className="bg-muted flex items-center justify-between rounded px-3 py-2">
              {it}{" "}
              <button
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="text-destructive"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
