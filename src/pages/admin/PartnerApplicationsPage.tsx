import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Phone, MapPin, UserCheck } from "lucide-react";

const STATUSES = ["new", "contacted", "approved", "rejected", "closed"] as const;
type Status = (typeof STATUSES)[number];

type PartnerLead = {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  message: string | null;
  status: string;
  from_user_id: string | null;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-zinc-200 text-zinc-700",
};

export function PartnerApplicationsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<Status | "all">("all");
  const [city, setCity] = useState<string>("all");
  const [q, setQ] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "partner-applications"],
    queryFn: async (): Promise<PartnerLead[]> => {
      const { data, error } = await supabase
        .from("portal_leads")
        .select("id,name,phone,city,message,status,from_user_id,created_at")
        .eq("target_type", "partner")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PartnerLead[];
    },
  });

  const cities = useMemo(() => {
    const set = new Set<string>();
    data.forEach((l) => {
      if (l.city) set.add(l.city.trim());
    });
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (city !== "all" && (l.city ?? "").trim() !== city) return false;
      if (query) {
        const hay = `${l.name ?? ""} ${l.phone ?? ""} ${l.message ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [data, status, city, q]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: Status }) => {
      const { error } = await supabase
        .from("portal_leads")
        .update({ status: next })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "partner-applications"] });
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
            Sabhi partner program applications ek jagah. Filter, review aur status update karein.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className={s !== "all" ? STATUS_TONE[s] : ""}
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
              placeholder="Search name, phone, role..."
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
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => (
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
          <CardTitle className="text-base">
            Applications ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Koi application nahi mili. Filter change karein.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name ?? "—"}</TableCell>
                      <TableCell>
                        {l.phone ? (
                          <a
                            href={`tel:${l.phone}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {l.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {l.city ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                        {l.message?.replace(/^Role:\s*/i, "") ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={l.status}
                          onValueChange={(next) =>
                            updateStatus.mutate({ id: l.id, next: next as Status })
                          }
                        >
                          <SelectTrigger
                            className={`h-8 w-[140px] text-xs ${STATUS_TONE[l.status] ?? ""}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
