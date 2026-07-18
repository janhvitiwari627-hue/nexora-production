#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const migrationPath = fileURLToPath(
  new URL(
    "../supabase/migrations/20260716113945_p0_supabase_foundation_mapping.sql",
    import.meta.url,
  ),
);
const clientPath = fileURLToPath(
  new URL("../src/integrations/supabase/client.ts", import.meta.url),
);

const [sql, browserClient] = await Promise.all([
  readFile(migrationPath, "utf8"),
  readFile(clientPath, "utf8"),
]);

const canonicalViews = ["tenants", "customers", "appointments", "tenant_websites", "media_files"];
const canonicalPhysicalTables = ["profiles", "services", "website_templates"];
const failures = [];

for (const view of canonicalViews) {
  const escaped = view.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const viewPattern = new RegExp(
    `create\\s+view\\s+public\\.${escaped}\\s+with\\s*\\([^)]*security_invoker\\s*=\\s*true`,
    "i",
  );
  if (!viewPattern.test(sql)) {
    failures.push(`${view} must be a security_invoker compatibility view`);
  }
}

for (const table of canonicalPhysicalTables) {
  const duplicatePattern = new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?public\\.${table}\\b`,
    "i",
  );
  if (duplicatePattern.test(sql)) {
    failures.push(`${table} must not be recreated by the P0 migration`);
  }
}

if (!/revoke\s+all\s+on\s+public\.tenants\s+from\s+public,\s*anon,\s*authenticated/i.test(sql)) {
  failures.push("canonical view privileges must be explicitly reset");
}

if (!/grant\s+select\s+on\s+public\.tenant_websites\s+to\s+anon,\s*authenticated/i.test(sql)) {
  failures.push("public website mapping must have an explicit read grant");
}

if (/SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(browserClient)) {
  failures.push("browser Supabase client references a service-role credential");
}

if (!/VITE_SUPABASE_PUBLISHABLE_KEY/.test(browserClient)) {
  failures.push("browser Supabase client does not use the publishable key");
}

if (failures.length > 0) {
  console.error("P0 foundation audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "P0 foundation audit passed: canonical mappings use invoker RLS, existing tables are not duplicated, and the browser client uses only the publishable key.",
);
