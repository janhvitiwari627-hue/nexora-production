import { useEffect, useState } from "react";
import { Copy, Share2, Sparkles, Gift, Globe } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

const ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://meripahalfasthelp.online";

export function ReferralWelcomePopup() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [open, setOpen] = useState(false);

  const code = profile?.referral_code ?? null;
  const link = code ? `${ORIGIN}/signup?ref=${code}` : "";
  const shareText = `Join me on Nexora & build your own salon website in minutes! Use my referral code ${code}: ${link}`;

  useEffect(() => {
    if (!isInitialized || !user || !code) return;
    const key = `nexora_ref_popup_shown_${user.id}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(key)) return;
    // small delay so it doesn't collide with login redirects
    const t = setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem(key, "1");
    }, 900);
    return () => clearTimeout(t);
  }, [isInitialized, user, code]);

  if (!code) return null;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Build your own salon website — Nexora",
          text: shareText,
          url: link,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Referral message copied");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6 py-6 text-white">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-white text-lg font-bold">
                  Refer & Earn 100 points per friend
                </DialogTitle>
                <DialogDescription className="text-white/85 text-xs">
                  Share your link — friends sign up & build their own salon website.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-4">
          <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-3">
            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              Your referral code
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex-1 font-mono text-xl font-black tracking-wider">{code}</span>
              <Button size="sm" variant="outline" onClick={() => copy(code, "Code")}>
                <Copy className="mr-1 h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              Shareable link
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-md border bg-background px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs">{link}</span>
              <button
                onClick={() => copy(link, "Link")}
                aria-label="Copy link"
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/50 p-2">
              <Gift className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 text-[10px] font-semibold">You get 100 pts</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <Sparkles className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 text-[10px] font-semibold">Friend gets 100 pts</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <Globe className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 text-[10px] font-semibold">Free website</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={share}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share now
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
