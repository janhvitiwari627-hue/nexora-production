import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Catch-all for `/customer-app/*` (any sub-path).
 *
 * `/customer-app` is strictly the download/landing page — nothing else lives
 * under it. Any deeper navigation (typos, stale share links, third-party
 * deep links, or accidental in-app pushes) redirects back into the customer
 * app shell:
 *   - authenticated → /customer/home
 *   - unauthenticated → /customer/login
 *
 * This keeps the marketing landing scoped to a single URL and never leaks
 * PublicWebsiteLayout into what users experience as the app.
 */
export const Route = createFileRoute("/customer-app/$")({
  ssr: false,
  beforeLoad: async () => {
    let authed = false;
    try {
      const { data } = await supabase.auth.getUser();
      authed = !!data.user;
    } catch {
      authed = false;
    }
    throw redirect({ to: authed ? "/customer/home" : "/customer/login" });
  },
  // The component never renders — beforeLoad always throws a redirect —
  // but TanStack still requires one to be exported.
  component: () => null,
});
