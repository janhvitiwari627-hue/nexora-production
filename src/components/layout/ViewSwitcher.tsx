import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const KEY = "nexora:browseAsCustomer";

/**
 * Compact segmented control that lets shop owners flip between the owner
 * dashboard and the customer app. Renders nothing for non-owner users.
 *
 * `mode` should reflect the surface the switcher is rendered on so the
 * active pill highlights correctly.
 */
export function ViewSwitcher({
  mode,
  className = "",
}: {
  mode: "owner" | "customer";
  className?: string;
}) {
  const roles = useAuthStore((s) => s.roles);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isOwner =
    mounted &&
    roles.some((r) => r === "owner" || r === "shop_owner" || r === "shop_manager");
  // The Customer App now ships as a separate product; this switcher
  // has no destination on the public website and always renders nothing.
  void mode;
  void navigate;
  if (!isOwner) return null;
  return null;

  const goOwner = () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch { /* ignore */ }
    navigate({ to: "/owner/dashboard" });
  };
  const goCustomer = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch { /* ignore */ }
    navigate({ to: "/" });
  };

  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition";
  const active = "bg-primary text-primary-foreground shadow-sm";
  const inactive = "text-muted-foreground hover:text-heading";

  return (
    <div
      role="tablist"
      aria-label="Switch view"
      className={`inline-flex items-center rounded-full border border-border/70 bg-muted/60 p-0.5 ${className}`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "owner"}
        onClick={goOwner}
        className={`${base} ${mode === "owner" ? active : inactive}`}
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        Owner
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "customer"}
        onClick={goCustomer}
        className={`${base} ${mode === "customer" ? active : inactive}`}
      >
        <UserCircle2 className="h-3.5 w-3.5" />
        Customer
      </button>
    </div>
  );
}
