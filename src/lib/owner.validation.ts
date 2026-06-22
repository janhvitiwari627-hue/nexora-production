// Shared Zod schemas + helpers for Salon Owner validation rules.
// Import these in forms (client) AND server functions to keep rules consistent.

import { z } from "zod";
import { MIN_WITHDRAWAL_AMOUNT } from "./owner.constants";

// ---------- Limits ----------
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MIN_LOGO_DIMENSION_PX = 200;
export const MAX_SHORT_TEXT = 120;
export const MAX_DESCRIPTION = 2000;
export const MAX_SEO_TITLE = 60;
export const MAX_SEO_DESCRIPTION = 160;
export const DAILY_WITHDRAWAL_LIMIT = 50_000;
export const MONTHLY_WITHDRAWAL_LIMIT = 500_000;

// ---------- Reusable schemas ----------
export const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color (e.g. #1A2B3C)");

export const shortTextSchema = z.string().trim().min(1, "Required").max(MAX_SHORT_TEXT);
export const descriptionSchema = z.string().trim().max(MAX_DESCRIPTION);
export const seoTitleSchema = z.string().trim().max(MAX_SEO_TITLE);
export const seoDescriptionSchema = z.string().trim().max(MAX_SEO_DESCRIPTION);

export const bankAccountSchema = z.object({
  account_holder: z.string().trim().min(2).max(100),
  account_number: z.string().trim().regex(/^\d{9,18}$/, "Account number must be 9-18 digits"),
  ifsc: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  bank_name: z.string().trim().min(2).max(100),
});

export const withdrawalRequestSchema = z.object({
  amount: z
    .number()
    .min(MIN_WITHDRAWAL_AMOUNT, `Minimum withdrawal is ₹${MIN_WITHDRAWAL_AMOUNT}`)
    .max(DAILY_WITHDRAWAL_LIMIT, `Daily limit is ₹${DAILY_WITHDRAWAL_LIMIT.toLocaleString("en-IN")}`),
  bank_account_details: bankAccountSchema,
});

// ---------- File / image validation ----------
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "File must be an image";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "Image must be 5MB or less";
  return null;
}

/** Browser-only: resolves with { width, height } or rejects if not loadable. */
export function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

/** Logo-specific check: 5MB + min 200x200. Returns error message or null. */
export async function validateLogoFile(file: File): Promise<string | null> {
  const sizeErr = validateImageFile(file);
  if (sizeErr) return sizeErr;
  try {
    const { width, height } = await readImageDimensions(file);
    if (width < MIN_LOGO_DIMENSION_PX || height < MIN_LOGO_DIMENSION_PX) {
      return `Logo must be at least ${MIN_LOGO_DIMENSION_PX}×${MIN_LOGO_DIMENSION_PX}px`;
    }
  } catch {
    return "Could not read image";
  }
  return null;
}
