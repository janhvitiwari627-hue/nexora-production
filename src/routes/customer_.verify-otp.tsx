import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/customer_/verify-otp")({
  head: () => ({ meta: [{ title: "Verify OTP — Nexora Customer App" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    phone: typeof s.phone === "string" ? s.phone : "",
  }),
  component: VerifyOtpPage,
});

const otpSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code"),
});

const RESEND_SECONDS = 30;

function VerifyOtpPage() {
  const { phone } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

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
    if (!phone) {
      setError("Missing phone number. Please restart sign in.");
      return;
    }
    setSubmitting(true);
    // `type: "sms"` matches the channel Supabase sent the code on. On success
    // Supabase sets a session in localStorage; onAuthStateChange in
    // __root.tsx picks it up and lets /customer/* pass its auth gate.
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: parsed.data.code,
      type: "sms",
    });
    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message);
      toast.error("Verification failed", { description: verifyError.message });
      return;
    }
    toast.success("Phone verified", { description: "Welcome to Nexora." });
    navigate({ to: "/customer/onboarding" });
  };

  const resend = async () => {
    if (resendIn > 0 || resending) return;
    if (!phone) {
      setError("Missing phone number. Please restart sign in.");
      return;
    }
    setResending(true);
    const { error: sendError } = await supabase.auth.signInWithOtp({
      phone,
      options: { channel: "sms" },
    });
    setResending(false);
    if (sendError) {
      toast.error("Couldn't resend OTP", { description: sendError.message });
      return;
    }
    setResendIn(RESEND_SECONDS);
    toast("New code sent", { description: `Sent to ${phone}` });
  };


  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your number</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to {phone || "your phone"}.
        </p>
      </div>
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
      <div className="text-center text-xs text-muted-foreground">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={resendIn > 0}
          className="font-medium text-primary underline disabled:no-underline disabled:opacity-60"
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </div>
      <button
        type="button"
        className="text-center text-xs text-muted-foreground underline"
        onClick={() => history.back()}
      >
        Change number
      </button>
    </main>
  );
}
