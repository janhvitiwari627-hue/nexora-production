import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { buildPasswordRecoveryUrl } from "../src/lib/public-app-url";

test("password recovery emails point to the Nexora callback with a recovery token", () => {
  expect(buildPasswordRecoveryUrl("token with spaces")).toBe(
    "https://nexora-production.vercel.app/auth/callback?token_hash=token+with+spaces&type=recovery&next=%2Freset-password",
  );
});

test("forgot-password requests never derive email links from the browser origin", () => {
  const source = readFileSync("src/lib/password-reset.ts", "utf8");

  expect(source).toContain("/api/public/auth/forgot-password");
  expect(source).not.toContain("window.location.origin");
  expect(source).not.toContain("resetPasswordForEmail");
});

test("Supabase auth configuration uses the production Nexora host", () => {
  const config = readFileSync("supabase/config.toml", "utf8");

  expect(config).toContain('site_url = "https://nexora-production.vercel.app"');
  expect(config).not.toContain('site_url = "http://localhost:3000"');
  expect(config).not.toContain('site_url = "https://meripahalfasthelp.online"');
});
