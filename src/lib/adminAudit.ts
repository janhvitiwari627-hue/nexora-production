import { supabase } from "@/integrations/supabase/client";

export type AdminAuditAction =
  | "approve"
  | "reject"
  | "refund"
  | "adjust"
  | "mark_success"
  | "mark_failed"
  | "mark_paid";

export type AdminAuditEntity =
  | "payment"
  | "pending_payment"
  | "withdrawal"
  | "business"
  | "review"
  | "user";

export interface AdminAuditInput {
  action: AdminAuditAction;
  entity: AdminAuditEntity;
  entityId: string;
  reason?: string;
  details?: Record<string, unknown>;
}

/**
 * Records an admin moderation action into public.audit_logs.
 * - actor_id is taken from the current session (auth.uid()).
 * - action is stored as "<entity>.<action>" to match existing conventions
 *   (see log_partner_financial_change).
 * - reason and any structured details are stored in metadata.
 *
 * Errors are swallowed and logged — an audit-log failure must never block
 * the primary moderation action from completing.
 */
export async function recordAdminAction(input: AdminAuditInput): Promise<void> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const actorId = userRes.user?.id ?? null;

    const metadata: Record<string, unknown> = {
      reason: input.reason ?? null,
      recorded_at: new Date().toISOString(),
      ...(input.details ?? {}),
    };

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: actorId,
      action: `${input.entity}.${input.action}`,
      entity_type: input.entity,
      entity_id: input.entityId,
      metadata: metadata as unknown as Record<string, never>,
    } as never);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[admin-audit] insert failed", error.message);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[admin-audit] unexpected error", e);
  }
}
