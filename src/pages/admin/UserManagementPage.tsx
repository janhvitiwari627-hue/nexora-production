import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { LiveUsersPanel } from "@/components/admin/LiveUsersPanel";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  city: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  created_at: string;
  roles: string[];
};

const ROLE_FILTERS = [
  "all",
  "customer",
  "owner",
  "shop_owner",
  "admin",
  "super_admin",
  "growth_partner",
  "district_partner",
  "brand",
  "distributor",
] as const;

export function UserManagementPage() {
  const qc = useQueryClient();
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);

  const usersQ = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: rolesRows, error: rErr }] = await Promise.all(
        [
          supabase
            .from("profiles")
            .select("id,full_name,email,mobile,city,avatar_url,is_active,is_verified,created_at")
            .order("created_at", { ascending: false })
            .limit(500),
          supabase.from("user_roles").select("user_id,role"),
        ],
      );
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      const byUser = new Map<string, string[]>();
      for (const r of rolesRows ?? []) {
        const list = byUser.get(r.user_id) ?? [];
        list.push(r.role);
        byUser.set(r.user_id, list);
      }
      return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] })) as Row[];
    },
  });

  const suspend = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.active ? "User reactivated" : "User suspended");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setDetail(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const users = usersQ.data ?? [];

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (role !== "all" && !u.roles.includes(role)) return false;
        if (status === "active" && u.is_active === false) return false;
        if (status === "suspended" && u.is_active !== false) return false;
        if (q) {
          const s = q.toLowerCase();
          if (
            !(u.full_name ?? "").toLowerCase().includes(s) &&
            !(u.email ?? "").toLowerCase().includes(s) &&
            !(u.mobile ?? "").toLowerCase().includes(s)
          )
            return false;
        }
        return true;
      }),
    [users, role, status, q],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm">
          All platform users — real-time from database.
        </p>
      </header>

      <LiveUsersPanel />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              className="pl-9"
              placeholder="Search name, email, mobile…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTERS.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r === "all" ? "All Roles" : r.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-muted-foreground text-sm">
            {filtered.length} of {users.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {usersQ.isLoading ? (
            <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
            </div>
          ) : usersQ.error ? (
            <div className="p-8 text-sm text-rose-600">Failed to load users.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {u.avatar_url ? <AvatarImage src={u.avatar_url} /> : null}
                          <AvatarFallback>
                            {(u.full_name ?? u.email ?? "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{u.full_name ?? "(no name)"}</div>
                          <div className="text-muted-foreground text-xs">
                            {u.email ?? u.mobile ?? "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <Badge variant="outline" className="text-xs">
                            no role
                          </Badge>
                        ) : (
                          u.roles.map((r) => (
                            <Badge key={r} variant="outline" className="text-xs capitalize">
                              {r.replace("_", " ")}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{u.city ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.is_active === false ? "secondary" : "default"}
                        className="capitalize"
                      >
                        {u.is_active === false ? "suspended" : "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setDetail(u)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No users match.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.full_name ?? "(no name)"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-muted-foreground text-xs">Email</div>
                    {detail.email ?? "—"}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Mobile</div>
                    {detail.mobile ?? "—"}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">City</div>
                    {detail.city ?? "—"}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Verified</div>
                    {detail.is_verified ? "Yes" : "No"}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Joined</div>
                    {new Date(detail.created_at).toLocaleString()}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Status</div>
                    {detail.is_active === false ? "Suspended" : "Active"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Roles</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {detail.roles.length === 0 ? (
                      <Badge variant="outline">no role</Badge>
                    ) : (
                      detail.roles.map((r) => (
                        <Badge key={r} variant="outline" className="capitalize">
                          {r.replace("_", " ")}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {detail.is_active === false ? (
                    <Button
                      className="flex-1"
                      onClick={() => suspend.mutate({ id: detail.id, active: true })}
                      disabled={suspend.isPending}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => suspend.mutate({ id: detail.id, active: false })}
                      disabled={suspend.isPending}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
