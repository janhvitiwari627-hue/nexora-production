import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { CUSTOMER_LOCATION_ONBOARDING_KEY } from "@/lib/customer-location";
import { CustomerLocationDialog } from "@/pages/customer/app/CustomerLocationDialog";

/**
 * Required first-run location gate. GPS is requested automatically and the
 * customer can fall back to manual address search when browser permission is denied.
 */
export function LocationPermissionModal() {
  const [required, setRequired] = useState(false);
  const { location, save } = useCustomerLocation();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (typeof window === "undefined") return;
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("latitude, longitude")
        .eq("id", userRes.user.id)
        .maybeSingle();
      if (!cancelled && (profile?.latitude == null || profile?.longitude == null)) {
        sessionStorage.setItem(CUSTOMER_LOCATION_ONBOARDING_KEY, "required");
        setRequired(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CustomerLocationDialog
      open={required}
      onOpenChange={setRequired}
      initialLocation={location}
      autoLocate
      required
      onSave={async (nextLocation) => {
        await save(nextLocation);
        sessionStorage.setItem(CUSTOMER_LOCATION_ONBOARDING_KEY, "complete");
        setRequired(false);
      }}
    />
  );
}
