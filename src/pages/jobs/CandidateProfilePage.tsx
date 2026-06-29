import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const STEPS = [
  "Personal",
  "Skills",
  "Experience",
  "Education",
  "Certifications",
  "Portfolio",
  "Video",
  "Resume",
];

export function CandidateProfilePage() {
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
