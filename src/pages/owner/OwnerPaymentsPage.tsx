import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Banknote, Clock, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { requestOwnerWithdrawal } from "@/lib/owner.functions";
import { ownerWalletQuery, ownerWithdrawalsQuery } from "@/lib/owner.queries";

const formatINR = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function OwnerPaymentsPage() {
  const { activeSalonId, isLoading: ownerLoading } = useOwnerContext();
  const qc = useQueryClient();
  const requestWithdrawal = useServerFn(requestOwnerWithdrawal);
  const walletQuery = useQuery(ownerWalletQuery(activeSalonId ?? ""));
  const withdrawalsQuery = useQuery(ownerWithdrawalsQuery(activeSalonId ?? ""));
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState({ holder: "", bank: "", account: "", ifsc: "" });

  const withdrawal = useMutation({
    mutationFn: () => {
      if (!activeSalonId) throw new Error("No salon connected");
      return requestWithdrawal({
        data: {
          salon_id: activeSalonId,
          amount: Number(amount),
          bank_account_details: bank,
        },
      });
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted");
      setAmount("");
      qc.invalidateQueries({ queryKey: ["owner", "wallet", activeSalonId] });
      qc.invalidateQueries({ queryKey: ["owner", "withdrawals", activeSalonId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (ownerLoading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!activeSalonId)
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">No salon connected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete setup to activate your owner wallet.
        </p>
        <Button className="mt-4" asChild>
          <a href="/owner/onboarding">Start setup</a>
        </Button>
      </div>
    );

  const wallet = walletQuery.data?.wallet;
  const transactions = walletQuery.data?.transactions ?? [];
  const withdrawals = withdrawalsQuery.data ?? [];
  const loading = walletQuery.isLoading || withdrawalsQuery.isLoading;
  const error = walletQuery.error || withdrawalsQuery.error;
  const commission = Number(wallet?.commission_rate ?? 0.1);
  const commissionPercent = commission <= 1 ? commission * 100 : commission;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6">
      <header className="min-w-0">
        <h1 className="text-2xl font-bold">Wallet & Payouts</h1>
        <p className="text-sm text-muted-foreground">
          10% platform commission is deducted from completed bookings.
        </p>
      </header>
      {loading ? (
        <Card className="grid min-h-40 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </Card>
      ) : error ? (
        <Card className="p-8 text-center text-destructive">{error.message}</Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Summary
              icon={<Wallet className="h-4 w-4" />}
              label="Available balance"
              value={formatINR(Number(wallet?.available_balance ?? 0))}
              note="Minimum withdrawal ₹100"
            />
            <Summary
              icon={<Clock className="h-4 w-4" />}
              label="Pending balance"
              value={formatINR(Number(wallet?.pending_balance ?? 0))}
              note="Released after the settlement hold"
            />
            <Summary
              icon={<Banknote className="h-4 w-4" />}
              label="Total earnings"
              value={formatINR(Number(wallet?.total_earnings ?? 0))}
              note={`Commission rate ${commissionPercent}%`}
            />
          </div>
          <Tabs defaultValue="transactions" className="min-w-0">
            <TabsList className="w-full max-w-full justify-start overflow-x-auto">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="request">Request payout</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wallet transactions</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {new Date(item.created_at).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell>{item.reason || "Booking settlement"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatINR(Number(item.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatINR(Number(item.balance_after ?? 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                            No wallet transactions yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="withdrawals">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Withdrawal history</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table className="min-w-[420px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {new Date(item.created_at).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatINR(Number(item.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                      {withdrawals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="h-28 text-center text-muted-foreground">
                            No withdrawals yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="request">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Request withdrawal</CardTitle>
                </CardHeader>
                <CardContent className="grid max-w-2xl gap-4 md:grid-cols-2">
                  <Field label="Amount (₹)">
                    <Input
                      type="number"
                      min={100}
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </Field>
                  <Field label="Account holder">
                    <Input
                      value={bank.holder}
                      onChange={(event) => setBank({ ...bank, holder: event.target.value })}
                    />
                  </Field>
                  <Field label="Bank name">
                    <Input
                      value={bank.bank}
                      onChange={(event) => setBank({ ...bank, bank: event.target.value })}
                    />
                  </Field>
                  <Field label="IFSC">
                    <Input
                      value={bank.ifsc}
                      onChange={(event) =>
                        setBank({ ...bank, ifsc: event.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                  <Field label="Account number">
                    <Input
                      value={bank.account}
                      onChange={(event) => setBank({ ...bank, account: event.target.value })}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      disabled={
                        withdrawal.isPending ||
                        Number(amount) < 100 ||
                        Object.values(bank).some((value) => !value.trim())
                      }
                      onClick={() => withdrawal.mutate()}
                    >
                      {withdrawal.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit request"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function Summary({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="mt-2 text-3xl font-bold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{note}</div>
      </CardContent>
    </Card>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
