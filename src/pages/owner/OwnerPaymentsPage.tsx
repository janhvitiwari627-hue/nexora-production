import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Banknote, Clock, Download, QrCode, TrendingUp, Upload, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { PAYOUT_SUMMARY, TRANSACTIONS, SETTLEMENTS } from "./payments/mockPayments";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { ownerDashboardMetricsQuery } from "@/lib/owner.queries";

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const TXN_CLR: Record<string, string> = {
  settled: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

const PLATFORM_FEE = 0.1;

export function OwnerPaymentsPage() {
  const { activeSalonId } = useOwnerContext();
  const { data: metrics } = useQuery({
    ...ownerDashboardMetricsQuery(activeSalonId ?? ""),
    enabled: !!activeSalonId,
  });

  const live = metrics
    ? {
        pending: Math.round(metrics.today.revenue * (1 - PLATFORM_FEE)),
        thisMonth: Math.round(metrics.month.revenue),
        settled: Math.round(metrics.month.revenue * (1 - PLATFORM_FEE)),
      }
    : null;
  const summary = live ?? {
    pending: PAYOUT_SUMMARY.pending,
    thisMonth: PAYOUT_SUMMARY.thisMonth,
    settled: PAYOUT_SUMMARY.thisMonth - PAYOUT_SUMMARY.pending,
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Payouts</h1>
          <p className="text-sm text-muted-foreground">
            Track settlements, manage QR collection and update your bank account.
          </p>
        </div>
        <Badge variant={live ? "default" : "outline"}>
          {live ? "Live data" : "Demo data"}
        </Badge>
      </div>

      {/* Payout summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-pink-500/10 border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" /> Pending settlement
            </div>
            <div className="text-3xl font-bold mt-2">{formatINR(summary.pending)}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {live ? "Today's net (after 10% fee)" : `Next settlement ${PAYOUT_SUMMARY.nextSettlement}`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Earned this month
            </div>
            <div className="text-3xl font-bold mt-2">{formatINR(summary.thisMonth)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {live ? `${metrics?.month.count ?? 0} completed bookings (30d)` : `+${(((PAYOUT_SUMMARY.thisMonth - PAYOUT_SUMMARY.lastMonth) / PAYOUT_SUMMARY.lastMonth) * 100).toFixed(1)}% vs last month`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Banknote className="h-4 w-4" /> Total settled this month
            </div>
            <div className="text-3xl font-bold mt-2">{formatINR(summary.settled)}</div>
            <div className="text-xs text-muted-foreground mt-1">After 10% platform fee</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
          <TabsTrigger value="bank">Bank Account</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Transaction History</CardTitle>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee (10%)</TableHead>
                    <TableHead className="text-right">Net Payout</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRANSACTIONS.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.bookingId}</TableCell>
                      <TableCell>{t.customer}</TableCell>
                      <TableCell className="text-muted-foreground">{t.service}</TableCell>
                      <TableCell className="text-right">{formatINR(t.amount)}</TableCell>
                      <TableCell className="text-right text-destructive">-{formatINR(t.fee)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatINR(t.net)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                      <TableCell><Badge className={TXN_CLR[t.status]}>{t.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardHeader><CardTitle className="text-base">Settlement History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Fees</TableHead>
                    <TableHead className="text-right">Net Settled</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SETTLEMENTS.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.date}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                      <TableCell className="text-right">{formatINR(s.gross)}</TableCell>
                      <TableCell className="text-right text-destructive">-{formatINR(s.fees)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatINR(s.net)}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr"><QRManagement /></TabsContent>
        <TabsContent value="bank"><BankAccountForm /></TabsContent>
      </Tabs>
    </div>
  );
}

function QRManagement() {
  const [qr, setQr] = useState<string | null>(null);
  const [upi, setUpi] = useState("luxehairspa@okhdfcbank");

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">QR Code Management</CardTitle></CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center border rounded-lg p-6 bg-muted/30">
          {qr ? (
            <img src={qr} alt="Payment QR" className="h-56 w-56 object-contain" />
          ) : (
            <div className="h-56 w-56 flex items-center justify-center border-2 border-dashed rounded-md">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-3">Current payment QR</div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>UPI ID</Label>
            <Input value={upi} onChange={(e) => setUpi(e.target.value)} className="mt-1 font-mono" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setQr(URL.createObjectURL(f)); toast.success("QR uploaded"); }
                }}
              />
              <Button asChild className="w-full" variant="outline">
                <span><Upload className="h-4 w-4" /> Upload new QR</span>
              </Button>
            </label>
            <Button variant="outline" onClick={() => toast.success("QR downloaded")}>
              <Download className="h-4 w-4" /> Download QR
            </Button>
          </div>
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            Display this QR at your reception for instant in-store payments. Funds are credited
            directly to your linked bank account.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BankAccountForm() {
  const [form, setForm] = useState({
    holder: "Luxe Hair & Spa Pvt Ltd",
    bank: "HDFC Bank",
    account: "50100123456789",
    ifsc: "HDFC0001234",
  });
  const upd = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Bank Account Settings</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <div className="md:col-span-2">
          <Label>Account Holder Name</Label>
          <Input value={form.holder} onChange={(e) => upd("holder", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Bank Name</Label>
          <Input value={form.bank} onChange={(e) => upd("bank", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>IFSC Code</Label>
          <Input value={form.ifsc} onChange={(e) => upd("ifsc", e.target.value.toUpperCase())} className="mt-1 font-mono uppercase" />
        </div>
        <div className="md:col-span-2">
          <Label>Account Number</Label>
          <Input value={form.account} onChange={(e) => upd("account", e.target.value)} className="mt-1 font-mono" />
        </div>
        <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3 bg-emerald-50 dark:bg-emerald-950/30">
          <div className="text-sm">
            <span className="font-medium text-emerald-700 dark:text-emerald-300">Verified</span>
            <span className="text-muted-foreground"> — Penny drop confirmed on Jun 1, 2026</span>
          </div>
          <Button onClick={() => toast.success("Bank details saved")}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
