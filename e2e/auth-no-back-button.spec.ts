import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const authSurfaces = [
  "src/components/shared/PublicPageHeader.tsx",
  "src/pages/auth/CustomerLoginPage.tsx",
  "src/pages/auth/SignupPage.tsx",
  "src/pages/auth/OwnerSignupPage.tsx",
  "src/pages/auth/OwnerBusinessRegisterPage.tsx",
];

test("authentication screens never render a back button", () => {
  for (const file of authSurfaces) {
    const source = readFileSync(file, "utf8");
    expect(source, `${file} must stay free of auth back navigation`).not.toContain("BackButton");
  }
});
