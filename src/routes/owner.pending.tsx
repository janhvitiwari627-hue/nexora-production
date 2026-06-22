import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyOwnerApprovalStatus } from "@/lib/owner.functions";

export const Route = createFileRoute("/owner/pending")({
  head: () => ({ meta: [{ title: "Pending approval — Nexora" }] }),
  component: OwnerPendingPage,
});

function OwnerPendingPage() {
  const navigate = useNavigate();
  const fetchStatus = useServerFn(getMyOwnerApprovalStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["owner", "approval-status"],
    queryFn: () => fetchStatus(),
    refetchInterval: 30_000, // poll while waiting
  });

  // If approved, send to dashboard
  useEffect(() => {
    if (data?.hasApprovedLink) navigate({ to: "/owner/dashboard" });
  }, [data?.hasApprovedLink, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-7 w-7 text-warning" />
          </div>
          <CardTitle>Your salon is awaiting approval</CardTitle>
          <CardDescription>
            We've received your registration. Our team typically reviews new salons within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.pending?.length ? (
            <div className="space-y-2">
              {data.pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{p.salon?.name ?? "(no name)"}</span>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" /> Pending
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No salon registered yet.{" "}
              <Link to="/owner/onboarding" className="text-primary underline-offset-4 hover:underline">
                Register your business
              </Link>
              .
            </div>
          )}

          <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              While you wait, please verify your email if you haven't already. We'll notify you the moment your account
              is approved.
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleSignOut}>
              Sign out
            </Button>
            <Button asChild className="flex-1">
              <Link to="/">
                Back to site <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
