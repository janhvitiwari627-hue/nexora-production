#!/usr/bin/env node
/**
 * Guard against reintroduction of the deleted `pwa-standalone-guard` module.
 *
 * The file src/lib/pwa-standalone-guard.ts was removed as part of the
 * customer-app / PWA cleanup. It must NOT be referenced anywhere in the
 * codebase, and it must NOT be recreated. Any reference is almost certainly
 * a stale import that will break the build.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const FILE = "src/lib/pwa-standalone-guard.ts";
const TERM = "pwa-standalone-guard";

const errors = [];

if (existsSync(FILE)) {
  errors.push(
    `${FILE} exists — this module was removed during the customer-app cleanup and must not be recreated.`,
  );
}

const EXCLUDES = [
  "--glob=!**/node_modules/**",
  "--glob=!**/dist/**",
  "--glob=!**/.output/**",
  "--glob=!**/.vinxi/**",
  "--glob=!**/routeTree.gen.ts",
  "--glob=!scripts/check-pwa-standalone-guard.mjs",
];

try {
  const out = execSync(
    `rg -n --no-heading -S ${EXCLUDES.map((e) => `'${e}'`).join(" ")} -- '${TERM}' .`,
    { stdio: ["ignore", "pipe", "pipe"] },
  ).toString();
  if (out.trim()) {
    errors.push(
      `Found stale reference(s) to \`${TERM}\` (module was deleted):\n${out}`,
    );
  }
} catch (err) {
  // rg exits 1 when no matches — success.
  if (err.status && err.status !== 1) {
    console.error(`[pwa-standalone-guard] scan error:`, err.message);
    process.exit(2);
  }
}

if (errors.length) {
  console.error("\n❌ [pwa-standalone-guard] check FAILED:\n");
  for (const e of errors) console.error("  • " + e + "\n");
  console.error(
    "The `pwa-standalone-guard` module was intentionally removed. " +
      "Delete the reference — do NOT recreate the file.",
  );
  process.exit(1);
}

console.log("✅ [pwa-standalone-guard] no stale references, file correctly absent.");
