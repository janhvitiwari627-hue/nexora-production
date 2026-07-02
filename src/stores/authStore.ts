import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Enums"]["app_role"];

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole | null;
  roles: UserRole[];
  isLoading: boolean;
  isInitialized: boolean;
  initError: string | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialize: () => Promise<() => void>;
  retryInitialize: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

async function loadProfileAndRoles(userId: string) {
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roles = (roleRows ?? []).map((r) => r.role as UserRole);
  return { profile: profile ?? null, roles };
}

async function ensureProfileExists(user: User) {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    console.log("[Auth Store] Creating missing profile for user:", user.id);
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
      mobile: user.user_metadata?.mobile ?? null,
      referred_by: user.user_metadata?.referred_by ?? null,
      is_active: true,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[Auth Store] Failed to create profile:", error);
    } else {
      console.log("[Auth Store] Profile created successfully for user:", user.id);
    }
  }
  return loadProfileAndRoles(user.id);
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const loadSessionAndProfile = async () => {
    let session: Session | null = null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes("refresh token") || lower.includes("invalid") || lower.includes("expired")) {
          await supabase.auth.signOut({ scope: "local" }).catch(() => {});
          session = null;
        } else {
          throw error;
        }
      } else {
        session = data.session;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to reach authentication service";
      throw new Error(msg);
    }

    if (session?.user) {
      const { profile, roles } = await ensureProfileExists(session.user);
      set({ session, user: session.user, profile, roles, role: roles[0] ?? null });
    } else {
      set({ session: null, user: null, profile: null, roles: [], role: null });
    }
  };

  return ({
  user: null,
  profile: null,
  session: null,
  role: null,
  roles: [],
  isLoading: true,
  isInitialized: false,
  initError: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setSession: (session) => set({ session, user: session?.user ?? null }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — we still wipe local state below
    }
    set({ user: null, profile: null, session: null, role: null, roles: [] });
    if (typeof window !== "undefined") {
      try {
        sessionStorage.clear();
        localStorage.setItem("nx_auth_event", `signout:${Date.now()}`);
        try {
          const bc = new BroadcastChannel("nx_auth");
          bc.postMessage({ type: "SIGNED_OUT" });
          bc.close();
        } catch {
          // BroadcastChannel may not exist
        }
      } catch {
        // storage may be unavailable
      }
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { profile, roles } = await loadProfileAndRoles(user.id);
    set({ profile, roles, role: roles[0] ?? null });
  },

  hasRole: (role) => get().roles.includes(role),
  hasAnyRole: (roles) => roles.some((r) => get().roles.includes(r)),

  retryInitialize: async () => {
    set({ isLoading: true, initError: null, isInitialized: false });
    try {
      await loadSessionAndProfile();
      set({ isLoading: false, isInitialized: true, initError: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to initialize authentication";
      console.error("[Auth Store] Retry failed:", e);
      set({ isLoading: false, isInitialized: true, initError: msg });
    }
  },

  initialize: async () => {
    console.log("[Auth Store] Initializing auth store...");
    set({ isLoading: true, initError: null });

    try {
      await loadSessionAndProfile();
      set({ initError: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to initialize authentication";
      console.error("[Auth Store] Initialization error:", e);
      set({ initError: msg });
    }

    set({ isLoading: false, isInitialized: true });
    console.log("[Auth Store] Initialization complete");

    // Subscribe to future auth changes — defer Supabase calls to avoid deadlocks
    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log("[Auth Store] Auth state changed:", event, nextSession ? "session exists" : "no session");
      set({ session: nextSession, user: nextSession?.user ?? null });

      if (event === "SIGNED_OUT" || !nextSession?.user) {
        set({ profile: null, role: null, roles: [] });
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const userId = nextSession.user.id;
        setTimeout(async () => {
          console.log("[Auth Store] Loading profile and roles for user:", userId);
          const { profile, roles } = await ensureProfileExists(nextSession.user);
          set({ profile, roles, role: roles[0] ?? null });
        }, 0);

        if (event === "SIGNED_IN" && typeof window !== "undefined") {
          const flagKey = `nx_login_recorded_${nextSession.user.id}`;
          if (!sessionStorage.getItem(flagKey)) {
            sessionStorage.setItem(flagKey, "1");
            setTimeout(async () => {
              try {
                const { recordLoginEvent } = await import("@/lib/security.functions");
                await recordLoginEvent({
                  data: {
                    user_agent: navigator.userAgent.slice(0, 500),
                    device_label: `${navigator.platform || "Browser"}`,
                  },
                });
              } catch {
                // non-fatal; auditing should never block login
              }
            }, 0);
          }
        }
      }
    });

    // Multi-tab sync: if another tab signs out, mirror it here
    let bc: BroadcastChannel | null = null;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "nx_auth_event" && e.newValue?.startsWith("signout")) {
        set({ user: null, profile: null, session: null, role: null, roles: [] });
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      try {
        bc = new BroadcastChannel("nx_auth");
        bc.onmessage = (ev) => {
          if (ev.data?.type === "SIGNED_OUT") {
            set({ user: null, profile: null, session: null, role: null, roles: [] });
          }
        };
      } catch {
        // ignore
      }
    }

    return () => {
      sub.subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
      bc?.close();
    };
  },
  });
});