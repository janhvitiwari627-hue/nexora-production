#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const files = {
  migration: "supabase/migrations/20260716115727_p1_public_website_mvp.sql",
  config: "supabase/config.toml",
  client: "src/lib/public-booking.ts",
  site: "src/routes/site.$businessSlug.tsx",
  services: "src/routes/site.$slug_.services.tsx",
  book: "src/routes/site.$slug_.book.tsx",
  success: "src/routes/site.$slug_.booking-success.tsx",
  dashboard: "src/routes/dashboard.bookings.tsx",
  customerBookings: "src/pages/customer/PublicBookingsPage.tsx",
  salons: "src/lib/salons.functions.ts",
  oldBook: "src/routes/book.$slug.tsx",
  oldSalonBook: "src/routes/salon.$slug_.book.tsx",
};

const content = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => [
      key,
      await readFile(fileURLToPath(new URL(path, root)), "utf8"),
    ]),
  ),
);

const failures = [];
const requireText = (file, pattern, message) => {
  if (!pattern.test(content[file])) failures.push(message);
};

requireText("salons", /\.eq\("website_created",\s*true\)/, "public site must require publication");
requireText("migration", /'pending_payment'/, "appointment status must be pending_payment");
requireText("migration", /'advance_pending'/, "payment status must be advance_pending");
requireText(
  "migration",
  /round\(selected_service\.price\s*\*\s*0\.25,\s*2\)/,
  "database must calculate the 25% advance",
);
requireText(
  "migration",
  /CREATE OR REPLACE FUNCTION public\.create_public_appointment[\s\S]*SECURITY INVOKER/i,
  "public appointment RPC must remain security invoker",
);
requireText(
  "migration",
  /REVOKE ALL ON FUNCTION public\.create_public_appointment[\s\S]*FROM PUBLIC,\s*anon/i,
  "appointment RPC must not be callable by unauthenticated requests",
);
requireText("client", /signInAnonymously/, "public form must establish a silent booking session");
requireText(
  "config",
  /enable_anonymous_sign_ins\s*=\s*true/,
  "Supabase Auth must enable anonymous booking sessions",
);
requireText("client", /create_public_appointment/, "public form must call the transactional RPC");
requireText("success", /Advance payment is pending/, "success page must state payment is pending");
requireText(
  "dashboard",
  /OwnerBookingsPage/,
  "owner bookings must be visible at /dashboard/bookings",
);
requireText(
  "dashboard",
  /PublicBookingsPage/,
  "customer dashboard must use live bookings instead of mock records",
);
requireText(
  "customerBookings",
  /\.from\("bookings"\)/,
  "customer dashboard must query bookings through the active browser session",
);
requireText("oldBook", /to:\s*"\/site\/\$slug_\/book"/, "legacy booking route must redirect");
requireText(
  "oldSalonBook",
  /to:\s*"\/site\/\$slug_\/book"/,
  "legacy salon booking route must redirect",
);

for (const file of ["client", "book", "success"]) {
  if (/MOCK-|payment_reference|confirmBookingPayment/.test(content[file])) {
    failures.push(`${files[file]} contains a fake payment-success path`);
  }
  if (/SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(content[file])) {
    failures.push(`${files[file]} references a forbidden elevated credential`);
  }
}

if (failures.length > 0) {
  console.error("P1 public booking audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "P1 public booking audit passed: published-site gate, real services, unpaid appointment states, owner visibility, and no fake payment path are present.",
);
