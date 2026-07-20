import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, Clock, CheckCircle2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyReferrals, type ReferralAttribution } from "@/lib/referrals.functions";
import { useAuthStore } from "@/stores/authStore";

const STATUS_STYLES: Record<
  ReferralAttribution["status"],
  { label: string; classes: string; Icon: typeof Clock }
> = {
  joined: {
    label: "Joined",
    classes: "bg-sky-100 text-sky-700",
    Icon: UserPlus,
  },
  rewarded: {
    label: "Rewarded",
    classes: "bg-emerald-100 text-emerald-700",
    Icon: CheckCircle2,
  },
};

export function MyReferralsSection() {
  const user = useAuthStore((s) => s.user);
  const fetchReferrals = useServerFn(getMyReferrals);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-referrals", user?.id ?? "anon"],
    queryFn: () => fetchReferrals(),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const rows = data ?? [];
  const total = rows.length;
  const rewarded = rows.filter((r) => r.status === "rewarded").length;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            My referrals
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Live attribution — {total} joined via your link · {rewarded} rewarded
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-primary text-xs font-semibold hover:underline disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {!user ? (
        <div className="text-muted-foreground p-8 text-center text-sm">
          Sign in to view your referrals.
        </div>
      ) : isLoading ? (
        <div className="text-muted-foreground p-8 text-center text-sm">Loading referrals…</div>
      ) : isError ? (
        <div className="text-destructive p-8 text-center text-sm">
          Couldn't load referrals. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <UserPlus className="text-muted-foreground h-8 w-8" />
          <p className="text-sm font-semibold">No referrals yet</p>
          <p className="text-muted-foreground max-w-xs text-xs">
            Share your referral code — signups will appear here with live status.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-[11px] font-bold uppercase tracking-wide">
              <tr>
                <th className="px-5 py-2.5 text-left">Friend</th>
                <th className="px-5 py-2.5 text-left">Signed up</th>
                <th className="px-5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = STATUS_STYLES[r.status];
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-5 py-3 font-semibold">{r.name}</td>
                    <td className="text-muted-foreground px-5 py-3">
                      {new Date(r.signedUpAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                          s.classes,
                        )}
                      >
                        <s.Icon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
