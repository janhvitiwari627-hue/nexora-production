import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- Login event tracking ----------
const RecordLoginInput = z.object({
  user_agent: z.string().max(500).optional(),
  device_label: z.string().max(100).optional(),
});

export const recordLoginEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecordLoginInput.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("login_events")
      .insert({
        user_id: userId,
        user_agent: data.user_agent ?? null,
        device_label: data.device_label ?? null,
        is_active: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listMyLoginEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("login_events")
      .select("id, device_label, user_agent, ip_address, is_active, revoked_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const revokeLoginEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("login_events")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Security audit events ----------
const LogSecurityEventInput = z.object({
  event_type: z.string().min(1).max(64),
  event_details: z.record(z.string(), z.unknown()).optional(),
});

export const logSecurityEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LogSecurityEventInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("security_events").insert({
      user_id: userId,
      event_type: data.event_type,
      event_details: (data.event_details ?? {}) as Record<string, unknown>,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSecurityEventsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("security_events")
      .select("id, user_id, event_type, event_details, ip_address, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Admin: user listing + suspension ----------
export const listAllUsersForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, mobile, is_active, is_verified, created_at, nexora_id")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map((p) => p.id);
    if (ids.length === 0) return [];
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids);
    const roleMap = new Map<string, string>();
    (roles ?? []).forEach((r) => {
      // Keep the highest-priority role (admin > owner > customer)
      const prev = roleMap.get(r.user_id);
      const rank = (x: string) => (x === "admin" ? 3 : x === "owner" ? 2 : 1);
      if (!prev || rank(r.role as string) > rank(prev)) roleMap.set(r.user_id, r.role as string);
    });
    return (profiles ?? []).map((p) => ({
      ...p,
      role: roleMap.get(p.id) ?? "customer",
    }));
  });

const SuspensionInput = z.object({
  user_id: z.string().uuid(),
  suspend: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const setUserSuspension = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SuspensionInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.user_id === context.userId) throw new Error("You cannot suspend yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: !data.suspend })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("security_events").insert({
      user_id: data.user_id,
      event_type: data.suspend ? "account.suspended" : "account.reactivated",
      event_details: { by: context.userId, reason: data.reason ?? null },
    });
    return { ok: true };
  });
