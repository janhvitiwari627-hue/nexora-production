import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/customer/support/add-ticket")({
  head: () => ({ meta: [{ title: "New support ticket — Nexora" }] }),
  component: AddTicketPage,
});

const CATEGORIES = ["booking", "payment", "account", "other"] as const;

const ticketSchema = z.object({
  category: z.enum(CATEGORIES),
  subject: z
    .string()
    .trim()
    .min(4, "Give your ticket a short subject")
    .max(120, "Subject must be under 120 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Please describe the issue (at least 10 characters)")
    .max(2000, "Message must be under 2000 characters"),
});

type FieldErrors = Partial<Record<"subject" | "message", string>>;

function AddTicketPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("booking");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ticketSchema.safeParse({ category, subject, message });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success("Ticket submitted", {
      description: "Our support team usually replies within a few hours.",
    });
    navigate({ to: "/customer/support" });
  };

  const messageCount = message.trim().length;

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-2xl font-bold">Raise a ticket</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what happened and we'll get back to you.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as (typeof CATEGORIES)[number])}
            disabled={submitting}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">Booking issue</SelectItem>
              <SelectItem value="payment">Payment / refund</SelectItem>
              <SelectItem value="account">Account & profile</SelectItem>
              <SelectItem value="other">Something else</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            maxLength={120}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((p) => ({ ...p, subject: undefined }));
            }}
            aria-invalid={errors.subject ? "true" : undefined}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.subject && (
            <p id="subject-error" className="text-xs text-destructive" role="alert">
              {errors.subject}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="message">Describe the issue</Label>
            <span className="text-[11px] text-muted-foreground">{messageCount}/2000</span>
          </div>
          <Textarea
            id="message"
            rows={5}
            value={message}
            maxLength={2000}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
            }}
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby={errors.message ? "message-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.message && (
            <p id="message-error" className="text-xs text-destructive" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Submitting…" : "Submit ticket"}
        </Button>
      </form>
    </main>
  );
}
