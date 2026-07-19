#!/usr/bin/env node
/**
 * Guard against reintroduction of the deleted `pwa-standalone-guard` module.
 *
 * The file src/lib/pwa-standalone-guard.ts was removed as part of the
 * customer-app / PWA cleanup. It must NOT be referenced anywhere in the
 * codebase, and it must NOT be recreated. Any reference is almost certainly
 * a stale import that will break the build.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = "src/lib/pwa-standalone-guard.ts";
const TERM = "pwa-standalone-guard";
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCLUDED_DIRECTORIES = new Set(["node_modules", "dist", ".output", ".vinxi"]);

const errors = [];

if (existsSync(path.join(PROJECT_ROOT, FILE))) {
  errors.push(
    `${FILE} exists — this module was removed during the customer-app cleanup and must not be recreated.`,
  );
}

const normalizePath = (filePath) => filePath.split(path.sep).join("/");

function isBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8_192));
  if (sample.includes(0)) return true;

  let suspiciousBytes = 0;
  for (const byte of sample) {
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) suspiciousBytes += 1;
  }

  return sample.length > 0 && suspiciousBytes / sample.length > 0.1;
}

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    if (entry.isFile() && entry.name === "routeTree.gen.ts") continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(absolutePath));
    else if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

try {
  const roots = ["src", "app"]
    .map((directory) => path.join(PROJECT_ROOT, directory))
    .filter((directory) => existsSync(directory));

  for (const absolutePath of roots.flatMap(collectFiles)) {
    const buffer = readFileSync(absolutePath);
    if (isBinary(buffer)) continue;

    buffer
      .toString("utf8")
      .split(/\r?\n/)
      .forEach((line, index) => {
        if (!line.includes(TERM)) return;
        const relativePath = normalizePath(path.relative(PROJECT_ROOT, absolutePath));
        errors.push(`${relativePath}:${index + 1}: stale reference to \`${TERM}\``);
      });
  }
} catch (error) {
  console.error(
    "[pwa-standalone-guard] scan error:",
    error instanceof Error ? error.message : error,
  );
  process.exit(2);
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
