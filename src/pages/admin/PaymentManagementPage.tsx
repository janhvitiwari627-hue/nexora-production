import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, RefreshCcw, Search, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// ---------- Typed update payload helpers ----------
// These narrow the shape of admin-issued updates so we never pass a bare
// Record<string, unknown> into Supabase's typed `.update()` (which surfaces
// as a RejectExcessProperties error). Each helper returns the exact
// `Tables<>["Update"]` slice its mutation writes.
type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];
type PendingPaymentUpdate = Database["public"]["Tables"]["pending_payments"]["Update"];
type WithdrawalUpdate = Database["public"]["Tables"]["withdrawals"]["Update"];

type PaymentStatus = "CREATED" | "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
type PendingStatus = "approved" | "rejected";
type WithdrawalStatus = "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";

function buildRefundPayload(reason: string): PaymentUpdate {
  return {
    status: "REFUNDED",
    failure_reason: reason,
    processed_at: new Date().toISOString(),
  };
}

function buildPaymentStatusPayload(status: PaymentStatus, reason?: string): PaymentUpdate {
  const patch: PaymentUpdate = {
    status,
    processed_at: new Date().toISOString(),
  };
  if (reason) patch.failure_reason = reason;
  return patch;
}

function buildPendingStatusPayload(status: PendingStatus): PendingPaymentUpdate {
  return {
    status,
    updated_at: new Date().toISOString(),
  };
}

function buildWithdrawalStatusPayload(status: WithdrawalStatus): WithdrawalUpdate {
  const patch: WithdrawalUpdate = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "COMPLETED" || status === "REJECTED") {
    patch.processed_at = new Date().toISOString();
  }
  return patch;
}

type Payment = {
  id: string;
  transaction_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_type: string | null;
  created_at: string;
  processed_at: string | null;
  customer_id: string | null;
  salon_id: string | null;
  booking_id: string | null;
  failure_reason: string | null;
  gateway_response: unknown;
};

type PendingPayment = {
  id: string;
  user_id: string;
  booking_id: string | null;
  transaction_id: string;
  screenshot_url: string | null;
  status: string;
  created_at: string;
};

type Withdrawal = {
  id: string;
  salon_id: string;
  amount: number;
  status: string;
  bank_account_details: unknown;
  processed_at: string | null;
  created_at: string;
};

type RejectTarget =
  | { kind: "payment"; id: string; label: string }
  | { kind: "pending"; id: string; label: string }
  | { kind: "withdrawal"; id: string; label: string };

type ConfirmTarget = {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
};

const MIN_REASON = 5;

function fmtINR(n: number) {
  return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  const v = s.toUpperCase();
  if (v === "SUCCESS" || v === "COMPLETED" || v === "APPROVED") return "default";
  if (v === "FAILED" || v === "REJECTED" || v === "CANCELLED") return "destructive";
  if (v === "REFUNDED") return "outline";
  return "secondary";
}

