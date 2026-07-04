import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, RefreshCcw, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [rejectTarget, setRejectTarget] = useState<{ kind: "pending" | "withdrawal"; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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
        .update({
          status: "REFUNDED",
          failure_reason: reason || "Refunded by admin",
          processed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment refunded");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      setRefundTarget(null);
      setRefundReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markPaymentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("payments")
        .update({ status, processed_at: new Date().toISOString() })
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
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase
        .from("pending_payments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.status === "approved" ? "Payment approved" : "Payment rejected");
      qc.invalidateQueries({ queryKey: ["admin-pending-payments"] });
      setRejectTarget(null);
      setRejectReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setWithdrawalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === "COMPLETED" || status === "REJECTED") patch.processed_at = new Date().toISOString();
      const { error } = await supabase.from("withdrawals").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(`Withdrawal ${v.status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      setRejectTarget(null);
      setRejectReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

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
                                onClick={() => markPaymentStatus.mutate({ id: p.id, status: "SUCCESS" })}
                              >
                                Mark Success
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markPaymentStatus.mutate({ id: p.id, status: "FAILED" })}
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
                                onClick={() => setPendingStatus.mutate({ id: p.id, status: "approved" })}
                              >
                                <Check className="h-4 w-4" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setPendingStatus.mutate({ id: p.id, status: "rejected" })}
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
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="font-mono text-xs">{w.salon_id.slice(0, 8)}…</TableCell>
                          <TableCell className="font-semibold">{fmtINR(Number(w.amount))}</TableCell>
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
                                onClick={() => setWithdrawalStatus.mutate({ id: w.id, status: "PROCESSING" })}
                              >
                                Approve
                              </Button>
                            )}
                            {(w.status === "PENDING" || w.status === "PROCESSING") && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => setWithdrawalStatus.mutate({ id: w.id, status: "COMPLETED" })}
                                >
                                  Mark Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setWithdrawalStatus.mutate({ id: w.id, status: "REJECTED" })}
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
      <Dialog open={!!refundTarget} onOpenChange={(o) => !o && setRefundTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Refund Payment</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Transaction: </span>
              <span className="font-mono">{refundTarget?.transaction_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-semibold">{refundTarget ? fmtINR(Number(refundTarget.amount)) : ""}</span>
            </div>
            <Textarea
              placeholder="Reason for refund (optional)"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundTarget(null)}>Cancel</Button>
            <Button
              onClick={() => refundTarget && refundPayment.mutate({ id: refundTarget.id, reason: refundReason })}
              disabled={refundPayment.isPending}
            >
              {refundPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
