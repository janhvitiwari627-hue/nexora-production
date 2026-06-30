import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, Briefcase, Building2, ChevronDown, LayoutDashboard, LogOut, Megaphone, Menu, Package, Phone, Settings, Sparkles, Star, Tag, Target, TrendingUp, Truck, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { LocationChip } from "./LocationChip";
import { useAuthStore } from "@/stores/authStore";
import { pickPrimaryRole, routeForRole } from "@/lib/auth-redirect";
import { BackButton } from "@/components/shared/BackButton";

const ROLE_DASH_LABEL: Record<string, string> = {
  admin: "Admin Panel",
  owner: "Owner Dashboard",
  distributor: "Partner Dashboard",
  district_partner: "Partner Dashboard",
  growth_partner: "Partner Dashboard",
  customer: "My Bookings",
};

const NAV = [
  { to: "/", label: "Home", icon: null },
  { to: "/search", label: "Explore", icon: null },
  { to: "/jobs", label: "Job Portal", icon: Briefcase },
  { to: "/partner/growth", label: "Partner Growth", icon: TrendingUp },
  { to: "/for-owners", label: "Become Owner", icon: null },
] as const;

const PORTAL_MENU = [
  { to: "/portal/brands/register", label: "Brand Registration", icon: Tag },
  { to: "/portal/distributors/register", label: "Distributor Registration", icon: Truck },
  { to: "/portal/brands", label: "Brand Directory", icon: Tag },
  { to: "/portal/distributors", label: "Distributor Directory", icon: Truck },
  { to: "/portal/products", label: "Product Showcase", icon: Package },
  { to: "/portal/sponsored", label: "Sponsored Listings", icon: Star },
  { to: "/portal/business-pages", label: "Business Pages", icon: Building2 },
  { to: "/portal/promotions", label: "Promotion Center", icon: Megaphone },
  { to: "/portal/leads", label: "Lead Opportunities", icon: Target },
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/pricing", label: "Pricing", icon: Users },
  { to: "/portal/contact", label: "Contact Us", icon: Phone },
] as const;

export function PublicHeader({ showBackButton = true }: { showBackButton?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const roles = useAuthStore((s) => s.roles);
  const primaryRole = pickPrimaryRole(roles);
  const dashHref = routeForRole(primaryRole);
  const dashLabel = ROLE_DASH_LABEL[primaryRole] ?? "Dashboard";
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  // Only trust auth state after the component is mounted AND the auth store
  // has finished bootstrapping the session from storage.
  const authResolved = mounted && isInitialized;
  const isAuthed = authResolved && !!user;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const displayName =
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Account");
  const email = user?.email ?? "";
  const avatarUrl =
    profile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    "";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass-panel border-b border-border/60 shadow-[var(--shadow-card)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-6">
        {/* Back + Logo */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <BackButton size="icon" className="shrink-0" aria-label="Go back" />
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-cta grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-gradient-brand text-xl font-extrabold tracking-tight">
              Nexora
            </span>
          </Link>
        </div>

        {/* Center nav */}
        <nav className="hidden items-center justify-center gap-1 md:flex">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-body transition hover:bg-muted hover:text-heading [&.active]:bg-muted [&.active]:text-heading"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {n.label}
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-body transition hover:bg-muted hover:text-heading">
                Distributor & Brand Portal
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64">
              <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Distributor & Brand Portal
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PORTAL_MENU.map((m) => (
                <DropdownMenuItem key={m.to} asChild>
                  <Link to={m.to} className="cursor-pointer">
                    <m.icon className="mr-2 h-4 w-4" />
                    {m.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-1 md:flex">
          {isAuthed && (
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
            </Button>
          )}
          <LocationChip className="mr-1 hidden lg:inline-flex" />

          {!authResolved ? (
            <div className="flex items-center gap-2 px-1">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-1 flex items-center gap-2 rounded-full bg-muted px-2 py-1 pr-3 text-heading ring-1 ring-border transition hover:bg-card hover:shadow-[var(--shadow-card)]"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-7 w-7">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                    <AvatarFallback className="bg-gradient-cta text-[11px] font-bold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate text-sm font-semibold">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-heading">{displayName}</span>
                  {email && (
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {email}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={dashHref} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {dashLabel}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setLogoutOpen(true);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="font-semibold" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button
                className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] font-semibold shadow-[var(--shadow-glow)] hover:opacity-95"
                asChild
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthed && (
            <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
              <Link to="/dashboard/notifications"><Bell className="h-5 w-5" /></Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <MobileMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout from Nexora?</AlertDialogTitle>
            <AlertDialogDescription>
              You can sign in again anytime with your email and password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
