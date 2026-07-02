#!/usr/bin/env node
/**
 * Prebuild check: the Customer App ships as a separate product.
 * Fail the build if any `/customer/*` routes are reintroduced —
 * either as route files, a `customer/` route directory, or as
 * `/customer/...` path strings inside source code (createFileRoute,
 * <Link to="/customer/...">, navigate({ to: "/customer/..." }), etc).
 *
 * `/customer-app` (the public download/waitlist landing) is allowed.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const routesDir = join(ROOT, "src/routes");
const errors = [];

// 1. No customer.* / customer_* route files
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

// 2. No src/routes/customer/ directory
try {
  statSync(join(routesDir, "customer"));
  errors.push("src/routes/customer/: directory must not exist — Customer App is a separate project.");
} catch {
  /* absent — good */
}

// 3. /customer-app landing must remain
try {
  statSync(join(ROOT, "src/routes/customer-app.tsx"));
} catch {
  errors.push("src/routes/customer-app.tsx: missing — the /customer-app landing page must remain.");
}

// 4. No `/customer/...` path strings in source. `/customer-app` is allowed.
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const SKIP_FILES = new Set(["routeTree.gen.ts"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".output", ".vinxi", ".turbo", "build"]);
// Match "/customer" or '/customer' or `/customer` followed by `/` or a quote/backtick,
// but NOT `/customer-app`.
const PATTERN = /["'`]\/customer(?![-\w])(?:\/[^"'`\s]*)?["'`]/;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      walk(join(dir, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;
    if (SKIP_FILES.has(entry.name)) continue;
    const ext = entry.name.slice(entry.name.lastIndexOf("."));
    if (!EXTS.has(ext)) continue;
    const full = join(dir, entry.name);
    const rel = relative(ROOT, full);
    if (rel === "scripts/check-customer-layout-isolation.mjs") continue;
    const text = readFileSync(full, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) {
        errors.push(`${rel}:${i + 1}: references a /customer/* path — Customer App is a separate project.`);
      }
    });
  }
}

for (const d of ["src", "app"]) {
  const full = join(ROOT, d);
  try {
    if (statSync(full).isDirectory()) walk(full);
  } catch { /* dir absent — fine */ }
}

if (errors.length) {
  console.error("\n[layout-isolation] FAILED:\n");
  for (const e of errors) console.error("  • " + e);
  console.error("");
  process.exit(1);
}

console.log("[layout-isolation] OK — no /customer/* routes or path references present.");
