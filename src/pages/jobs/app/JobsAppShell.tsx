import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bookmark, BriefcaseBusiness, CircleHelp, FileText, UserRound } from "lucide-react";
import nexoraLogo from "@/assets/nexora-logo.jpg.asset.json";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { to: "/app/jobs", label: "Jobs", icon: BriefcaseBusiness, exact: true },
  { to: "/app/jobs/applications", label: "Applications", icon: FileText },
  { to: "/app/jobs/profile", label: "Profile", icon: UserRound },
  { to: "/app/jobs/saved", label: "Saved", icon: Bookmark },
  { to: "/app/jobs/support", label: "Support", icon: CircleHelp },
] as const;

export function JobsAppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, profile } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link to="/app/jobs" className="flex min-w-0 items-center gap-2">
            <img src={nexoraLogo.url} alt="Nexora" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="font-black leading-none">Nexora Jobs</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                Beauty Jobs App
              </p>
            </div>
          </Link>
          {user ? (
            <Link
              to="/app/jobs/profile"
              className="ml-auto max-w-36 truncate rounded-full border bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800"
            >
              {profile?.full_name || user.email?.split("@")[0] || "Profile"}
            </Link>
          ) : (
            <div className="ml-auto flex gap-2">
              <Link to="/login" className="rounded-full border px-3 py-2 text-xs font-bold">
                Job seeker login
              </Link>
              <Link
                to="/hire"
                className="rounded-full bg-orange-600 px-3 py-2 text-xs font-bold text-white"
              >
                Employer
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Beauty jobs app navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map((item) => {
            const active = "exact" in item && item.exact
              ? pathname === item.to || pathname === `${item.to}/`
              : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${
                    active ? "text-orange-700" : "text-slate-500"
                  }`}
                >
                  <span className={`rounded-full px-4 py-1 ${active ? "bg-orange-100" : ""}`}>
                    <item.icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
