import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Mail, Phone, Building2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { listPendingOwnerApprovals, setOwnerApproval } from "@/lib/owner.functions";
import { format } from "date-fns";

export function PendingOwnersPanel() {
  const fetchPending = useServerFn(listPendingOwnerApprovals);
  const decide = useServerFn(setOwnerApproval);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "pending-owners"],
    queryFn: () => fetchPending(),
    refetchInterval: 60_000,
  });

  const mut = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      decide({ data: { salon_owner_id: id, approve } }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "pending-owners"] });
      toast.success(vars.approve ? "Owner approved" : "Application rejected");
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Action failed"),
  });

  if (error) {
    return (
      <Card><CardContent className="flex items-center gap-2 py-4 text-sm text-destructive">
        <ShieldAlert className="h-4 w-4" /> Could not load pending approvals (admin only).
      </CardContent></Card>
    );
  }
  if (isLoading) {
    return (
      <Card><CardContent className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading pending owner approvals…
      </CardContent></Card>
    );
  }
  const items = data ?? [];
  if (items.length === 0) {
    return (
      <Card><CardContent className="py-4 text-sm text-muted-foreground">
        No salon owners awaiting approval. New registrations will appear here.
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-warning/10 text-warning border-0">
              {items.length} pending
            </Badge>
            <span className="text-sm font-medium">Salon owner approvals (live)</span>
          </div>
        </div>
        <ul className="divide-y">
          {items.map((row) => {
            const r = row as {
              id: string; created_at: string;
              salon: { id: string; name: string; slug: string; city: string | null; phone: string | null } | null;
              user: { id: string; full_name: string | null; email: string | null; mobile: string | null } | null;
            };
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{r.salon?.name ?? "(unnamed salon)"}</span>
                    {r.salon?.city && <span className="text-xs text-muted-foreground">· {r.salon.city}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{r.user?.full_name ?? "Unknown owner"}</span>
                    {r.user?.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.user.email}</span>}
                    {(r.salon?.phone || r.user?.mobile) && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />{r.salon?.phone ?? r.user?.mobile}
                      </span>
                    )}
                    <span>Requested {format(new Date(r.created_at), "MMM d, h:mm a")}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => mut.mutate({ id: r.id, approve: false })}
                    disabled={mut.isPending}
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => mut.mutate({ id: r.id, approve: true })}
                    disabled={mut.isPending}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
