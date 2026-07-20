import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const ownerFunctions = readFileSync(
  new URL("../src/lib/owner.functions.ts", import.meta.url),
  "utf8",
);

const referralValidator = ownerFunctions.slice(
  ownerFunctions.indexOf("export const validateReferralCode"),
  ownerFunctions.indexOf("// ---------- Salon owner self-registration"),
);

test("referral validation stays server-side and accepts only active referrers", () => {
  expect(referralValidator).toContain('await import("@/integrations/supabase/client.server")');
  expect(referralValidator).toContain("supabaseAdmin");
  expect(referralValidator).toContain('.eq("is_active", true)');
});

test("referral validation never exposes profiles through the public key", () => {
  expect(referralValidator).not.toContain("SUPABASE_PUBLISHABLE_KEY");
  expect(referralValidator).not.toContain('from("@supabase/supabase-js")');
});
