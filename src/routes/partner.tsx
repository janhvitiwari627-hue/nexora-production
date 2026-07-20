import { createFileRoute, redirect } from "@tanstack/react-router";
import { PartnerAppLayout } from "@/pages/partner/PartnerAppLayout";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRoles } from "@/lib/auth-redirect";

const ALLOWED_ROLES = new Set(["growth_partner", "district_partner", "super_admin", "admin"]);

export const Route = createFileRoute("/partner")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nexora:postLoginRedirect", location.pathname);
      }
      throw redirect({ to: "/login" });
    }
    const roles = await fetchUserRoles(data.user.id);
    if (!roles.some((r) => ALLOWED_ROLES.has(r))) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Nexora Partner — Growth Partner App" },
      {
        name: "description",
        content: "Manage leads, shops, commissions and payouts as a Nexora Growth Partner.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerAppLayout,
});
