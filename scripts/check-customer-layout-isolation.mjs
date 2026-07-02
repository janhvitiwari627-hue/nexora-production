#!/usr/bin/env node
/**
 * Post-cleanup check: the Customer App has been removed from this project
 * (it ships as a separate product). Ensure no `/customer/*` route files
 * have been re-introduced and the /customer-app landing page remains.
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const routesDir = join(ROOT, "src/routes");

const errors = [];

const forbidden = readdirSync(routesDir).filter(
  (n) =>
    (n.startsWith("customer.") || n.startsWith("customer_") || n === "customer.tsx") &&
    n !== "customer-app.tsx",
);

for (const f of forbidden) {
  errors.push(
    `src/routes/${f}: /customer/* routes were removed — the Customer App ships as a separate project.`,
  );
}

try {
  statSync(join(routesDir, "customer"));
  errors.push("src/routes/customer/: directory must not exist — Customer App is a separate project.");
} catch {
  /* absent — good */
}

try {
  statSync(join(ROOT, "src/routes/customer-app.tsx"));
} catch {
  errors.push("src/routes/customer-app.tsx: missing — the /customer-app landing page must remain.");
}

if (errors.length) {
  console.error("\n[layout-isolation] FAILED:\n");
  for (const e of errors) console.error("  • " + e);
  console.error("");
  process.exit(1);
}

console.log("[layout-isolation] OK — no /customer/* routes present; /customer-app landing intact.");
