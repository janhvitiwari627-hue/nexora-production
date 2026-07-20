import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { buildPasswordRecoveryUrl, buildPasswordResetRedirectUrl } from "../src/lib/public-app-url";

test("password recovery emails point to the Nexora callback with a recovery token", () => {
  expect(buildPasswordRecoveryUrl("token with spaces")).toBe(
    "https://meripahalfasthelp.online/auth/callback?token_hash=token+with+spaces&type=recovery&next=%2Freset-password",
  );
});

test("forgot-password uses Supabase Auth without depending on the custom email service", () => {
  const source = readFileSync("src/lib/password-reset.ts", "utf8");

  expect(source).toContain("resetPasswordForEmail");
  expect(source).toContain("buildPasswordResetRedirectUrl()");
  expect(source).not.toContain("/api/public/auth/forgot-password");
  expect(source).not.toContain("window.location.origin");
  expect(buildPasswordResetRedirectUrl()).toBe(
    "https://meripahalfasthelp.online/auth/callback?next=/reset-password",
  );
});

test("Supabase auth configuration uses the production Nexora host", () => {
  const config = readFileSync("supabase/config.toml", "utf8");

  expect(config).toContain('site_url = "https://meripahalfasthelp.online"');
  expect(config).not.toContain('site_url = "http://localhost:3000"');
  expect(config).not.toContain('site_url = "https://nexora-production.vercel.app"');
});
