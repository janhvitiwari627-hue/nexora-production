#!/usr/bin/env node
/**
 * Automated check: enforce that /customer/* routes render CustomerAppLayout
 * only, and never mount public-website (marketing) layout components.
 *
 * Two guarantees are verified:
 *   1. No file under src/routes/customer* imports a public layout component
 *      (PublicHeader, PublicFooter, PublicPageHeader, PublicWebsiteLayout).
 *   2. Each public layout component ships the runtime `assertPublicOnly`
 *      guard, so if it is ever mounted while the URL is under /customer/*
 *      (including installed PWA / standalone mode), it refuses to render.
 *
 * Exits non-zero on violation so CI / build:dev can gate on it.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const FORBIDDEN = [
  "PublicHeader",
  "PublicFooter",
  "PublicPageHeader",
  "PublicWebsiteLayout",
];
const PUBLIC_COMPONENTS = [
  "src/components/layout/PublicHeader.tsx",
  "src/components/layout/PublicFooter.tsx",
  "src/components/shared/PublicPageHeader.tsx",
];

const errors = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

// 1. Scan customer route files + the customer-app install page. The
// installed-state guard means /customer-app must also never import a
// public marketing layout component.
const routesDir = join(ROOT, "src/routes");
const customerRouteFiles = readdirSync(routesDir)
  .filter((n) => n.startsWith("customer.") || n === "customer.tsx" || n === "customer-app.tsx")
  .map((n) => join(routesDir, n));
const customerDir = join(routesDir, "customer");
try {
  if (statSync(customerDir).isDirectory()) customerRouteFiles.push(...walk(customerDir));
} catch {
  /* no nested customer dir — fine */
}
// The page component behind /customer-app also gets scanned.
const customerAppPage = join(ROOT, "src/pages/public/CustomerAppPage.tsx");
try {
  statSync(customerAppPage);
  customerRouteFiles.push(customerAppPage);
} catch {
  /* page missing — routing check will surface it separately */
}


for (const file of customerRouteFiles) {
  const src = readFileSync(file, "utf8");
  for (const name of FORBIDDEN) {
    const importRe = new RegExp(
      `import[^;]*\\b${name}\\b[^;]*from\\s+['"][^'"]+['"]`,
    );
    if (importRe.test(src)) {
      errors.push(
        `${file}: imports forbidden marketing layout component "${name}". Customer routes must only use CustomerAppLayout.`,
      );
    }
  }
}

// 2. Verify each public component has the runtime guard.
for (const rel of PUBLIC_COMPONENTS) {
  const file = join(ROOT, rel);
  const src = readFileSync(file, "utf8");
  if (!src.includes("assertPublicOnly(")) {
    errors.push(
      `${rel}: missing runtime guard call to assertPublicOnly(...). Public layout components must refuse to render on /customer/* routes.`,
    );
  }
}

if (errors.length) {
  console.error("\n[layout-isolation] FAILED — customer app must not render marketing layouts:\n");
  for (const e of errors) console.error("  • " + e);
  console.error("");
  process.exit(1);
}

console.log(
  `[layout-isolation] OK — scanned ${customerRouteFiles.length} customer route file(s); all ${PUBLIC_COMPONENTS.length} public layout components carry the standalone/customer guard.`,
);
