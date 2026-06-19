import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpOpen(true);
      toast.success("OTP sent to your authenticator");
    }, 900);
  };

  const verify = () => {
    if (otp.length !== 6) return toast.error("Enter 6-digit code");
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setOtpOpen(false);
      toast.success("Welcome, Admin");
      navigate({ to: "/admin/dashboard" });
    }, 700);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <Card className="w-full max-w-md border-white/10 bg-slate-900/70 backdrop-blur text-slate-100 shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 grid place-items-center shadow-lg">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Nexora Admin</h1>
            <p className="text-sm text-slate-400">Restricted access — authorized personnel only</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexora.app"
                className="mt-1 bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <Label className="text-slate-300">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="mt-1 bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Sign In Securely
            </Button>
          </form>

          <div className="text-xs text-slate-500 text-center border-t border-white/10 pt-4">
            Protected by 2-factor authentication. All sign-ins are logged.
          </div>
        </CardContent>
      </Card>

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Two-Factor Verification
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={verify} disabled={verifying} className="w-full">
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify & Continue
            </Button>
            <button className="text-xs text-muted-foreground hover:text-primary">
              Use backup code instead
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
