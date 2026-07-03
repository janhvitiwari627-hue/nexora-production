import { test, expect, type Page } from "@playwright/test";

/**
 * Regression coverage for /hire/post-job quick-select chips and presets.
 *
 * Every chip/preset on the wizard must:
 *   1. Update real form state (mirrored in the draft written to
 *      `nexora:postJobWizard:v1`) — no visual-only chips.
 *   2. Survive a full page refresh (draft rehydration) with the chip
 *      still visually active.
 *   3. Ship the derived value into the POST payload sent to the
 *      Supabase `/rest/v1/jobs` endpoint when the employer publishes.
 *
 * Requires an authenticated Lovable browser session (LOVABLE_BROWSER_*).
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
const DRAFT_KEY = "nexora:postJobWizard:v1";

type Draft = {
  step: number;
  form: Record<string, unknown>;
  skillsInput?: string;
};

async function seedSession(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [STORAGE_KEY!, SESSION_JSON!],
  );
}

async function readDraft(page: Page): Promise<Draft | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  }, DRAFT_KEY);
}

async function waitForForm(
  page: Page,
  predicate: (form: Record<string, any>) => boolean,
) {
  await expect
    .poll(async () => {
      const d = await readDraft(page);
      return d?.form ? predicate(d.form) : false;
    }, { timeout: 5_000 })
    .toBe(true);
}

/** Click a chip by its exact accessible name; asserts it becomes pressed. */
async function pickChip(page: Page, name: string) {
  const chip = page.getByRole("button", { name, exact: true }).first();
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
}

async function gotoFreshWizard(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => window.localStorage.removeItem(key), DRAFT_KEY);
  await seedSession(page);
  await page.goto("/hire/post-job", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Job details" })).toBeVisible({
    timeout: 10_000,
  });
}

