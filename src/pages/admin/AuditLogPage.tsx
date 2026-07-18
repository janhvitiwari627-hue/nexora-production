import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const ENTITY_FILTERS = [
  "all",
  "payment",
  "pending_payment",
  "withdrawal",
  "business",
  "review",
  "user",
] as const;

const PAGE_SIZE = 50;

function fmt(s: string) {
  return new Date(s).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AuditLogPage() {
  const [entity, setEntity] = useState<(typeof ENTITY_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const q = useInfiniteQuery({
    queryKey: ["admin-audit-logs", entity],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (entity !== "all") query = query.eq("entity_type", entity);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
  });

  const rows = useMemo(() => q.data?.pages.flat() ?? [], [q.data]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.action.toLowerCase().includes(s) ||
        (r.entity_id ?? "").toLowerCase().includes(s) ||
        (r.actor_id ?? "").toLowerCase().includes(s) ||
        JSON.stringify(r.metadata ?? {})
          .toLowerCase()
          .includes(s),
    );
  }, [rows, search]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          q.hasNextPage &&
          !q.isFetchingNextPage
        ) {
          void q.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Admin Audit Log</h1>
        <p className="text-muted-foreground text-sm">
          Every approve, reject, refund and adjust action — with the required reason
          and operator identity.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, entity id, actor id, reason…"
            className="pl-9"
          />
        </div>
        <Select value={entity} onValueChange={(v) => setEntity(v as typeof entity)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_FILTERS.map((e) => (
              <SelectItem key={e} value={e}>
                {e === "all" ? "All entities" : e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {q.isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : q.error ? (
            <div className="text-destructive p-10 text-center text-sm">
              {(q.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-muted-foreground p-10 text-center text-sm">
              No audit entries
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Reason / Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const meta = (r.metadata ?? {}) as Record<string, unknown>;
                    const reason =
                      typeof meta.reason === "string" ? meta.reason : null;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {fmt(r.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.action}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{r.entity_type}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.entity_id ? r.entity_id.slice(0, 8) + "…" : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.actor_id ? r.actor_id.slice(0, 8) + "…" : "system"}
                        </TableCell>
                        <TableCell className="max-w-[420px] text-xs">
                          {reason ? (
                            <div className="whitespace-pre-wrap">{reason}</div>
                          ) : (
                            <code className="text-muted-foreground text-[11px]">
                              {JSON.stringify(meta)}
                            </code>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div
                ref={sentinelRef}
                className="text-muted-foreground flex items-center justify-center p-4 text-xs"
              >
                {q.isFetchingNextPage ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
                  </span>
                ) : q.hasNextPage ? (
                  "Scroll to load more"
                ) : (
                  `End of log — ${rows.length} entries`
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
