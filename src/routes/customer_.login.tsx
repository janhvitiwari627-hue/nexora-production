import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

/**
 * /customer/login — pre-auth customer entry screen.
 * Uses a non-nested filename (`customer_.login`) so it skips the
 * authenticated /customer layout gate.
 */
export const Route = createFileRoute("/customer/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Nexora Customer App" },
      { name: "description", content: "Sign in to book salons, redeem rewards, and manage your Nexora bookings." },
    ],
  }),
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const [phone, setPhone] = useState("");
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
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (phone.trim().length >= 8) {
            window.location.assign(`/customer/verify-otp?phone=${encodeURIComponent(phone)}`);
          }
        }}
      >
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" className="w-full">Send OTP</Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to Nexora's{" "}
        <Link to="/" className="underline">Terms</Link>.
      </p>
    </main>
  );
}