async function fillStep1(page: Page) {
  await page.getByRole("textbox", { name: "Job title" }).fill("Senior Hair Stylist");
  // Category chip — beauty category directly below the title.
  await pickChip(page, "Hair Stylist");
  // Role suggestion chip (populated after the category selection).
  await pickChip(page, "Senior Hair Stylist");
  // Employment type + experience chips.
  await pickChip(page, "Part-time");
  await pickChip(page, "1–2 years");
  // Description template chip fills the textarea (empty description path).
  // Template buttons don't carry aria-pressed, so click without pickChip's assertion.
  await page.getByRole("button", { name: "Hair salon role", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Description" })).not.toHaveValue("");
  await page.getByRole("button", { name: /^Continue$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Location & schedule" })).toBeVisible({
    timeout: 10_000,
  });
}

async function fillStep2(page: Page) {
  await pickChip(page, "Salon");
  await pickChip(page, "At salon / studio");
  await pickChip(page, "Mumbai");
  await pickChip(page, "Mon–Sat");
  await pickChip(page, "10 AM – 7 PM");
  await pickChip(page, "Within 7 days");
  await page.getByRole("button", { name: /^Continue$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Salary & benefits" })).toBeVisible({
    timeout: 10_000,
  });
}

async function fillStep3(page: Page) {
  await pickChip(page, "Monthly salary");
  await pickChip(page, "₹18,000 – ₹25,000");
  // Benefit bundle expands into multiple benefits, plus one direct benefit chip.
  await pickChip(page, "Basic benefits");
  await pickChip(page, "Paid leave");
  await page.getByRole("button", { name: /^Continue$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Requirements" })).toBeVisible({
    timeout: 10_000,
  });
}

async function fillStep4(page: Page) {
  // Certification, language, portfolio option, and one suggested screening q.
  await pickChip(page, "Beauty course certificate");
  await pickChip(page, "Hindi");
  await pickChip(page, "English");
  await pickChip(page, "Portfolio required");
  await pickChip(page, "How many years of experience do you have?");
  await page.getByRole("button", { name: /^Continue$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Review & publish" })).toBeVisible({
    timeout: 10_000,
  });
}

test.describe("/hire/post-job quick-select chips", () => {
  test.skip(
    !STORAGE_KEY || !SESSION_JSON,
    "Supabase session env vars not present; skipping quick-select checks.",
  );

  test("every chip on every step writes into the draft form state", async ({ page }) => {
    await gotoFreshWizard(page);

    // ── Step 1: Job details ────────────────────────────────────────────
    await page.getByRole("textbox", { name: "Job title" }).fill("Senior Hair Stylist");
    await pickChip(page, "Hair Stylist");
    await waitForForm(page, (f) => f.category === "Hair Stylist");

    await pickChip(page, "Senior Hair Stylist");
    await waitForForm(page, (f) => f.job_role === "Senior Hair Stylist");

    await pickChip(page, "Part-time");
    await waitForForm(page, (f) => f.job_type === "Part-time");

    await pickChip(page, "1–2 years");
    await waitForForm(page, (f) => f.experience_level === "1–2 years");

    await page.getByRole("button", { name: "Hair salon role", exact: true }).click();
    await waitForForm(page, (f) => typeof f.description === "string" && (f.description as string).length > 20);

    await page.getByRole("button", { name: /^Continue$/ }).first().click();
    await expect(page.getByRole("heading", { name: "Location & schedule" })).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 2: Location & schedule ────────────────────────────────────
    await pickChip(page, "Salon");
    await waitForForm(page, (f) => f.business_type === "Salon");

    await pickChip(page, "At salon / studio");
    await waitForForm(page, (f) => f.work_location === "At salon / studio");

    await pickChip(page, "Mumbai");
    await waitForForm(page, (f) => f.city === "Mumbai");

    await pickChip(page, "Mon–Sat");
    await waitForForm(page, (f) => f.days_preset === "Mon–Sat");

    await pickChip(page, "10 AM – 7 PM");
    await waitForForm(
      page,
      (f) =>
        f.hours_preset === "10 AM – 7 PM" &&
        f.start_time === "10 AM" &&
        f.end_time === "7 PM",
    );

    await pickChip(page, "Within 7 days");
    await waitForForm(page, (f) => f.joining_availability === "Within 7 days");

    await page.getByRole("button", { name: /^Continue$/ }).first().click();
    await expect(page.getByRole("heading", { name: "Salary & benefits" })).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 3: Salary & benefits ──────────────────────────────────────
    await pickChip(page, "Monthly salary");
    await waitForForm(page, (f) => f.salary_type === "Monthly salary");

    await pickChip(page, "₹18,000 – ₹25,000");
    await waitForForm(
      page,
      (f) =>
        f.salary_range_preset === "₹18,000 – ₹25,000" &&
        f.salary_min === 18000 &&
        f.salary_max === 25000 &&
        f.salary_period === "monthly",
    );

    await pickChip(page, "Basic benefits");
    await waitForForm(page, (f) => {
      const b = (f.benefits as string[]) ?? [];
      return (
        b.includes("Weekly off") &&
        b.includes("Training provided") &&
        b.includes("Incentives")
      );
    });

    await pickChip(page, "Paid leave");
    await waitForForm(page, (f) => ((f.benefits as string[]) ?? []).includes("Paid leave"));

    await page.getByRole("button", { name: /^Continue$/ }).first().click();
    await expect(page.getByRole("heading", { name: "Requirements" })).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 4: Requirements ───────────────────────────────────────────
    await pickChip(page, "Beauty course certificate");
    await waitForForm(page, (f) => f.certification === "Beauty course certificate");

    await pickChip(page, "Hindi");
    await pickChip(page, "English");
    await waitForForm(page, (f) => {
      const l = (f.languages as string[]) ?? [];
      return l.includes("Hindi") && l.includes("English");
    });

    await pickChip(page, "Portfolio required");
    await waitForForm(page, (f) => f.portfolio_option === "Portfolio required");

    await pickChip(page, "How many years of experience do you have?");
    await waitForForm(page, (f) => {
      const q = (f.screening_questions as Array<{ q: string }>) ?? [];
      return q.some((s) => s.q === "How many years of experience do you have?");
    });
  });

  test("selected chips survive a full page refresh (draft rehydration)", async ({ page }) => {
    await gotoFreshWizard(page);
    await fillStep1(page);
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4(page);

    // Sanity check: draft holds the selections we made.
    const before = await readDraft(page);
    expect(before?.form.category).toBe("Hair Stylist");
    expect(before?.form.salary_min).toBe(18000);

    // Hard reload — the wizard must resume on Step 5 with all chips
    // still pressed and the draft form unchanged.
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Review & publish" })).toBeVisible({
      timeout: 10_000,
    });

    const after = await readDraft(page);
    expect(after?.step).toBe(4);
    expect(after?.form).toMatchObject({
      title: "Senior Hair Stylist",
      category: "Hair Stylist",
      job_role: "Senior Hair Stylist",
      job_type: "Part-time",
      experience_level: "1–2 years",
      business_type: "Salon",
      work_location: "At salon / studio",
      city: "Mumbai",
      days_preset: "Mon–Sat",
      hours_preset: "10 AM – 7 PM",
      start_time: "10 AM",
      end_time: "7 PM",
      joining_availability: "Within 7 days",
      salary_type: "Monthly salary",
      salary_range_preset: "₹18,000 – ₹25,000",
      salary_min: 18000,
      salary_max: 25000,
      salary_period: "monthly",
      certification: "Beauty course certificate",
      portfolio_option: "Portfolio required",
    });
    expect(after?.form.benefits as string[]).toEqual(
      expect.arrayContaining(["Weekly off", "Training provided", "Incentives", "Paid leave"]),
    );
    expect(after?.form.languages as string[]).toEqual(
      expect.arrayContaining(["Hindi", "English"]),
    );
    expect(after?.form.screening_questions as Array<{ q: string }>).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ q: "How many years of experience do you have?" }),
      ]),
    );

    // Chips on the visible Review step's live preview / earlier steps should
    // still be marked pressed when the user navigates back.
    await page.getByRole("button", { name: /^Back$/ }).first().click(); // → Requirements
    await expect(
      page.getByRole("button", { name: "Portfolio required", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Beauty course certificate", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("publishing posts every chip-derived value to /rest/v1/jobs", async ({ page }) => {
    await gotoFreshWizard(page);

    // Intercept the create POST and 500 it after capturing the body so we
    // don't create a real listing on every CI run.
    let capturedBody: Record<string, unknown> | null = null;
    await page.route(/\/rest\/v1\/jobs(\?|$)/, async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }
      try {
        capturedBody = JSON.parse(route.request().postData() ?? "{}");
      } catch {
        capturedBody = null;
      }
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "intercepted" }),
      });
    });

    await fillStep1(page);
    await fillStep2(page);
    await fillStep3(page);
    await fillStep4(page);

    await page.getByRole("button", { name: /^Publish job$/ }).first().click();
    await expect
      .poll(() => capturedBody, { timeout: 15_000 })
      .not.toBeNull();

    const body = capturedBody! as Record<string, any>;
    expect(body).toMatchObject({
      title: "Senior Hair Stylist",
      category: "Hair Stylist",
      job_role: "Senior Hair Stylist",
      specific_role: "Senior Hair Stylist",
      job_type: "Part-time",
      experience_level: "1–2 years",
      business_type: "Salon",
      work_location: "At salon / studio",
      location_type: "At salon / studio",
      city: "Mumbai",
      start_time: "10 AM",
      end_time: "7 PM",
      joining_date_type: "Within 7 days",
      salary_type: "Monthly salary",
      salary_min: 18000,
      salary_max: 25000,
      salary_period: "monthly",
      certification_requirement: "Beauty course certificate",
      portfolio_required: true,
      portfolio_type: "portfolio_required",
      resume_preferred: false,
      status: "published",
    });
    expect(body.working_days).toEqual(["Mon–Sat"]);
    expect(body.benefits).toEqual(
      expect.arrayContaining(["Weekly off", "Training provided", "Incentives", "Paid leave"]),
    );
    expect(body.language_preferences).toEqual(expect.arrayContaining(["Hindi", "English"]));
    expect(body.screening_questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ q: "How many years of experience do you have?" }),
      ]),
    );
    // Description template chip filled the description — non-empty in payload.
    expect(typeof body.description).toBe("string");
    expect((body.description as string).length).toBeGreaterThan(20);
  });
});
