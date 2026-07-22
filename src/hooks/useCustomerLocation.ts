import { useCallback, useEffect, useState } from "react";
import {
  customerLocationFromProfile,
  readStoredCustomerLocation,
  saveCustomerLocation,
  type CustomerLocation,
} from "@/lib/customer-location";
import { useAuthStore } from "@/stores/authStore";

export function useCustomerLocation() {
  const profile = useAuthStore((state) => state.profile);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const [location, setLocation] = useState<CustomerLocation | null>(() =>
    readStoredCustomerLocation(),
  );

  useEffect(() => {
    const profileLocation = customerLocationFromProfile(profile);
    if (profileLocation) setLocation(profileLocation);
  }, [profile]);

  const save = useCallback(
    async (nextLocation: CustomerLocation) => {
      await saveCustomerLocation(nextLocation);
      setLocation(nextLocation);
      await refreshProfile();
      return nextLocation;
    },
    [refreshProfile],
  );

  return { location, save };
}
