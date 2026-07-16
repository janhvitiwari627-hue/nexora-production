import { useEffect, useState } from "react";
import { Copy, Gift, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { buildReferralSignupUrl } from "@/lib/public-app-url";

export function ReferralPanel() {
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setCode(data?.referral_code ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
