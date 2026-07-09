#!/usr/bin/env node
/**
 * Automated RLS tests for `salons` and `businesses`.
 *
 * Verifies:
 *  - Anonymous visitors can read active rows via public views/columns,
 *    but cannot read sensitive PII columns on the base tables.
 *  - Non-member authenticated users cannot see pending/inactive private rows.
 *  - Owners can read their own business/salon (all columns).
 *  - Staff members can read the salons they are attached to.
 *  - Admins can read everything.
 *
 * Usage:
 *   SUPABASE_URL=... \
 *   SUPABASE_PUBLISHABLE_KEY=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/test-rls.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { mkdirSync, createWriteStream } from "node:fs";
import { join } from "node:path";

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error(
    "Missing env. Need SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(2);
}

// Optional request/response log — enabled when RLS_LOG_DIR is set (CI artifact use).
const LOG_DIR = process.env.RLS_LOG_DIR;
let logStream = null;
if (LOG_DIR) {
  mkdirSync(LOG_DIR, { recursive: true });
  logStream = createWriteStream(join(LOG_DIR, "supabase-requests.log"), { flags: "a" });
}

const REDACT_HEADERS = new Set(["authorization", "apikey", "x-connection-api-key", "cookie"]);
function redactHeaders(headers) {
  const out = {};
  const h = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers ?? {};
  for (const [k, v] of Object.entries(h)) {
    out[k] = REDACT_HEADERS.has(k.toLowerCase()) ? "[redacted]" : v;
  }
  return out;
}

async function loggingFetch(input, init = {}) {
  const started = Date.now();
  const method = init.method ?? (typeof input === "object" && "method" in input ? input.method : "GET");
  const url = typeof input === "string" ? input : input.url;
  let res, err;
  try {
    res = await fetch(input, init);
  } catch (e) {
    err = e;
  }
  if (logStream) {
    const duration = Date.now() - started;
    let bodyPreview = "";
    if (res) {
      try {
        const clone = res.clone();
        const text = await clone.text();
        bodyPreview = text.length > 2000 ? text.slice(0, 2000) + "…[truncated]" : text;
      } catch {
        bodyPreview = "[unreadable]";
      }
    }
    logStream.write(
      JSON.stringify({
        ts: new Date().toISOString(),
        method,
        url,
        status: res?.status ?? null,
        duration_ms: duration,
        request_headers: redactHeaders(init.headers),
        response_body: bodyPreview,
        error: err ? String(err) : undefined,
      }) + "\n",
    );
  }
  if (err) throw err;
  return res;
}

const clientOpts = (extra = {}) => ({
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: loggingFetch, ...(extra.global ?? {}) },
  ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== "global")),
});

const admin = createClient(URL, SERVICE, clientOpts());

const anonClient = () => createClient(URL, ANON, clientOpts());

const userClient = (accessToken) =>
  createClient(
    URL,
    ANON,
    clientOpts({ global: { headers: { Authorization: `Bearer ${accessToken}` } } }),
  );

let passed = 0;
let failed = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`);
  }
}

async function createUser(label) {
  const email = `rls-${label}-${randomUUID()}@test.nexora.local`;
  const password = randomUUID() + "!Aa1";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${label}: ${error.message}`);
  // Use a fresh anon client for sign-in so we don't overwrite the admin
  // client's service-role session with a user session.
  const signIn = createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: sess, error: sErr } = await signIn.auth.signInWithPassword({ email, password });
  if (sErr || !sess?.session)
    throw new Error(`signIn ${label}: ${sErr?.message ?? "no session"}`);
  return { id: data.user.id, email, accessToken: sess.session.access_token };
}

async function cleanupUser(id) {
  try {
    await admin.auth.admin.deleteUser(id);
  } catch {
    /* ignore */
  }
}

