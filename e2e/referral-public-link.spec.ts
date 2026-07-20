import { expect, test } from "@playwright/test";
import {
  buildReferralSignupUrl,
  PUBLIC_APP_ORIGIN,
  resolvePublicAppOrigin,
} from "../src/lib/public-app-url";

test("referral links never expose a temporary Lovable preview host", () => {
  const previewLocation = {
    hostname: "id-preview--822fe342-2aa4-466c-8092-9280657c85a5.lovable.app",
    origin: "https://id-preview--822fe342-2aa4-466c-8092-9280657c85a5.lovable.app",
  } as Location;

  expect(resolvePublicAppOrigin(previewLocation)).toBe(PUBLIC_APP_ORIGIN);
  expect(buildReferralSignupUrl("NX 100", previewLocation)).toBe(
    "https://nexora-production.vercel.app/signup?ref=NX%20100",
  );
});

test("production referral links keep the signed-in user's code on Nexora", () => {
  const productionLocation = {
    hostname: "nexora-production.vercel.app",
    origin: "https://nexora-production.vercel.app",
  } as Location;

  expect(buildReferralSignupUrl("NXKISH01", productionLocation)).toBe(
    "https://nexora-production.vercel.app/signup?ref=NXKISH01",
  );
});

test("local development keeps its local origin", () => {
  const localLocation = {
    hostname: "localhost",
    origin: "http://localhost:3000",
  } as Location;

  expect(resolvePublicAppOrigin(localLocation)).toBe("http://localhost:3000");
});
