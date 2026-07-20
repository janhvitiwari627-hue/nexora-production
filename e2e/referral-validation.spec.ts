import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const signupPage = readFileSync(
  new URL("../src/pages/auth/SignupPage.tsx", import.meta.url),
  "utf8",
);
const customerRegistrationPage = readFileSync(
  new URL("../src/pages/auth/CustomerRegistrationPage.tsx", import.meta.url),
  "utf8",
);
const referralPanel = readFileSync(
  new URL("../src/pages/customer/settings/ReferralPanel.tsx", import.meta.url),
  "utf8",
);

test("signup sends well-formed referral codes to the authoritative database trigger", () => {
  expect(signupPage).toContain("const referralPending = /^[A-Z0-9]{3,20}$/.test(referredBy)");
  expect(signupPage).toContain("referred_by: referralPending ? referredBy : null");
  expect(signupPage).toContain("Credit goes only");
  expect(signupPage).toContain("matching active referrer");
});

test("signup never performs a pre-auth profiles lookup", () => {
  expect(signupPage).not.toContain("validateReferralCode");
  expect(signupPage).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  expect(signupPage).not.toContain('.from("profiles")');
  expect(customerRegistrationPage).not.toContain("validateReferralCode");
  expect(customerRegistrationPage).toContain(
    "referred_by: referralPending ? normalizedReferral : null",
  );
});

test("customer settings reads the immutable referral attribution", () => {
  expect(referralPanel).not.toContain("validateReferralCode");
  expect(referralPanel).toContain('.from("referral_attributions")');
  expect(referralPanel).toContain('.eq("referred_user_id", user.id)');
});
