import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Gift, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { buildReferralSignupUrl } from "@/lib/public-app-url";
import { validateReferralCode } from "@/lib/owner.functions";

type ReferrerDetails = {
  code: string;
  name: string;
};

export function ReferralPanel() {
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<ReferrerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const validateReferrer = useServerFn(validateReferralCode);

  useEffect(() => {
    if (!user) {
      setCode(null);
      setReferrer(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setCode(null);
    setReferrer(null);
    setLoading(true);
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code, referred_by")
        .eq("id", user.id)
        .maybeSingle();
      let confirmedReferrer: ReferrerDetails | null = null;
      const referredBy = data?.referred_by?.trim();
      if (referredBy) {
        try {
          const result = await validateReferrer({ data: { code: referredBy } });
          if (result.valid && result.referrerName) {
            confirmedReferrer = { code: referredBy.toUpperCase(), name: result.referrerName };
          }
        } catch {
          // Keep the profile usable if referrer details cannot be refreshed.
        }
      }
      if (!cancelled) {
        setCode(data?.referral_code ?? null);
        setReferrer(confirmedReferrer);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, validateReferrer]);

  const link = code ? buildReferralSignupUrl(code) : "";

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-6">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <h2 className="text-heading text-xl font-black">My referral</h2>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        Share your code or link with friends. Referral rewards will be activated soon.
      </p>

      {loading ? (
        <div className="text-muted-foreground mt-5 text-sm">Loading…</div>
      ) : !code ? (
        <div className="text-muted-foreground mt-5 text-sm">
          Sign in to view your referral code.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {referrer ? (
            <div className="border-primary/20 bg-primary/5 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Invited by
              </p>
              <p className="text-heading mt-1 font-bold">{referrer.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Referrer code{" "}
                <strong className="text-foreground font-mono tracking-wider">
                  {referrer.code}
                </strong>
              </p>
            </div>
          ) : null}

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              My referral code
            </label>
            <div className="border-border bg-background mt-1.5 flex items-center gap-2 rounded-lg border px-3 py-2.5">
              <span className="flex-1 font-mono text-base font-bold tracking-wider">{code}</span>
              <Button size="sm" variant="outline" onClick={() => copy(code, "Code")}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy code
              </Button>
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              My referral link
            </label>
            <div className="border-border bg-background mt-1.5 flex items-center gap-2 rounded-lg border px-3 py-2.5">
              <span className="flex-1 truncate font-mono text-xs">{link}</span>
              <Button size="sm" variant="outline" onClick={() => copy(link, "Link")}>
                <Link2 className="mr-1.5 h-3.5 w-3.5" /> Copy link
              </Button>
            </div>
          </div>

          <p className="text-muted-foreground bg-muted/40 rounded-md px-3 py-2 text-xs">
            Referral rewards will be activated soon. Until then, your invites are still tracked.
          </p>
        </div>
      )}
    </section>
  );
}
