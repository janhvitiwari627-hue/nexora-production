#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const files = [
  "src/routes/app.customer.tsx",
  "src/routes/app.customer.index.tsx",
  "src/routes/app.customer.search.tsx",
  "src/routes/app.customer.bookings.tsx",
  "src/routes/app.customer.rewards.tsx",
  "src/routes/app.customer.profile.tsx",
  "src/routes/app.customer.support.tsx",
  "src/pages/customer/app/CustomerAppShell.tsx",
  "src/pages/customer/app/CustomerAppHome.tsx",
  "src/pages/customer/app/CustomerAppSearch.tsx",
  "src/pages/customer/app/CustomerAppBookings.tsx",
  "src/pages/customer/app/CustomerAppRewards.tsx",
  "src/pages/customer/app/CustomerAppProfile.tsx",
  "src/pages/customer/app/CustomerAvatar.tsx",
  "src/pages/customer/settings/CustomerAppInstallPanel.tsx",
  "supabase/migrations/20260716130000_customer_pwa_staff_booking.sql",
  "supabase/migrations/20260716130020_persist_customer_gender.sql",
];

const failures = [];
for (const file of files) {
  if (!existsSync(file)) failures.push(`Missing customer app file: ${file}`);
}

const shell = readFileSync("src/pages/customer/app/CustomerAppShell.tsx", "utf8");
for (const label of ["Home", "Search", "Bookings", "Rewards", "Profile"]) {
  if (!shell.includes(`label: "${label}"`)) failures.push(`Bottom navigation is missing ${label}`);
}
if (!shell.includes('from "@/stores/authStore"')) {
  failures.push("Customer app shell must reuse the platform Supabase auth store");
}
if (!existsSync("public/nexora-final-logo.jpg")) {
  failures.push("The approved final Nexora SalonOS logo must be included in the customer app");
}

const liveSalons = readFileSync("src/lib/customer-app.ts", "utf8");
if (!liveSalons.includes('.eq("website_created", true)')) {
  failures.push("Customer app must only load published salon websites");
}
if (/DEMO_SHOPS|mock/i.test(liveSalons)) {
  failures.push("Customer app salon discovery must not use demo data");
}
if (!liveSalons.includes('input?.gender === "male"') || !liveSalons.includes('"Beauty Parlour"')) {
  failures.push("Customer salon discovery must respect the saved gender preference");
}

const home = readFileSync("src/pages/customer/app/CustomerAppHome.tsx", "utf8");
if (!home.includes("geolocation.getCurrentPosition")) {
  failures.push("Customer app must request real location permission");
}

const signup = readFileSync("src/pages/auth/SignupPage.tsx", "utf8");
if (
  !signup.includes('gender: z.enum(["male", "female"]') ||
  !signup.includes("gender: parsed.data.gender")
) {
  failures.push("Customer signup must require and persist gender");
}

const profile = readFileSync("src/pages/customer/app/CustomerAppProfile.tsx", "utf8");
if (
  !profile.includes("Nexora member") ||
  !profile.includes("Choose profile photo") ||
  !profile.includes("<CustomerAvatar") ||
  !profile.includes("currentProfile?.full_name") ||
  !profile.includes("CustomerAppInstallPanel") ||
  !profile.includes('from "@/stores/authStore"')
) {
  failures.push(
    "Customer profile must reuse platform auth and show the member ID, photo chooser and install action",
  );
}

const customerLogin = readFileSync("src/pages/auth/CustomerLoginPage.tsx", "utf8");
if (!customerLogin.includes("/nexora-final-logo.jpg")) {
  failures.push("Customer login must show the approved Nexora SalonOS logo");
}
if (!signup.includes("/nexora-final-logo.jpg")) {
  failures.push("Customer signup must show the approved Nexora SalonOS logo");
}

const customerLanding = readFileSync("src/routes/customer-app.tsx", "utf8");
if (customerLanding.includes("Coming Soon") || !customerLanding.includes("existing Nexora login")) {
  failures.push("Customer app landing metadata must describe the live shared-login app");
}

const installPanel = readFileSync(
  "src/pages/customer/settings/CustomerAppInstallPanel.tsx",
  "utf8",
);
if (!installPanel.includes('kind="customer"') || !installPanel.includes("/app/customer")) {
  failures.push("Customer profile must expose the customer-specific PWA install action");
}

const accountSettings = readFileSync("src/pages/customer/AccountSettingsPage.tsx", "utf8");
if (!accountSettings.includes('label: "Install customer app"')) {
  failures.push("Customer account settings must include the PWA install section");
}

const staffMigration = readFileSync(
  "supabase/migrations/20260716130000_customer_pwa_staff_booking.sql",
  "utf8",
);
if (
  !staffMigration.includes("staff_id uuid") ||
  !staffMigration.includes("staff_member.salon_id")
) {
  failures.push("Selected staff must be validated and persisted with the booking");
}

const booking = readFileSync("src/routes/site.$slug_.book.tsx", "utf8");
if (!booking.includes("Select professional") || !booking.includes("staffId: staffId || null")) {
  failures.push("Public booking journey is missing staff selection");
}

const manifest = JSON.parse(readFileSync("public/manifests/customer.webmanifest", "utf8"));
if (!String(manifest.start_url).startsWith("/app/customer")) {
  failures.push("Customer PWA manifest must open /app/customer");
}
for (const size of ["192x192", "512x512"]) {
  if (
    !manifest.icons?.some(
      (icon) =>
        icon.src.startsWith(`/customer-pwa-icon-${size.split("x")[0]}.png?v=`) &&
        icon.sizes === size,
    )
  ) {
    failures.push(`Customer PWA manifest must include the supplied Nexora ${size} install icon`);
  }
}
if (!manifest.screenshots?.some((shot) => shot.src === "/customer-pwa-splash.jpg")) {
  failures.push("Customer PWA manifest must include the supplied launch artwork");
}
if (!shell.includes("CUSTOMER_SPLASH") || !shell.includes("showLaunchSplash")) {
  failures.push("Customer app shell must show the branded launch splash once per session");
}

const pwaManager = readFileSync("src/components/pwa/RolePwaManager.tsx", "utf8");
const serviceWorker = readFileSync("public/pwa-sw.js", "utf8");
if (
  !pwaManager.includes('updateViaCache: "none"') ||
  !pwaManager.includes("PWA_RELEASE") ||
  !pwaManager.includes("getRegistrations()") ||
  !pwaManager.includes("isLegacyWorker") ||
  !pwaManager.includes('"controllerchange"') ||
  !pwaManager.includes("window.location.reload()") ||
  !pwaManager.includes("registration?.update()")
) {
  failures.push(
    "Installed customer PWA must check for deployments and reload onto the latest app version",
  );
}
if (
  !serviceWorker.includes("self.skipWaiting()") ||
  !serviceWorker.includes("self.clients.claim()")
) {
  failures.push("Customer PWA service worker must activate new deployments immediately");
}
if (!shell.includes("bg-[#fff9ed]") || !shell.includes("text-[#9a6b16]")) {
  failures.push("Customer PWA shell must use the approved premium black, gold and ivory theme");
}

if (failures.length) {
  console.error("Customer PWA audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Customer PWA audit passed: focused routes, five-tab navigation, live published salons, location permission and persisted staff selection are present.",
);
