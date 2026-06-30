import { useState } from "react";
import {
  Bell,
  CreditCard,
  Gift,
  Globe2,
  Home,
  Link2,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  UserCircle,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/BackButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/authStore";
import { PersonalInfoPanel } from "./settings/PersonalInfoPanel";
import { ContactInfoPanel } from "./settings/ContactInfoPanel";
import { SecurityPanel } from "./settings/SecurityPanel";
import { LanguagePanel } from "./settings/LanguagePanel";
import { NotificationsPanel } from "./settings/NotificationsPanel";
import { PrivacyPanel } from "./settings/PrivacyPanel";
import { ConnectedAccountsPanel } from "./settings/ConnectedAccountsPanel";
import { PaymentMethodsPanel } from "./settings/PaymentMethodsPanel";
import { ReferralPanel } from "./settings/ReferralPanel";

const SECTIONS = [
  { id: "personal", label: "Personal info", icon: User, Comp: PersonalInfoPanel },
  { id: "contact", label: "Contact info", icon: Mail, Comp: ContactInfoPanel },
  { id: "referral", label: "My referral", icon: Gift, Comp: ReferralPanel },
  { id: "security", label: "Security", icon: Lock, Comp: SecurityPanel },
  { id: "language", label: "Language & region", icon: Globe2, Comp: LanguagePanel },
  { id: "notifications", label: "Notifications", icon: Bell, Comp: NotificationsPanel },
  { id: "privacy", label: "Privacy", icon: ShieldCheck, Comp: PrivacyPanel },
  { id: "connected", label: "Connected accounts", icon: Link2, Comp: ConnectedAccountsPanel },
  { id: "payments", label: "Payment methods", icon: CreditCard, Comp: PaymentMethodsPanel },
  { id: "profile-card", label: "Profile preview", icon: UserCircle, Comp: ProfilePreviewPanel },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function AccountSettingsPage() {
  const [active, setActive] = useState<SectionId>("personal");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const ActiveComp = SECTIONS.find((s) => s.id === active)!.Comp;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      navigate({ to: "/login", replace: true });
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };


  return (
    <>
    <div className="bg-background min-h-screen">

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <BackButton />
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/dashboard">
                <Home className="h-4 w-4" /> Home
              </Link>
            </Button>
          </div>
          <h1 className="text-heading text-3xl font-black md:text-4xl">Account settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your profile, security, payments and preferences.
          </p>
        </header>

        {/* Mobile scroll tabs */}
        <nav className="-mx-4 mb-5 overflow-x-auto px-4 md:hidden">
          <div className="flex gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <nav className="bg-card border-border sticky top-6 space-y-1 rounded-[var(--radius-card-lg)] border p-2">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </button>
                );
              })}

              <div className="border-border my-2 border-t" />

              <button
                onClick={() => setLogoutOpen(true)}
                className="text-foreground hover:bg-destructive/5 hover:text-destructive flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </aside>

          <div className="min-w-0">
            <ActiveComp />

            {/* Mobile logout */}
            <div className="mt-6 md:hidden">
              <Button
                variant="outline"
                onClick={() => setLogoutOpen(true)}
                className="hover:border-destructive/40 hover:text-destructive w-full gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout from Nexora?</AlertDialogTitle>
            <AlertDialogDescription>
              You can sign in again anytime with your email and password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </div>
    </>
  );
}


function ProfilePreviewPanel() {
  return (
    <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-6">
      <h2 className="text-heading text-xl font-black">Profile preview</h2>
      <p className="text-muted-foreground mt-1 text-sm">This is how others see you on Nexora.</p>
      <div className="border-border bg-background mt-5 flex items-center gap-4 rounded-xl border p-4">
        <div className="bg-primary/15 text-primary grid h-16 w-16 place-items-center rounded-full text-xl font-black">
          AS
        </div>
        <div>
          <p className="text-heading text-lg font-black">Aarav Sharma</p>
          <p className="text-muted-foreground text-sm">@aarav.sharma · Bengaluru, IN</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Gold member · 24 bookings · 8 reviews
          </p>
        </div>
      </div>
    </section>
  );
}
