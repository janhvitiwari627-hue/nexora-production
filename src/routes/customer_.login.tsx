import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isSmsProviderConfigError, SmsNotConfiguredAlert } from "@/lib/sms-provider-error";

/**
 * /customer/login — pre-auth customer entry screen.
 * Supports two OTP channels: phone (SMS) and email. If Supabase's SMS
 * provider is not configured, the UI surfaces a helpful alert and
 * automatically switches to email OTP so users can still sign in.
 */
export const Route = createFileRoute("/customer_/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Nexora Customer App" },
      { name: "description", content: "Sign in to book salons, redeem rewards, and manage your Nexora bookings." },
    ],
  }),
  component: CustomerLoginPage,
});

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^\+?[0-9\s-]{8,20}$/, "Only digits, spaces, or a leading +");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

type Mode = "phone" | "email";

function CustomerLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [smsConfigError, setSmsConfigError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toE164 = (raw: string) => {
    const trimmed = raw.trim().replace(/[\s-]/g, "");
    return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const sendPhoneOtp = async () => {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }
    const e164 = toE164(parsed.data);
    setSubmitting(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { channel: "sms" },
    });
    setSubmitting(false);
    if (sendError) {
      if (isSmsProviderConfigError(sendError.message)) {
        setSmsConfigError(sendError.message);
        // Auto-switch to email fallback so the user has a way forward.
        setMode("email");
        toast("Switched to email OTP", {
          description: "SMS isn't available right now. Try email instead.",
        });
        return;
      }
      setError(sendError.message);
      toast.error("Couldn't send OTP", { description: sendError.message });
      return;
    }
    toast.success("OTP sent", { description: `We texted a code to ${e164}` });
    navigate({ to: "/customer/verify-otp", search: { phone: e164, email: "" } });
  };

  const sendEmailOtp = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    const cleanEmail = parsed.data;
    setSubmitting(true);
    // shouldCreateUser: true so a fresh customer can sign up with just email.
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true },
    });
    setSubmitting(false);
    if (sendError) {
      setError(sendError.message);
      toast.error("Couldn't send OTP", { description: sendError.message });
      return;
    }
    toast.success("OTP sent", { description: `We emailed a code to ${cleanEmail}` });
    navigate({ to: "/customer/verify-otp", search: { phone: "", email: cleanEmail } });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSmsConfigError(null);
    if (mode === "phone") await sendPhoneOtp();
    else await sendEmailOtp();
  };

  return (
    <main className="customer-app bg-background mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Welcome to Nexora</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "phone"
            ? "Enter your phone number to continue."
            : "Enter your email to continue."}
        </p>
      </div>

      {smsConfigError && <SmsNotConfiguredAlert originalMessage={smsConfigError} />}

      <div className="grid grid-cols-2 gap-2 rounded-lg border p-1 text-sm">
        <button
          type="button"
          onClick={() => switchMode("phone")}
          className={`flex items-center justify-center gap-2 rounded-md py-2 transition ${
            mode === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
          aria-pressed={mode === "phone"}
        >
          <Phone className="h-4 w-4" /> Phone
        </button>
        <button
          type="button"
          onClick={() => switchMode("email")}
          className={`flex items-center justify-center gap-2 rounded-md py-2 transition ${
            mode === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
          aria-pressed={mode === "email"}
        >
          <Mail className="h-4 w-4" /> Email
        </button>
      </div>

      <form className="space-y-3" onSubmit={onSubmit} noValidate>
        {mode === "phone" ? (
          <>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={phone}
              maxLength={20}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "otp-error" : undefined}
              disabled={submitting}
            />
          </>
        ) : (
          <>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              maxLength={254}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "otp-error" : undefined}
              disabled={submitting}
            />
          </>
        )}
        {error && (
          <p id="otp-error" className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Sending OTP…" : "Send OTP"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to Nexora's{" "}
        <Link to="/" className="underline">Terms</Link>.
      </p>
    </main>
  );
}
