import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Trophy, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getRankingLeaderboard, triggerRankingRecompute } from "@/lib/rankings.functions";

export function RankingsManagementPage() {
  const queryClient = useQueryClient();
  const fetchLeaderboard = useServerFn(getRankingLeaderboard);
  const runRecompute = useServerFn(triggerRankingRecompute);
  const [filter, setFilter] = useState("");

  const { data: salons, isLoading, error } = useQuery({
    queryKey: ["admin", "rankings"],
    queryFn: () => fetchLeaderboard(),
  });

  const mutation = useMutation({
    mutationFn: () => runRecompute(),
    onSuccess: (res) => {
      toast.success(`Ranking recomputed — ${res.updated} salon(s) updated`);
      queryClient.invalidateQueries({ queryKey: ["admin", "rankings"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const list = (salons ?? []).filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.location ?? "").toLowerCase().includes(q) ||
      (s.category ?? "").toLowerCase().includes(q)
    );
  });

  // Group by city for rank context
  const byCity = new Map<string, typeof list>();
  for (const s of list) {
    const city = s.location ?? "—";
    const arr = byCity.get(city) ?? [];
    arr.push(s);
    byCity.set(city, arr);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading text-2xl font-bold">Rankings Management</h1>
          <p className="text-muted-foreground text-sm">
            Nexora Score combines rating, monthly bookings, repeat-customer ratio, and recency.
            Recomputed nightly; you can force a refresh below.
          </p>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Recompute now
        </Button>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Leaderboard {salons ? <Badge variant="outline">{salons.length} salons</Badge> : null}
          </CardTitle>
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name, city, category"
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-rose-600">Failed to load: {(error as Error).message}</div>
          ) : isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No salons match.</p>
          ) : (
            <div className="space-y-6">
              {[...byCity.entries()].map(([city, rows]) => (
                <div key={city} className="space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {city}
                  </h3>
                  {rows.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 hover:bg-muted/60"
                    >
                      <span className="grid h-8 w-10 place-items-center rounded-md bg-background text-sm font-bold text-heading">
                        #{s.rank_in_city ?? "—"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-heading">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.category ?? "Salon"} · ★ {s.rating?.toFixed(1) ?? "—"} ({s.reviews_count ?? 0})
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        Score {s.nexora_score ?? 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