export function PaymentManagementPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("txn");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundReasonError, setRefundReasonError] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState<string | null>(null);

  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);

  // ---------- Queries ----------
  const paymentsQ = useQuery({
    queryKey: ["admin-payments", statusFilter],
    queryFn: async () => {
      let q = supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(500);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });

  const pendingQ = useQuery({
    queryKey: ["admin-pending-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as PendingPayment[];
    },
  });

  const withdrawalsQ = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Withdrawal[];
    },
  });

  // ---------- Mutations ----------
  const refundPayment = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("payments")
        .update(buildRefundPayload(reason))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment refunded");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      closeRefund();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markPaymentStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: PaymentStatus;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("payments")
        .update(buildPaymentStatusPayload(status, reason))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`Marked ${v.status}`);
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setPendingStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: PendingStatus;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("pending_payments")
        .update(buildPendingStatusPayload(status))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(
        v.status === "approved"
          ? "Payment approved"
          : `Payment rejected${v.reason ? ` — reason recorded` : ""}`,
      );
      qc.invalidateQueries({ queryKey: ["admin-pending-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setWithdrawalStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: WithdrawalStatus;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from("withdrawals")
        .update(buildWithdrawalStatusPayload(status))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`Withdrawal ${v.status.toLowerCase()}${v.reason ? " — reason recorded" : ""}`);
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---------- Helpers ----------
  function closeRefund() {
    setRefundTarget(null);
    setRefundReason("");
    setRefundReasonError(null);
  }
  function closeReject() {
    setRejectTarget(null);
    setRejectReason("");
    setRejectReasonError(null);
  }

  function submitRefund() {
    if (!refundTarget) return;
    const trimmed = refundReason.trim();
    if (trimmed.length < MIN_REASON) {
      setRefundReasonError(`Please provide a reason (at least ${MIN_REASON} characters).`);
      return;
    }
    refundPayment.mutate({ id: refundTarget.id, reason: trimmed });
  }

  function submitReject() {
    if (!rejectTarget) return;
    const trimmed = rejectReason.trim();
    if (trimmed.length < MIN_REASON) {
      setRejectReasonError(`Rejection reason is required (at least ${MIN_REASON} characters).`);
      return;
    }
    if (rejectTarget.kind === "payment") {
      markPaymentStatus.mutate(
        { id: rejectTarget.id, status: "FAILED", reason: trimmed },
        { onSuccess: () => closeReject() },
      );
    } else if (rejectTarget.kind === "pending") {
      setPendingStatus.mutate(
        { id: rejectTarget.id, status: "rejected", reason: trimmed },
        { onSuccess: () => closeReject() },
      );
    } else {
      setWithdrawalStatus.mutate(
        { id: rejectTarget.id, status: "REJECTED", reason: trimmed },
        { onSuccess: () => closeReject() },
      );
    }
  }

  // ---------- Derived ----------
  const filteredPayments = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = paymentsQ.data ?? [];
    if (!s) return list;
    return list.filter(
      (p) =>
        p.transaction_id.toLowerCase().includes(s) ||
        (p.payment_method ?? "").toLowerCase().includes(s) ||
        (p.customer_id ?? "").toLowerCase().includes(s) ||
        (p.salon_id ?? "").toLowerCase().includes(s),
    );
  }, [search, paymentsQ.data]);

  const stats = useMemo(() => {
    const list = paymentsQ.data ?? [];
    const success = list.filter((p) => p.status === "SUCCESS");
    const refunded = list.filter((p) => p.status === "REFUNDED");
    return {
      total: list.length,
      revenue: success.reduce((s, p) => s + Number(p.amount), 0),
      refunded: refunded.reduce((s, p) => s + Number(p.amount), 0),
      pendingCount: (pendingQ.data ?? []).filter((x) => x.status === "pending").length,
      withdrawalsPending: (withdrawalsQ.data ?? []).filter((w) => w.status === "PENDING").length,
    };
  }, [paymentsQ.data, pendingQ.data, withdrawalsQ.data]);

  const rejectMutating =
    markPaymentStatus.isPending || setPendingStatus.isPending || setWithdrawalStatus.isPending;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payments & Billing</h1>
          <p className="text-muted-foreground text-sm">
            All transactions, pending verifications, refunds & shop withdrawals
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["admin-payments"] });
            qc.invalidateQueries({ queryKey: ["admin-pending-payments"] });
            qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
          }}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </header>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Transactions" value={String(stats.total)} />
        <StatCard label="Revenue (Success)" value={fmtINR(stats.revenue)} />
        <StatCard label="Refunded" value={fmtINR(stats.refunded)} />
        <StatCard label="Pending Verifications" value={String(stats.pendingCount)} />
        <StatCard label="Withdrawals Pending" value={String(stats.withdrawalsPending)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="txn">Transactions</TabsTrigger>
          <TabsTrigger value="verify">Verifications ({stats.pendingCount})</TabsTrigger>
          <TabsTrigger value="withdraw">Withdrawals ({stats.withdrawalsPending})</TabsTrigger>
        </TabsList>

        {/* ---------- Transactions ---------- */}
        <TabsContent value="txn" className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search txn id, method, customer/salon id…"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="CREATED">Created</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {paymentsQ.isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-muted-foreground p-10 text-center text-sm">No transactions found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Txn ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                        <TableCell>{p.payment_type ?? "—"}</TableCell>
                        <TableCell className="font-semibold">{fmtINR(Number(p.amount))}</TableCell>
                        <TableCell>{p.payment_method ?? "—"}</TableCell>
                        <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-xs">{fmtDate(p.created_at)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {p.status === "SUCCESS" && (
                            <Button size="sm" variant="outline" onClick={() => setRefundTarget(p)}>
                              Refund
                            </Button>
                          )}
                          {(p.status === "CREATED" || p.status === "PENDING") && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setConfirmTarget({
                                    title: "Mark payment as Success?",
                                    description: `Transaction ${p.transaction_id} (${fmtINR(Number(p.amount))}) will be marked SUCCESS. This releases funds and cannot be silently undone.`,
                                    confirmLabel: "Mark Success",
                                    onConfirm: () =>
                                      markPaymentStatus.mutate({ id: p.id, status: "SUCCESS" }),
                                  })
                                }
                              >
                                Mark Success
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setRejectTarget({
                                    kind: "payment",
                                    id: p.id,
                                    label: `${p.transaction_id} (${fmtINR(Number(p.amount))})`,
                                  })
                                }
                              >
                                Mark Failed
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Pending verifications ---------- */}
        <TabsContent value="verify" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              {pendingQ.isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (pendingQ.data ?? []).length === 0 ? (
                <div className="text-muted-foreground p-10 text-center text-sm">No pending verifications</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Txn Ref</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Screenshot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pendingQ.data ?? []).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                        <TableCell className="font-mono text-xs">{p.user_id.slice(0, 8)}…</TableCell>
                        <TableCell className="font-mono text-xs">{p.booking_id ? p.booking_id.slice(0, 8) + "…" : "—"}</TableCell>
                        <TableCell>
                          {p.screenshot_url ? (
                            <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="text-primary text-xs underline">
                              View
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-xs">{fmtDate(p.created_at)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {p.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setConfirmTarget({
                                    title: "Approve this payment?",
                                    description: `Verify that transaction ${p.transaction_id} was received before approving. This will mark the payment as approved.`,
                                    confirmLabel: "Approve Payment",
                                    onConfirm: () =>
                                      setPendingStatus.mutate({ id: p.id, status: "approved" }),
                                  })
                                }
                              >
                                <Check className="h-4 w-4" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setRejectTarget({
                                    kind: "pending",
                                    id: p.id,
                                    label: p.transaction_id,
                                  })
                                }
                              >
                                <X className="h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Withdrawals ---------- */}
        <TabsContent value="withdraw" className="space-y-3">
          <Card>
            <CardContent className="p-0">
              {withdrawalsQ.isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (withdrawalsQ.data ?? []).length === 0 ? (
                <div className="text-muted-foreground p-10 text-center text-sm">No withdrawal requests</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salon</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(withdrawalsQ.data ?? []).map((w) => {
                      const bank = (w.bank_account_details ?? {}) as {
                        accountName?: string; accountNumber?: string; ifsc?: string;
                      };
                      const amountLabel = fmtINR(Number(w.amount));
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="font-mono text-xs">{w.salon_id.slice(0, 8)}…</TableCell>
                          <TableCell className="font-semibold">{amountLabel}</TableCell>
                          <TableCell className="text-xs">
                            {bank.accountName ?? "—"}<br />
                            <span className="text-muted-foreground">
                              {bank.accountNumber ?? ""} {bank.ifsc ? `· ${bank.ifsc}` : ""}
                            </span>
                          </TableCell>
                          <TableCell><Badge variant={statusVariant(w.status)}>{w.status}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-xs">{fmtDate(w.created_at)}</TableCell>
                          <TableCell className="text-right space-x-1">
                            {w.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setConfirmTarget({
                                    title: "Approve withdrawal?",
                                    description: `Move ${amountLabel} to PROCESSING for salon ${w.salon_id.slice(0, 8)}…. You can then mark it Paid once the transfer is completed.`,
                                    confirmLabel: "Approve",
                                    onConfirm: () =>
                                      setWithdrawalStatus.mutate({ id: w.id, status: "PROCESSING" }),
                                  })
                                }
                              >
                                Approve
                              </Button>
                            )}
                            {(w.status === "PENDING" || w.status === "PROCESSING") && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    setConfirmTarget({
                                      title: "Mark withdrawal as Paid?",
                                      description: `Confirm that ${amountLabel} has been transferred to ${bank.accountName ?? "the salon"}${bank.accountNumber ? ` (A/C ${bank.accountNumber})` : ""}. This action is final.`,
                                      confirmLabel: "Mark Paid",
                                      onConfirm: () =>
                                        setWithdrawalStatus.mutate({ id: w.id, status: "COMPLETED" }),
                                    })
                                  }
                                >
                                  Mark Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    setRejectTarget({
                                      kind: "withdrawal",
                                      id: w.id,
                                      label: `${amountLabel} · ${w.salon_id.slice(0, 8)}…`,
                                    })
                                  }
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refund dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(o) => !o && closeRefund()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Refund Payment
            </DialogTitle>
            <DialogDescription>
              Refunds are permanent and will be visible to the customer. Please provide a clear reason for audit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Transaction: </span>
              <span className="font-mono">{refundTarget?.transaction_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-semibold">{refundTarget ? fmtINR(Number(refundTarget.amount)) : ""}</span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refund-reason">
                Refund reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="refund-reason"
                placeholder="Explain why this payment is being refunded (min 5 characters)"
                value={refundReason}
                onChange={(e) => {
                  setRefundReason(e.target.value);
                  if (refundReasonError) setRefundReasonError(null);
                }}
                maxLength={500}
                aria-invalid={!!refundReasonError}
              />
              <div className="flex justify-between text-xs">
                <span className={refundReasonError ? "text-destructive" : "text-muted-foreground"}>
                  {refundReasonError ?? `Required, minimum ${MIN_REASON} characters.`}
                </span>
                <span className="text-muted-foreground">{refundReason.trim().length}/500</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeRefund} disabled={refundPayment.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitRefund}
              disabled={refundPayment.isPending || refundReason.trim().length < MIN_REASON}
            >
              {refundPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog (shared) */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && !rejectMutating && closeReject()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-5 w-5" />
              {rejectTarget?.kind === "payment"
                ? "Mark payment as Failed"
                : rejectTarget?.kind === "withdrawal"
                  ? "Reject Withdrawal"
                  : "Reject Payment Verification"}
            </DialogTitle>
            <DialogDescription>
              This action is destructive and cannot be silently reversed. A reason is required and will be
              recorded for audit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {rejectTarget && (
              <div>
                <span className="text-muted-foreground">Target: </span>
                <span className="font-mono">{rejectTarget.label}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Explain why this is being rejected (min 5 characters)"
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectReasonError) setRejectReasonError(null);
                }}
                maxLength={500}
                aria-invalid={!!rejectReasonError}
                autoFocus
              />
              <div className="flex justify-between text-xs">
                <span className={rejectReasonError ? "text-destructive" : "text-muted-foreground"}>
                  {rejectReasonError ?? `Required, minimum ${MIN_REASON} characters.`}
                </span>
                <span className="text-muted-foreground">{rejectReason.trim().length}/500</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeReject} disabled={rejectMutating}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitReject}
              disabled={rejectMutating || rejectReason.trim().length < MIN_REASON}
            >
              {rejectMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic confirm dialog for non-destructive / positive actions */}
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTarget?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmTarget?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmTarget?.onConfirm();
                setConfirmTarget(null);
              }}
              className={
                confirmTarget?.destructive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {confirmTarget?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground text-xs">{label}</div>
        <div className="mt-1 text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
