#!/usr/bin/env node
// Fails build if forbidden symbol references appear in source code.
// Migrations under supabase/migrations/ are historical and excluded.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const FORBIDDEN = ["public_salons_search"];
const INCLUDE_GLOBS = ["src", "app", "scripts"].filter((d) => existsSync(d));
const EXCLUDES = [
  "--glob=!**/node_modules/**",
  "--glob=!**/dist/**",
  "--glob=!**/.output/**",
  "--glob=!**/.vinxi/**",
  "--glob=!**/routeTree.gen.ts",
  "--glob=!supabase/migrations/**",
  "--glob=!scripts/check-forbidden-refs.mjs",
];

let failed = false;
for (const term of FORBIDDEN) {
  const result = spawnSync(
    "rg",
    ["-n", "--no-heading", "-S", ...EXCLUDES, "--", term, ...INCLUDE_GLOBS],
    { encoding: "utf8" },
  );
  if (result.status === 0 && result.stdout.trim()) {
    failed = true;
    console.error(`\n❌ Forbidden reference "${term}" found:\n${result.stdout}`);
  } else if (result.status !== 1) {
    console.error(`Scan error for "${term}":`, result.stderr || result.error?.message);
    process.exit(2);
  }
}

if (failed) {
  console.error(
    "\nBuild aborted. Replace forbidden references (e.g. use `shops_search` instead of `public_salons_search`).",
  );
  process.exit(1);
}
console.log("✅ Forbidden-reference scan passed.");
