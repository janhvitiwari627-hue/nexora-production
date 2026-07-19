import { getPublicSupabaseConfig } from "./client";

export type SupabaseHealthResult =
  | { ok: true }
  | { ok: false; reason: "configuration" | "connection"; message: string };

/** Performs a read-only check against the project's standard Supabase Auth health endpoint. */
export async function checkSupabaseConnection(signal?: AbortSignal): Promise<SupabaseHealthResult> {
  let config: ReturnType<typeof getPublicSupabaseConfig>;

  try {
    config = getPublicSupabaseConfig();
  } catch (error) {
    return {
      ok: false,
      reason: "configuration",
      message: error instanceof Error ? error.message : "Supabase configuration is unavailable.",
    };
  }

  try {
    const response = await fetch(`${config.supabaseUrl.replace(/\/$/, "")}/auth/v1/health`, {
      method: "GET",
      headers: { apikey: config.supabasePublishableKey },
      signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "connection",
        message: `Supabase health check returned HTTP ${response.status}.`,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "connection",
      message: error instanceof Error ? error.message : "Supabase is unreachable.",
    };
  }
}
