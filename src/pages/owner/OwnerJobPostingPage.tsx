import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

const CATS = [
  "Stylist",
  "Barber",
  "Beautician",
  "Spa Therapist",
  "Nail Artist",
  "Manager",
  "Receptionist",
];
const TYPES = ["Full-time", "Part-time", "Contract", "Freelance"];

export function OwnerJobPostingPage() {
  const [job, setJob] = useState({
    title: "",
    category: "",
    type: "Full-time",
    location: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  });
  const [preview, setPreview] = useState(false);

  const aiGenerate = () => {
    if (!job.title) return toast.error("Add a title first");
    setJob((p) => ({
      ...p,
      description: `We're hiring a talented ${p.title} to join our growing team. You'll work in a fast-paced, premium environment with leading brands and supportive leadership.`,
      responsibilities:
        "Deliver excellent client service\nMaintain hygiene & safety standards\nDrive upsells & retention",
      requirements: "Relevant certification\nMinimum 2 years experience\nCustomer-first attitude",
      benefits: "Health insurance\nPerformance bonus\nPaid training\nStaff discounts",
    }));
    toast.success("AI generated content");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading text-2xl font-bold">Post a Job</h1>
          <p className="text-muted-foreground text-sm">Reach 50,000+ qualified candidates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-4 w-4" /> {preview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={() => toast.success("Job published")}>Publish</Button>
        </div>
      </header>

      {!preview ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Job Title">
                <Input
                  value={job.title}
                  onChange={(e) => setJob({ ...job, title: e.target.value })}
                  placeholder="e.g. Senior Hair Stylist"
                />
              </Field>
              <Field label="Category">
                <Select value={job.category} onValueChange={(v) => setJob({ ...job, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Job Type">
                <Select value={job.type} onValueChange={(v) => setJob({ ...job, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Location">
                <Input
                  value={job.location}
                  onChange={(e) => setJob({ ...job, location: e.target.value })}
                />
              </Field>
              <Field label="Salary Min (₹)">
                <Input
                  type="number"
                  value={job.salaryMin}
                  onChange={(e) => setJob({ ...job, salaryMin: e.target.value })}
                />
              </Field>
              <Field label="Salary Max (₹)">
                <Input
                  type="number"
                  value={job.salaryMax}
                  onChange={(e) => setJob({ ...job, salaryMax: e.target.value })}
                />
              </Field>
              <Field label="Experience" className="md:col-span-2">
                <Input
                  value={job.experience}
                  onChange={(e) => setJob({ ...job, experience: e.target.value })}
                  placeholder="e.g. 2–5 yrs"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between">
              <Label>Description</Label>
              <Button size="sm" variant="outline" onClick={aiGenerate}>
                <Sparkles className="h-3.5 w-3.5" /> AI Generate
              </Button>
            </div>
            <Textarea
              rows={4}
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
            />

            <Field label="Responsibilities (one per line)">
              <Textarea
                rows={4}
                value={job.responsibilities}
                onChange={(e) => setJob({ ...job, responsibilities: e.target.value })}
              />
            </Field>
            <Field label="Requirements (one per line)">
              <Textarea
                rows={4}
                value={job.requirements}
                onChange={(e) => setJob({ ...job, requirements: e.target.value })}
              />
            </Field>
            <Field label="Benefits (one per line)">
              <Textarea
                rows={3}
                value={job.benefits}
                onChange={(e) => setJob({ ...job, benefits: e.target.value })}
              />
            </Field>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-2xl font-bold">{job.title || "Untitled"}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>{job.type}</Badge>
              {job.category && <Badge variant="outline">{job.category}</Badge>}
              {job.location && <Badge variant="outline">{job.location}</Badge>}
              {job.salaryMin && (
                <Badge variant="secondary">
                  ₹{job.salaryMin} – ₹{job.salaryMax}
                </Badge>
              )}
            </div>
            <p className="text-sm">{job.description}</p>
            {(["responsibilities", "requirements", "benefits"] as const).map(
              (k) =>
                job[k] && (
                  <div key={k}>
                    <div className="mb-1 font-semibold capitalize">{k}</div>
                    <ul className="list-disc pl-5 text-sm">
                      {job[k]
                        .split("\n")
                        .filter(Boolean)
                        .map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                    </ul>
                  </div>
                ),
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
