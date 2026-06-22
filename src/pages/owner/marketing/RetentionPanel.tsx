import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { fetchAtRiskCustomers, sendRetentionCampaign } from "@/lib/marketing.functions";

type AtRisk = {
  customer_id: string;
  full_name: string | null;
  mobile: string | null;
  last_booking_date: string | null;
  lifetime_value: number;
  churn_risk_score: number;
  preferred_services: string[] | null;
};

export function RetentionPanel({ salonId }: { salonId: string }) {
  const fetchFn = useServerFn(fetchAtRiskCustomers);
  const sendFn = useServerFn(sendRetentionCampaign);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["at-risk-customers", salonId],
    queryFn: () => fetchFn({ data: { salonId } }) as Promise<AtRisk[]>,
    enabled: !!salonId,
  });

  const mutation = useMutation({
    mutationFn: () =>
      sendFn({
        data: { salonId, customerIds: Array.from(selected) },
      }) as Promise<{ campaignId?: string; sent: number }>,
    onSuccess: (r) => {
      toast.success(`Mock WhatsApp sent to ${r.sent} customers`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ["at-risk-customers", salonId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (!data?.length) return;
    setSelected(selected.size === data.length ? new Set() : new Set(data.map((c) => c.customer_id)));
  };

  const riskBadge = (score: number) => {
    if (score >= 0.8) return <Badge variant="destructive">Critical</Badge>;
    if (score >= 0.6) return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
    return <Badge variant="secondary">Medium</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          At-Risk Customers
        </CardTitle>
        <Button
          size="sm"
          disabled={selected.size === 0 || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Send className="h-4 w-4" />
          Send Retention Offer ({selected.size})
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI-detected based on churn risk. Insights refresh nightly at 3 AM IST.
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : !data?.length ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            🎉 No at-risk customers right now.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-2 py-1 border-b text-xs text-muted-foreground">
              <Checkbox
                checked={selected.size === data.length}
                onCheckedChange={toggleAll}
              />
              Select all ({data.length})
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.map((c) => (
                <div
                  key={c.customer_id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selected.has(c.customer_id)}
                    onCheckedChange={() => toggle(c.customer_id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{c.full_name || "Customer"}</span>
                      {riskBadge(Number(c.churn_risk_score))}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      LTV ₹{Number(c.lifetime_value).toLocaleString()} ·{" "}
                      Last visit {c.last_booking_date || "—"}
                      {c.preferred_services?.[0] && ` · Likes ${c.preferred_services[0]}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
