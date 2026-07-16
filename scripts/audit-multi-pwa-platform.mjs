#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const requiredRoutes = [
  "src/routes/customer-app.tsx",
  "src/routes/shop-owner-app.tsx",
  "src/routes/website-builder.tsx",
  "src/routes/growth-partner.tsx",
  "src/routes/growth-partner-app.tsx",
  "src/routes/distributor-brand-portal.tsx",
  "src/routes/distributor-app.tsx",
  "src/routes/jobs-app.tsx",
  "src/routes/booking-flow.tsx",
  "src/routes/membership-rules.tsx",
  "src/routes/qr-payments.tsx",
  "src/routes/refund-cancellation.tsx",
  "src/routes/privacy.tsx",
  "src/routes/terms.tsx",
  "src/routes/help.tsx",
  "src/routes/contact.tsx",
  "src/routes/role-selection.tsx",
];

const manifests = [
  ["customer", "/apps/customer", "/app/customer"],
  ["owner", "/apps/owner", "/owner/welcome"],
  ["partner", "/apps/partner", "/partner"],
  ["distributor", "/apps/distributor", "/portal"],
  ["jobs", "/apps/jobs", "/jobs"],
];

const failures = [];

for (const route of requiredRoutes) {
  if (!existsSync(route)) failures.push(`Missing public route: ${route}`);
}

for (const [name, id, startPath] of manifests) {
  const path = `public/manifests/${name}.webmanifest`;
  if (!existsSync(path)) {
    failures.push(`Missing ${name} app manifest`);
    continue;
  }
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  if (manifest.id !== id) failures.push(`${name} manifest must have a unique app id`);
  if (!String(manifest.start_url).startsWith(startPath)) {
    failures.push(`${name} manifest has the wrong role start URL`);
  }
  if (manifest.display !== "standalone") failures.push(`${name} app must be installable`);
}

const pwaManager = readFileSync("src/components/pwa/RolePwaManager.tsx", "utf8");
if (!pwaManager.includes('register("/pwa-sw.js"')) {
  failures.push("Role PWA service worker registration is missing");
}

const homepage = readFileSync("src/pages/public/HomePage.tsx", "utf8");
if (!homepage.includes("PlatformOverviewSections")) {
  failures.push("Homepage is missing the complete platform overview");
}

const overview = readFileSync("src/pages/public/sections/PlatformOverviewSections.tsx", "utf8");
for (const required of [
  "/customer-app",
  "/shop-owner-app",
  "/growth-partner-app",
  "/distributor-app",
  "/jobs-app",
  "/booking-flow",
  "/qr-payments",
  "/help",
]) {
  if (!overview.includes(required)) failures.push(`Homepage overview is missing ${required}`);
}

if (failures.length) {
  console.error("Multi-PWA platform audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Multi-PWA platform audit passed: public pages, homepage overview, five role manifests and role start URLs are present.",
);
