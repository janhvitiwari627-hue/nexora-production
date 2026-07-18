#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const migrationsDir = fileURLToPath(new URL("../supabase/migrations/", import.meta.url));
const migrationFiles = (await readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const sql = (
  await Promise.all(migrationFiles.map((file) => readFile(join(migrationsDir, file), "utf8")))
).join("\n");

const createdTables = new Set(
  [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_][a-z0-9_]*)/gi)].map(
    (match) => match[1].toLowerCase(),
  ),
);

const rlsEnabledTables = new Set(
  [
    ...sql.matchAll(
      /alter\s+table\s+(?:only\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\s+enable\s+row\s+level\s+security/gi,
    ),
  ].map((match) => match[1].toLowerCase()),
);

const missingRls = [...createdTables].filter((table) => !rlsEnabledTables.has(table)).sort();
const disablesRls = /disable\s+row\s+level\s+security/i.test(sql);

if (createdTables.size === 0) {
  console.error("RLS audit failed: no public tables were found in migration history.");
  process.exit(1);
}

if (disablesRls || missingRls.length > 0) {
  console.error("RLS migration audit failed.");
  if (disablesRls) console.error("- Migration history disables row-level security.");
  if (missingRls.length > 0) {
    console.error(
      `- Tables without an ENABLE ROW LEVEL SECURITY statement: ${missingRls.join(", ")}`,
    );
  }
  process.exit(1);
}

console.log(
  `RLS migration audit passed: ${createdTables.size} public tables enable row-level security across ${migrationFiles.length} migrations.`,
);
