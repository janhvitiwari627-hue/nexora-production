import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
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
 * Uses a non-nested filename (`customer_.login`) so it skips the
 * authenticated /customer layout gate.
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

// E.164-ish: optional +, 8–15 digits total. Client-side only; real
// verification happens server-side once wiring is added.
const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^\+?[0-9\s-]{8,20}$/, "Only digits, spaces, or a leading +"),
});

function CustomerLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [smsConfigError, setSmsConfigError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Supabase expects E.164 (leading +, no spaces/dashes). Strip formatting
  // before calling the API but keep the raw value for the UI.
  const toE164 = (raw: string) => {
    const trimmed = raw.trim().replace(/[\s-]/g, "");
    return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSmsConfigError(null);
    const parsed = phoneSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }
    const e164 = toE164(parsed.data.phone);
    setSubmitting(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({
      phone: e164,
      options: { channel: "sms" },
    });
    setSubmitting(false);
    if (sendError) {
      if (isSmsProviderConfigError(sendError.message)) {
        setSmsConfigError(sendError.message);
        return;
      }
      setError(sendError.message);
      toast.error("Couldn't send OTP", { description: sendError.message });
      return;
    }
    toast.success("OTP sent", { description: `We texted a code to ${e164}` });
    navigate({
      to: "/customer/verify-otp",
      search: { phone: e164 },
    });
  };


  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Welcome to Nexora</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your phone number to continue.
        </p>
      </div>
      {smsConfigError && <SmsNotConfiguredAlert originalMessage={smsConfigError} />}
      <form className="space-y-3" onSubmit={onSubmit} noValidate>
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
          aria-describedby={error ? "phone-error" : undefined}
          disabled={submitting}
        />
        {error && (
          <p id="phone-error" className="text-xs text-destructive" role="alert">
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
