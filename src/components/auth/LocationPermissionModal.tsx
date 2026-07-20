import { useEffect, useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const DISMISS_KEY = "nx_location_prompt_dismissed_v1";

/**
 * Shows a one-time prompt asking the customer for GPS permission so we can
 * show nearby salons. Stores lat/lng on the profile. Dismissals are remembered
 * in localStorage so we don't nag.
 */
export function LocationPermissionModal() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) return;
      if (localStorage.getItem(DISMISS_KEY)) return;

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("latitude, longitude")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (profile?.latitude == null || profile?.longitude == null) {
        setOpen(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAllow = () => {
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data: userRes } = await supabase.auth.getUser();
          const user = userRes.user;
          if (!user) return;
          const { error } = await supabase
            .from("profiles")
            .update({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              location_captured_at: new Date().toISOString(),
            })
            .eq("id", user.id);
          if (error) throw error;
          localStorage.setItem(DISMISS_KEY, "granted");
          toast.success("Location saved — showing salons near you");
          setOpen(false);
        } catch (e) {
          toast.error("Couldn't save location. Please try again.");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          localStorage.setItem(DISMISS_KEY, "denied");
          toast.message("Location access denied", {
            description: "You can enable it later from your browser settings.",
          });
          setOpen(false);
        } else {
          toast.error("Couldn't get your location. Please try again.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
    );
  };

  const handleSkip = () => {
    localStorage.setItem(DISMISS_KEY, "skipped");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleSkip())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Find salons near you</DialogTitle>
          <DialogDescription className="text-center">
            Share your location so we can show salons and offers in your area. We only use it to
            personalize results — never shared with third parties.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="ghost" onClick={handleSkip} disabled={busy}>
            <X className="mr-2 h-4 w-4" />
            Not now
          </Button>
          <Button onClick={handleAllow} disabled={busy}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            Share location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
