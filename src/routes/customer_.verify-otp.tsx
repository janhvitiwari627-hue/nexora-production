import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useState } from "react";

export const Route = createFileRoute("/customer/verify-otp")({
  head: () => ({
    meta: [{ title: "Verify OTP — Nexora Customer App" }],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    phone: typeof s.phone === "string" ? s.phone : "",
  }),
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const { phone } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your number</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to {phone || "your phone"}.
        </p>
      </div>
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button
        className="w-full"
        disabled={code.length !== 6}
        onClick={() => navigate({ to: "/customer/onboarding" })}
      >
        Verify & continue
      </Button>
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
