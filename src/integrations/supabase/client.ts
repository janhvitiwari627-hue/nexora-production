import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

type PublicBackendConfig = {
  supabaseUrl: string;
  supabasePublishableKey: string;
};

export function getPublicSupabaseConfig(): PublicBackendConfig {
  const runtimeConfig = (
    globalThis as typeof globalThis & {
      __NEXORA_BACKEND_CONFIG__?: PublicBackendConfig;
    }
  ).__NEXORA_BACKEND_CONFIG__;

  // Vite replaces VITE_* values in the browser bundle. The runtime config keeps
  // SSR deployments portable when only server environment variables are set.
  const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL || runtimeConfig?.supabaseUrl || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    runtimeConfig?.supabasePublishableKey ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["VITE_SUPABASE_URL or SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY
        ? ["VITE_SUPABASE_PUBLISHABLE_KEY or SUPABASE_PUBLISHABLE_KEY"]
        : []),
    ];
    throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}.`);
  }

  return { supabaseUrl: SUPABASE_URL, supabasePublishableKey: SUPABASE_PUBLISHABLE_KEY };
}

function createSupabaseClient() {
  const { supabaseUrl, supabasePublishableKey } = getPublicSupabaseConfig();

  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) {
      _supabase = createSupabaseClient();
    }
    return Reflect.get(_supabase, prop, receiver);
  },
});
