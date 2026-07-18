import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Phone, MapPin, UserCheck, Mail, Loader2 } from "lucide-react";
import { KycDocumentPreview } from "@/components/admin/KycDocumentPreview";

function extractKycPath(app: { metadata: Record<string, unknown> | null }): string | null {
  const m = app.metadata;
  if (!m || typeof m !== "object") return null;
  const candidates = ["kyc_path", "kycPath", "kyc_document_path", "kyc"];
  for (const key of candidates) {
    const v = (m as Record<string, unknown>)[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

const STATUSES = ["pending", "verified", "rejected", "suspended"] as const;
type Status = (typeof STATUSES)[number];

type PartnerApp = {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string | null;
  email: string | null;
  district: string;
  state: string | null;
  pincode: string | null;
  tagline: string | null;
  success_story: string | null;
  status: Status;
  rejection_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const STATUS_TONE: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-slate-200 text-slate-700",
};

export function PartnerApplicationsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<Status | "all">("all");
  const [district, setDistrict] = useState<string>("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<PartnerApp | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState<PartnerApp | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "partner-applications-dbp"],
    queryFn: async (): Promise<PartnerApp[]> => {
      const { data, error } = await supabase
        .from("district_business_partners")
        .select(
          "id,user_id,full_name,mobile,email,district,state,pincode,tagline,success_story,status,rejection_reason,metadata,created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PartnerApp[];
    },
  });

  const districts = useMemo(() => {
    const set = new Set<string>();
    data.forEach((l) => l.district && set.add(l.district.trim()));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (district !== "all" && (l.district ?? "").trim() !== district) return false;
      if (query) {
        const hay = `${l.full_name} ${l.mobile ?? ""} ${l.email ?? ""} ${l.tagline ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [data, status, district, q]);

  const review = useMutation({
    mutationFn: async ({
      id,
      approve,
      reason,
    }: {
      id: string;
      approve: boolean;
      reason?: string;
    }) => {
      const { error } = await supabase.rpc("review_partner_application", {
        _partner_id: id,
        _approve: approve,
        _reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "partner-applications-dbp"] });
      toast.success(vars.approve ? "Partner approved & role granted" : "Application rejected");
      setRejectOpen(null);
      setRejectReason("");
      setDetail(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const suspend = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: Status }) => {
      const { error } = await supabase
        .from("district_business_partners")
        .update({ status: next })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partner-applications-dbp"] });
      toast.success("Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: data.length };
    STATUSES.forEach((s) => (map[s] = 0));
    data.forEach((l) => {
      map[l.status] = (map[l.status] ?? 0) + 1;
    });
    return map;
  }, [data]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Growth Partner Applications
          </h1>
          <p className="text-sm text-muted-foreground">
            Review, approve, or reject applications. Approving a partner automatically grants them
            the Growth Partner role and access to the partner app.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className={s !== "all" ? STATUS_TONE[s as Status] : ""}
            >
              {s} · {counts[s] ?? 0}
            </Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, email…"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as Status | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger>
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districts.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Applications ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No applications found. Try changing the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const role =
                      typeof l.metadata?.role === "string" ? (l.metadata.role as string) : "—";
                    return (
                      <TableRow key={l.id}>
                        <TableCell>
                          <button
                            className="font-medium text-left hover:underline"
                            onClick={() => setDetail(l)}
                          >
                            {l.full_name}
                          </button>
                          {l.tagline && (
                            <div className="text-xs text-muted-foreground max-w-[220px] truncate">
                              {l.tagline}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {l.mobile && (
                            <a
                              href={`tel:${l.mobile}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {l.mobile}
                            </a>
                          )}
                          {l.email && (
                            <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" /> {l.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {l.district}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                          {role}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(l.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_TONE[l.status]}>{l.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {l.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  review.mutate({ id: l.id, approve: true })
                                }
                                disabled={review.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRejectOpen(l)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {l.status === "verified" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                suspend.mutate({ id: l.id, next: "suspended" })
                              }
                              disabled={suspend.isPending}
                            >
                              Suspend
                            </Button>
                          )}
                          {l.status === "suspended" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                suspend.mutate({ id: l.id, next: "verified" })
                              }
                              disabled={suspend.isPending}
                            >
                              Reactivate
                            </Button>
                          )}
                          {l.status === "rejected" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDetail(l)}
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.full_name}</DialogTitle>
            <DialogDescription>
              {detail?.district}
              {detail?.state ? `, ${detail.state}` : ""}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Mobile</div>
                  <div>{detail.mobile ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div>{detail.email ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Pincode</div>
                  <div>{detail.pincode ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Role</div>
                  <div>
                    {typeof detail.metadata?.role === "string"
                      ? (detail.metadata.role as string)
                      : "—"}
                  </div>
                </div>
              </div>
              {detail.tagline && (
                <div>
                  <div className="text-xs text-muted-foreground">Tagline</div>
                  <div>{detail.tagline}</div>
                </div>
              )}
              {detail.success_story && (
                <div>
                  <div className="text-xs text-muted-foreground">Why they want to join</div>
                  <div className="whitespace-pre-wrap">{detail.success_story}</div>
                </div>
              )}
              {detail.rejection_reason && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <div className="text-xs font-semibold text-red-700">Rejection reason</div>
                  <div className="text-red-900">{detail.rejection_reason}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectOpen} onOpenChange={(o) => !o && setRejectOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              Optional reason — will be visible to {rejectOpen?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Coverage already full in your district."
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={review.isPending}
              onClick={() =>
                rejectOpen &&
                review.mutate({
                  id: rejectOpen.id,
                  approve: false,
                  reason: rejectReason.trim() || undefined,
                })
              }
            >
              {review.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting…
                </>
              ) : (
                "Confirm reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
