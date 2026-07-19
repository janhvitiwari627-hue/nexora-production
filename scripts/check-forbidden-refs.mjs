#!/usr/bin/env node
// Fails the build if forbidden symbols appear in executable source files.
// Uses only Node.js APIs so it works without ripgrep or other system tools.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FORBIDDEN = ["public_salons_search"];
const SCAN_ROOTS = ["src", "app", "scripts"];
const EXCLUDED_DIRECTORIES = new Set(["node_modules", "dist", ".output", ".vinxi"]);
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const normalizePath = (filePath) => filePath.split(path.sep).join("/");

function isExcluded(relativePath, isDirectory = false) {
  const normalized = normalizePath(relativePath);
  const segments = normalized.split("/");

  if (segments.some((segment) => EXCLUDED_DIRECTORIES.has(segment))) return true;
  if (normalized === "supabase/migrations" || normalized.startsWith("supabase/migrations/")) {
    return true;
  }
  if (!isDirectory && path.posix.basename(normalized) === "routeTree.gen.ts") return true;
  if (!isDirectory && normalized === "scripts/check-forbidden-refs.mjs") return true;

  // Generated database declarations describe legacy server objects but are
  // not executable application references.
  if (!isDirectory && normalized === "src/integrations/supabase/types.ts") return true;

  return false;
}

function isBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8_192));
  if (sample.includes(0)) return true;

  let suspiciousBytes = 0;
  for (const byte of sample) {
    const isAllowedControl = byte === 9 || byte === 10 || byte === 13;
    if (byte < 32 && !isAllowedControl) suspiciousBytes += 1;
  }

  return sample.length > 0 && suspiciousBytes / sample.length > 0.1;
}

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(PROJECT_ROOT, absolutePath);

    if (isExcluded(relativePath, entry.isDirectory())) continue;
    if (entry.isDirectory()) files.push(...collectFiles(absolutePath));
    else if (entry.isFile())
      files.push({ absolutePath, relativePath: normalizePath(relativePath) });
  }

  return files;
}

let failed = false;

try {
  const files = SCAN_ROOTS.filter((directory) =>
    existsSync(path.join(PROJECT_ROOT, directory)),
  ).flatMap((directory) => collectFiles(path.join(PROJECT_ROOT, directory)));

  for (const { absolutePath, relativePath } of files) {
    const buffer = readFileSync(absolutePath);
    if (isBinary(buffer)) continue;

    const lines = buffer.toString("utf8").split(/\r?\n/);
    for (const term of FORBIDDEN) {
      lines.forEach((line, index) => {
        if (!line.includes(term)) return;
        failed = true;
        console.error(`${relativePath}:${index + 1}: Forbidden reference "${term}"`);
      });
    }
  }
} catch (error) {
  console.error("Forbidden-reference scan failed:", error instanceof Error ? error.message : error);
  process.exit(2);
}

if (failed) {
  console.error(
    "\nBuild aborted. Replace forbidden references (for example, use `shops_search` instead of `public_salons_search`).",
  );
  process.exit(1);
}

console.log("Forbidden-reference scan passed.");
