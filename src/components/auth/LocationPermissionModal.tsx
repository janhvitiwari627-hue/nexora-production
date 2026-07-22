import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
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
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { CustomerLocationDialog } from "@/pages/customer/app/CustomerLocationDialog";

const DISMISS_KEY = "nx_location_prompt_dismissed_v2";

/**
 * One-time explanation before opening the full GPS/search/map confirmation flow.
 * The actual coordinates are saved only after the customer confirms the map pin.
 */
export function LocationPermissionModal() {
  const [open, setOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { location, save } = useCustomerLocation();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) return;
      if (localStorage.getItem(DISMISS_KEY)) return;
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("latitude, longitude")
        .eq("id", userRes.user.id)
        .maybeSingle();
      if (!cancelled && (profile?.latitude == null || profile?.longitude == null)) setOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSelector = () => {
    localStorage.setItem(DISMISS_KEY, "opened");
    setOpen(false);
    setSelectorOpen(true);
  };

  const skip = () => {
    localStorage.setItem(DISMISS_KEY, "skipped");
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : skip())}>
        <DialogContent className="customer-brand-surface border-[#d9c38a] bg-[#fffaf0] sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#0b0a08]">
              <MapPin className="h-6 w-6 text-[#f3cf70]" />
            </div>
            <DialogTitle className="text-center">Find salons near you</DialogTitle>
            <DialogDescription className="text-center">
              Confirm a precise map pin so nearby salons can be sorted by distance. You can also
              search manually and location is never shared with salons.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button variant="ghost" onClick={skip}>
              <X className="mr-2 h-4 w-4" /> Not now
            </Button>
            <Button
              onClick={openSelector}
              className="bg-[#0b0a08] font-bold text-[#f3cf70] hover:bg-[#241b0d]"
            >
              <MapPin className="mr-2 h-4 w-4" /> Set location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomerLocationDialog
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        initialLocation={location}
        onSave={async (nextLocation) => {
          await save(nextLocation);
          localStorage.setItem(DISMISS_KEY, "granted");
        }}
      />
    </>
  );
}
