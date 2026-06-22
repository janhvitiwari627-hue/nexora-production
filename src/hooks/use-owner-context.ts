import { useQuery } from "@tanstack/react-query";
import { myOwnedSalonsQuery } from "@/lib/owner.queries";

/**
 * Returns the first salon the signed-in user owns/manages, plus loading state.
 * Used by all owner pages to scope queries to the active salon.
 */
export function useOwnerContext() {
  const { data, isLoading, error } = useQuery(myOwnedSalonsQuery());
  const salons = data ?? [];
  const active = salons[0]?.salon ?? null;
  return {
    salons,
    activeSalon: active,
    activeSalonId: active?.id ?? null,
    isLoading,
    error,
    hasSalon: !!active,
  };
}
