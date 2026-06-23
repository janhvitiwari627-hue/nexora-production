import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { myOwnedSalonsQuery } from "@/lib/owner.queries";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the first salon the signed-in user owns/manages, plus loading state.
 * Used by all owner pages to scope queries to the active salon.
 */
export function useOwnerContext() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthed(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { data, isLoading, error } = useQuery({
    ...myOwnedSalonsQuery(),
    enabled: isAuthed === true,
  });
  const salons = data ?? [];
  const active = salons[0]?.salon ?? null;
  return {
    salons,
    activeSalon: active,
    activeSalonId: active?.id ?? null,
    isLoading: isAuthed === null || (isAuthed && isLoading),
    error,
    hasSalon: !!active,
    isAuthed: isAuthed === true,
  };
}
