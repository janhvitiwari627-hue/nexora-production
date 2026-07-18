#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const required = [
  "src/routes/app.owner.tsx",
  "src/routes/app.owner.index.tsx",
  "src/routes/app.owner.bookings.tsx",
  "src/routes/app.owner.website.tsx",
  "src/routes/app.owner.wallet.tsx",
  "src/routes/app.owner.profile.tsx",
  "src/routes/app.owner.support.tsx",
  "src/pages/owner/app/OwnerAppShell.tsx",
  "src/pages/owner/app/OwnerAppProfile.tsx",
];

const failures = [];
for (const file of required) {
  if (!existsSync(file)) failures.push(`Missing owner app file: ${file}`);
}

const shell = readFileSync("src/pages/owner/app/OwnerAppShell.tsx", "utf8");
for (const label of ["Dashboard", "Bookings", "Website", "Wallet", "Profile"]) {
  if (!shell.includes(`label: "${label}"`))
    failures.push(`Owner bottom navigation is missing ${label}`);
}

const guard = readFileSync("src/routes/app.owner.tsx", "utf8");
if (!guard.includes('requireRole(["owner", "shop_owner", "shop_manager", "admin"]')) {
  failures.push("Owner app is missing its role guard");
}

const profile = readFileSync("src/pages/owner/app/OwnerAppProfile.tsx", "utf8");
for (const feature of [
  "Business profile",
  "Services",
  "Staff",
  "Customers",
  "Reviews",
  "Payouts",
  "Template selection",
  "Gallery upload",
  "Analytics",
  "Support",
]) {
  if (!profile.includes(feature)) failures.push(`Owner app is missing ${feature}`);
}

const manifest = JSON.parse(readFileSync("public/manifests/owner.webmanifest", "utf8"));
if (!String(manifest.start_url).startsWith("/app/owner")) {
  failures.push("Owner PWA manifest must open /app/owner");
}

if (failures.length) {
  console.error("Owner PWA audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Owner PWA audit passed: guarded owner routes, five-tab navigation, business modules and installable start URL are present.",
);
