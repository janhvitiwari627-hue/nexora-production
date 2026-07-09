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

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error(
    "Missing env. Need SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(2);
}

const admin = createClient(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const anonClient = () =>
  createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });

const userClient = (accessToken) =>
  createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

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

  // ---------- Seed ----------
  const owner = await createUser("owner");
  const staff = await createUser("staff");
  const stranger = await createUser("stranger");
  const admin1 = await createUser("admin");
  const createdUserIds = [owner.id, staff.id, stranger.id, admin1.id];

  const cleanupIds = { salons: [], businesses: [] };

  try {
    // Grant admin role
    {
      const { error } = await admin
        .from("user_roles")
        .insert({ user_id: admin1.id, role: "admin" });
      if (error) throw new Error(`insert admin role: ${error.message}`);
    }

    // Public + active salon (owned by owner)
    const activeSlug = `rls-active-${randomUUID().slice(0, 8)}`;
    const activeSalon = await admin
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
      .single();
    if (activeSalon.error) throw new Error(`seed active salon: ${activeSalon.error.message}`);
    cleanupIds.salons.push(activeSalon.data.id);

    // Inactive salon (should be hidden from anon)
    const inactiveSalon = await admin
      .from("salons")
      .insert({
        name: "RLS Inactive Salon",
        slug: `rls-inactive-${randomUUID().slice(0, 8)}`,
        is_active: false,
        phone: "1112223333",
      })
      .select("id")
      .single();
    if (inactiveSalon.error) throw new Error(`seed inactive salon: ${inactiveSalon.error.message}`);
    cleanupIds.salons.push(inactiveSalon.data.id);

    // Salon ownership + staff link
    {
      const { error } = await admin.from("salon_owners").insert({
        user_id: owner.id,
        salon_id: activeSalon.data.id,
        role: "owner",
        is_approved: true,
        approved_at: new Date().toISOString(),
      });
      if (error) throw new Error(`salon_owners: ${error.message}`);
    }
    {
      // Register `staff` as an approved member (staff role) of the active salon.
      const { error } = await admin.from("salon_owners").insert({
        user_id: staff.id,
        salon_id: activeSalon.data.id,
        role: "manager",
        is_approved: true,
        approved_at: new Date().toISOString(),
      });
      if (error) throw new Error(`salon_owners staff: ${error.message}`);
    }

    // Active business owned by owner
    const activeBiz = await admin
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
      .single();
    if (activeBiz.error) throw new Error(`seed active biz: ${activeBiz.error.message}`);
    cleanupIds.businesses.push(activeBiz.data.id);

    // Pending business owned by owner (private)
    const pendingBiz = await admin
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
      .single();
    if (pendingBiz.error) throw new Error(`seed pending biz: ${pendingBiz.error.message}`);
    cleanupIds.businesses.push(pendingBiz.data.id);

    // Register staff in shop_members for pending business (should NOT grant read
    // when policy is scoped correctly? Actually shop_members grants member reads —
    // we test that STRANGER cannot read pending business.)

    const anon = anonClient();
    const asOwner = userClient(owner.accessToken);
    const asStaff = userClient(staff.accessToken);
    const asStranger = userClient(stranger.accessToken);
    const asAdmin = userClient(admin1.accessToken);

    // =====================================================================
    console.log("\n[public_salon_cards / salons] anonymous access");
    // =====================================================================
    {
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
    }
    {
      const { data } = await anon
        .from("public_salon_cards")
        .select("id")
        .eq("id", inactiveSalon.data.id)
        .maybeSingle();
      check("anon cannot see inactive salon via public view", data === null);
    }
    {
      // Direct base-table access to sensitive columns must fail (no column grant).
      const { error } = await anon
        .from("salons")
        .select("email, owner_name, upi_id, phone")
        .eq("id", activeSalon.data.id);
      check(
        "anon cannot select sensitive salon columns (email/owner_name/upi_id/phone)",
        !!error,
        error ? undefined : "query unexpectedly succeeded",
      );
    }
    {
      // Non-sensitive columns should still be readable directly (used by RPCs).
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
    }

    // =====================================================================
    console.log("\n[salons] role-based access");
    // =====================================================================
    {
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
    }
    {
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
    }
    {
      const { data, error } = await asStaff
        .from("salons")
        .select("email")
        .eq("id", activeSalon.data.id)
        .maybeSingle();
      check(
        "staff cannot select sensitive salon column (email)",
        !!error || data?.email == null,
        `error=${error?.message} data=${JSON.stringify(data)}`,
      );
    }
    {
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
    }
    {
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
    }

    // =====================================================================
    console.log("\n[businesses / public_businesses] anonymous access");
    // =====================================================================
    {
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
    }
    {
      const { data } = await anon
        .from("public_businesses")
        .select("id")
        .eq("id", pendingBiz.data.id)
        .maybeSingle();
      check("anon cannot see pending business via public view", data === null);
    }
    {
      const { error } = await anon
        .from("businesses")
        .select("phone, whatsapp_number")
        .eq("id", activeBiz.data.id);
      check(
        "anon cannot select phone/whatsapp_number from businesses base table",
        !!error,
        error ? undefined : "query unexpectedly succeeded",
      );
    }
    {
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
    }

    // =====================================================================
    console.log("\n[businesses] role-based access");
    // =====================================================================
    {
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
    }
    {
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
    }
    {
      const { data, error } = await asStranger
        .from("businesses")
        .select("phone, whatsapp_number")
        .eq("id", activeBiz.data.id);
      check(
        "stranger cannot select phone/whatsapp_number even for active business",
        !!error,
        error ? undefined : "query unexpectedly succeeded",
      );
    }
    {
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
    }
  } finally {
    // ---------- Cleanup ----------
    if (cleanupIds.businesses.length)
      await admin.from("businesses").delete().in("id", cleanupIds.businesses);
    if (cleanupIds.salons.length)
      await admin.from("salons").delete().in("id", cleanupIds.salons);
    for (const id of createdUserIds) await cleanupUser(id);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
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