async function main() {
  console.log("RLS test suite — salons & businesses\n");

  // ---------- Seed (parallelised) ----------
  const [owner, staff, stranger, admin1] = await Promise.all([
    createUser("owner"),
    createUser("staff"),
    createUser("stranger"),
    createUser("admin"),
  ]);
  const createdUserIds = [owner.id, staff.id, stranger.id, admin1.id];

  const cleanupIds = { salons: [], businesses: [] };

  try {
    // Salons + admin role can all be created in parallel (no interdeps).
    const activeSlug = `rls-active-${randomUUID().slice(0, 8)}`;
    const [roleRes, activeSalon, inactiveSalon] = await Promise.all([
      admin.from("user_roles").insert({ user_id: admin1.id, role: "admin" }),
      admin
        .from("salons")
        .insert({
          name: "RLS Active Salon",
          slug: activeSlug,
          is_active: true,
          phone: "9990001111",
          email: "secret-owner@example.com",
          owner_name: "Owner Secret",
          upi_id: "secret@upi",
          business_public_phone: "8887776665",
          business_public_whatsapp: "8887776665",
          show_public_contact: true,
          city: "Jaipur",
          location: "C-Scheme",
        })
        .select("id")
        .single(),
      admin
        .from("salons")
        .insert({
          name: "RLS Inactive Salon",
          slug: `rls-inactive-${randomUUID().slice(0, 8)}`,
          is_active: false,
          phone: "1112223333",
        })
        .select("id")
        .single(),
    ]);
    if (roleRes.error) throw new Error(`insert admin role: ${roleRes.error.message}`);
    if (activeSalon.error) throw new Error(`seed active salon: ${activeSalon.error.message}`);
    if (inactiveSalon.error) throw new Error(`seed inactive salon: ${inactiveSalon.error.message}`);
    cleanupIds.salons.push(activeSalon.data.id, inactiveSalon.data.id);

    // Ownership links + businesses depend on activeSalon.id — parallel batch.
    const nowIso = new Date().toISOString();
    const [ownerLink, staffLink, activeBiz, pendingBiz] = await Promise.all([
      admin.from("salon_owners").insert({
        user_id: owner.id,
        salon_id: activeSalon.data.id,
        role: "owner",
        is_approved: true,
        approved_at: nowIso,
      }),
      admin.from("salon_owners").insert({
        user_id: staff.id,
        salon_id: activeSalon.data.id,
        role: "manager",
        is_approved: true,
        approved_at: nowIso,
      }),
      admin
        .from("businesses")
        .insert({
          owner_id: owner.id,
          salon_id: activeSalon.data.id,
          business_name: "RLS Active Business",
          business_category: "salon",
          phone: "5551110000",
          whatsapp_number: "5551112222",
          city: "Jaipur",
          area_locality: "C-Scheme",
          status: "active",
          is_active: true,
        })
        .select("id")
        .single(),
      admin
        .from("businesses")
        .insert({
          owner_id: owner.id,
          business_name: "RLS Pending Business",
          phone: "5559998888",
          whatsapp_number: "5559997777",
          status: "pending_verification",
          is_active: false,
        })
        .select("id")
        .single(),
    ]);
    if (ownerLink.error) throw new Error(`salon_owners: ${ownerLink.error.message}`);
    if (staffLink.error) throw new Error(`salon_owners staff: ${staffLink.error.message}`);
    if (activeBiz.error) throw new Error(`seed active biz: ${activeBiz.error.message}`);
    if (pendingBiz.error) throw new Error(`seed pending biz: ${pendingBiz.error.message}`);
    cleanupIds.businesses.push(activeBiz.data.id, pendingBiz.data.id);

    const anon = anonClient();
    const asOwner = userClient(owner.accessToken);
    const asStaff = userClient(staff.accessToken);
    const asStranger = userClient(stranger.accessToken);
    const asAdmin = userClient(admin1.accessToken);

    // All assertion reads are independent — run in parallel.
    console.log("\nRunning assertions in parallel...");
    await Promise.all([
      // -------- [public_salon_cards / salons] anonymous access --------
      (async () => {
        const { data, error } = await anon
          .from("public_salon_cards")
          .select("id, name, phone, whatsapp")
          .eq("id", activeSalon.data.id)
          .maybeSingle();
        check(
          "anon can read active salon via public_salon_cards view",
          !error && data?.id === activeSalon.data.id,
          error?.message,
        );
        check(
          "public view exposes masked public phone (not owner phone)",
          data?.phone === "8887776665",
          `got phone=${data?.phone}`,
        );
      })(),
      (async () => {
        const { data } = await anon
          .from("public_salon_cards")
          .select("id")
          .eq("id", inactiveSalon.data.id)
          .maybeSingle();
        check("anon cannot see inactive salon via public view", data === null);
      })(),
      (async () => {
        const { error } = await anon
          .from("salons")
          .select("email, owner_name, upi_id, phone")
          .eq("id", activeSalon.data.id);
        check(
          "anon cannot select sensitive salon columns (email/owner_name/upi_id/phone)",
          !!error,
          error ? undefined : "query unexpectedly succeeded",
        );
      })(),
      (async () => {
        const { data, error } = await anon
          .from("salons")
          .select("id, name, is_active")
          .eq("id", activeSalon.data.id)
          .maybeSingle();
        check(
          "anon can read non-sensitive salon columns of active row",
          !error && data?.id === activeSalon.data.id,
          error?.message,
        );
      })(),
      // -------- [salons] role-based access --------
      (async () => {
        const { data, error } = await asOwner
          .from("salons")
          .select("id, email, owner_name, upi_id, phone")
          .eq("id", activeSalon.data.id)
          .maybeSingle();
        check(
          "owner can read full salon row including sensitive columns",
          !error && data?.email === "secret-owner@example.com" && data?.upi_id === "secret@upi",
          error?.message,
        );
      })(),
      (async () => {
        const { data, error } = await asStaff
          .from("salons")
          .select("id, name")
          .eq("id", activeSalon.data.id)
          .maybeSingle();
        check(
          "staff member can read assigned salon",
          !error && data?.id === activeSalon.data.id,
          error?.message,
        );
      })(),
      (async () => {
        const { data, error } = await asStaff
          .from("salons")
          .select("email")
          .eq("id", activeSalon.data.id)
          .maybeSingle();
        check(
          "approved manager can read sensitive salon column (email) — full-owner policy",
          !error && data?.email === "secret-owner@example.com",
          `error=${error?.message} data=${JSON.stringify(data)}`,
        );
      })(),
      (async () => {
        const { data, error } = await asStranger
          .from("salons")
          .select("id, email")
          .eq("id", inactiveSalon.data.id)
          .maybeSingle();
        check(
          "stranger cannot read inactive salon",
          data === null && !error,
          `data=${JSON.stringify(data)} error=${error?.message}`,
        );
      })(),
      (async () => {
        const { data, error } = await asAdmin
          .from("salons")
          .select("id, email")
          .eq("id", inactiveSalon.data.id)
          .maybeSingle();
        check(
          "admin can read inactive salon (full)",
          !error && data?.id === inactiveSalon.data.id,
          error?.message,
        );
      })(),
      // -------- [businesses / public_businesses] anonymous access --------
      (async () => {
        const { data, error } = await anon
          .from("public_businesses")
          .select("id, business_name")
          .eq("id", activeBiz.data.id)
          .maybeSingle();
        check(
          "anon can read active business via public_businesses view",
          !error && data?.id === activeBiz.data.id,
          error?.message,
        );
      })(),
      (async () => {
        const { data } = await anon
          .from("public_businesses")
          .select("id")
          .eq("id", pendingBiz.data.id)
          .maybeSingle();
        check("anon cannot see pending business via public view", data === null);
      })(),
      (async () => {
        const { error } = await anon
          .from("businesses")
          .select("phone, whatsapp_number")
          .eq("id", activeBiz.data.id);
        check(
          "anon cannot select phone/whatsapp_number from businesses base table",
          !!error,
          error ? undefined : "query unexpectedly succeeded",
        );
      })(),
      (async () => {
        const { data, error } = await anon
          .from("businesses")
          .select("id, business_name, status")
          .eq("id", pendingBiz.data.id)
          .maybeSingle();
        check(
          "anon cannot see pending business row on base table",
          data === null && !error,
          `data=${JSON.stringify(data)} error=${error?.message}`,
        );
      })(),
      // -------- [businesses] role-based access --------
      (async () => {
        const { data, error } = await asOwner
          .from("businesses")
          .select("id, phone, whatsapp_number, status")
          .eq("id", pendingBiz.data.id)
          .maybeSingle();
        check(
          "owner can read own pending business incl. phone/whatsapp",
          !error &&
            data?.phone === "5559998888" &&
            data?.whatsapp_number === "5559997777" &&
            data?.status === "pending_verification",
          error?.message,
        );
      })(),
      (async () => {
        const { data, error } = await asStranger
          .from("businesses")
          .select("id")
          .eq("id", pendingBiz.data.id)
          .maybeSingle();
        check(
          "stranger cannot read pending business",
          data === null && !error,
          `data=${JSON.stringify(data)} error=${error?.message}`,
        );
      })(),
      (async () => {
        const { data, error } = await asStranger
          .from("businesses")
          .select("phone, whatsapp_number")
          .eq("id", activeBiz.data.id);
        check(
          "stranger cannot read phone/whatsapp_number of active business (RLS filters row)",
          !error && Array.isArray(data) && data.length === 0,
          `error=${error?.message} data=${JSON.stringify(data)}`,
        );
      })(),
      (async () => {
        const { data, error } = await asAdmin
          .from("businesses")
          .select("id, phone")
          .eq("id", pendingBiz.data.id)
          .maybeSingle();
        check(
          "admin can read pending business incl. phone",
          !error && data?.phone === "5559998888",
          error?.message,
        );
      })(),
    ]);
  } finally {
    // ---------- Cleanup (parallel) ----------
    await Promise.all([
      cleanupIds.businesses.length
        ? admin.from("businesses").delete().in("id", cleanupIds.businesses)
        : Promise.resolve(),
      cleanupIds.salons.length
        ? admin.from("salons").delete().in("id", cleanupIds.salons)
        : Promise.resolve(),
    ]);
    await Promise.all(createdUserIds.map(cleanupUser));
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (logStream) await new Promise((r) => logStream.end(r));
  if (failed > 0) {
    console.error("\nFailures:");
    for (const f of failures) console.error(`  - ${f.name}${f.detail ? ": " + f.detail : ""}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
