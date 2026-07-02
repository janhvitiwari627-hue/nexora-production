import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isSmsProviderConfigError, SmsNotConfiguredAlert } from "@/lib/sms-provider-error";

/**
 * /customer/verify-otp — verifies the OTP for either channel:
 *  - ?phone=+E164 → SMS OTP (type: "sms")
 *  - ?email=addr  → Email OTP (type: "email")
 * If SMS resend fails because the SMS provider isn't configured, the
 * screen surfaces the same helpful config alert used on /customer/login.
 */
export const Route = createFileRoute("/customer_/verify-otp")({
  head: () => ({ meta: [{ title: "Verify OTP — Nexora Customer App" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    phone: typeof s.phone === "string" ? s.phone : "",
    email: typeof s.email === "string" ? s.email : "",
  }),
  component: VerifyOtpPage,
});

const otpSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code"),
});

// Per-channel cooldowns. Email providers throttle harder than SMS gateways
// (Supabase default: ~60s between email OTPs, ~30s between SMS OTPs), so we
// mirror those windows in the UI to avoid hitting the 429 rate limit.
const RESEND_SECONDS: Record<"sms" | "email", number> = {
  sms: 30,
  email: 60,
};

const RATE_LIMIT_COPY: Record<"sms" | "email", string> = {
  sms: "SMS providers limit how often a code can be sent to the same number. You can request another text once the timer ends.",
  email: "Email providers throttle repeated sends to avoid spam filters flagging the message. You can request another email once the timer ends.",
};

/** Parse "after N seconds" from Supabase 429 rate-limit messages. */
function parseRetryAfter(message?: string | null): number | null {
  if (!message) return null;
  const m = message.match(/after (\d+)\s*seconds?/i);
  return m ? Number(m[1]) : null;
}

function VerifyOtpPage() {
  const { phone, email } = Route.useSearch();
  const channel: "sms" | "email" = email ? "email" : "sms";
  const destination = email || phone;
  const cooldown = RESEND_SECONDS[channel];
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [smsConfigError, setSmsConfigError] = useState<string | null>(null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(cooldown);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const onVerify = async () => {
    setError(null);
    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }
    if (!destination) {
      setError("Missing contact info. Please restart sign in.");
      return;
    }
    setSubmitting(true);
    const { error: verifyError } =
      channel === "email"
        ? await supabase.auth.verifyOtp({
            email: destination,
            token: parsed.data.code,
            type: "email",
          })
        : await supabase.auth.verifyOtp({
            phone: destination,
            token: parsed.data.code,
            type: "sms",
          });
    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message);
      toast.error("Verification failed", { description: verifyError.message });
      return;
    }
    toast.success(channel === "email" ? "Email verified" : "Phone verified", {
      description: "Welcome to Nexora.",
    });
    navigate({ to: "/customer/onboarding" });
  };

  const resend = async () => {
    if (resendIn > 0 || resending) return;
    if (!destination) {
      setError("Missing contact info. Please restart sign in.");
      return;
    }
    setSmsConfigError(null);
    setResending(true);
    const { error: sendError } =
      channel === "email"
        ? await supabase.auth.signInWithOtp({
            email: destination,
            options: { shouldCreateUser: true },
          })
        : await supabase.auth.signInWithOtp({
            phone: destination,
            options: { channel: "sms" },
          });
    setResending(false);
    if (sendError) {
      if (channel === "sms" && isSmsProviderConfigError(sendError.message)) {
        setSmsConfigError(sendError.message);
        return;
      }
      const retryAfter = parseRetryAfter(sendError.message);
      if (retryAfter) {
        setResendIn(retryAfter);
        setRateLimitedUntil(Date.now() + retryAfter * 1000);
        toast.error("Too many requests", {
          description: `Try again in ${retryAfter}s. ${RATE_LIMIT_COPY[channel]}`,
        });
        return;
      }
      toast.error("Couldn't resend OTP", { description: sendError.message });
      return;
    }
    setResendIn(cooldown);
    setRateLimitedUntil(null);
    toast("New code sent", { description: `Sent to ${destination}` });
  };

  return (
    <main className="customer-app bg-background mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {channel === "email" ? "Verify your email" : "Verify your number"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to {destination || (channel === "email" ? "your email" : "your phone")}.
        </p>
      </div>
      {smsConfigError && <SmsNotConfiguredAlert originalMessage={smsConfigError} />}
      <div className="flex flex-col items-center gap-2">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(null);
          }}
          disabled={submitting}
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && (
          <p className="text-xs text-destructive" role="alert">{error}</p>
        )}
      </div>
      <Button
        className="w-full"
        disabled={code.length !== 6 || submitting}
        onClick={onVerify}
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitting ? "Verifying…" : "Verify & continue"}
      </Button>
      <div className="space-y-1 text-center">
        <div className="text-xs text-muted-foreground">
          Didn't get it?{" "}
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0 || resending}
            className="font-medium text-primary underline disabled:no-underline disabled:opacity-60"
          >
            {resending
              ? "Sending…"
              : resendIn > 0
              ? `Resend ${channel === "email" ? "email" : "SMS"} in ${resendIn}s`
              : `Resend ${channel === "email" ? "email" : "SMS"} code`}
          </button>
        </div>
        {resendIn > 0 && (
          <p className="mx-auto max-w-xs text-[11px] leading-snug text-muted-foreground">
            {rateLimitedUntil
              ? `Rate limit hit — ${RATE_LIMIT_COPY[channel]}`
              : RATE_LIMIT_COPY[channel]}
          </p>
        )}
      </div>
      <button
        type="button"
        className="text-center text-xs text-muted-foreground underline"
        onClick={() => history.back()}
      >
        {channel === "email" ? "Change email" : "Change number"}
      </button>
    </main>
  );
}
