#!/usr/bin/env node
// Fails build if forbidden symbol references appear in source code.
// Migrations under supabase/migrations/ are historical and excluded.
import { execSync } from "node:child_process";

const FORBIDDEN = ["public_salons_search"];
const INCLUDE_GLOBS = ["src", "app", "scripts"];
const EXCLUDES = [
  "--glob=!**/node_modules/**",
  "--glob=!**/dist/**",
  "--glob=!**/.output/**",
  "--glob=!**/.vinxi/**",
  "--glob=!**/routeTree.gen.ts",
  "--glob=!supabase/migrations/**",
];

let failed = false;
for (const term of FORBIDDEN) {
  try {
    const out = execSync(
      `rg -n --no-heading -S ${EXCLUDES.map((e) => `'${e}'`).join(" ")} -- '${term}' ${INCLUDE_GLOBS.join(" ")}`,
      { stdio: ["ignore", "pipe", "pipe"] }
    ).toString();
    if (out.trim()) {
      failed = true;
      console.error(`\n❌ Forbidden reference "${term}" found:\n${out}`);
    }
  } catch (err) {
    // rg exits 1 when no matches — that's success.
    if (err.status && err.status !== 1) {
      console.error(`Scan error for "${term}":`, err.message);
      process.exit(2);
    }
  }
}

if (failed) {
  console.error(
    "\nBuild aborted. Replace forbidden references (e.g. use `shops_search` instead of `public_salons_search`)."
  );
  process.exit(1);
}
console.log("✅ Forbidden-reference scan passed.");
