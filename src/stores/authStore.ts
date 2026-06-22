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

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialize: () => Promise<() => void>;
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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  role: null,
  roles: [],
  isLoading: true,
  isInitialized: false,

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
        // Clear cached profile/session helpers but preserve Supabase's own keys
        // (signOut already cleared those). Wipe sessionStorage entirely.
        sessionStorage.clear();
        // Notify other tabs
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

  initialize: async () => {
    set({ isLoading: true });

    // Bootstrap from current session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { profile, roles } = await loadProfileAndRoles(session.user.id);
      set({
        session,
        user: session.user,
        profile,
        roles,
        role: roles[0] ?? null,
      });
    }
    set({ isLoading: false, isInitialized: true });

    // Subscribe to future auth changes — defer Supabase calls to avoid deadlocks
    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      set({ session: nextSession, user: nextSession?.user ?? null });

      if (event === "SIGNED_OUT" || !nextSession?.user) {
        set({ profile: null, role: null, roles: [] });
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        const userId = nextSession.user.id;
        setTimeout(async () => {
          const { profile, roles } = await loadProfileAndRoles(userId);
          set({ profile, roles, role: roles[0] ?? null });
        }, 0);

        // Record a login event once per browser session
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
}));
