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

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

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
                  <div className="font-medium">{resume || "Upload PDF resume"}</div>
                  <input
                    hidden
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResume(e.target.files?.[0]?.name || "")}
                  />
                </label>
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>Continue</Button>
              ) : (
                <Button onClick={() => toast.success("Profile saved")}>
                  <Check className="h-4 w-4" /> Finish
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
