import { useEffect, useState } from "react";
import { Loader2, ShieldX, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAllUsersForAdmin, setUserSuspension } from "@/lib/security.functions";
import { toast } from "sonner";

type Row = Awaited<ReturnType<typeof listAllUsersForAdmin>>[number];

export function LiveUsersPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAllUsersForAdmin();
      setRows(data);
    } catch (e) {
      toast.error("Couldn't load users (admin only)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSuspension = async (row: Row) => {
    setBusyId(row.id);
    try {
      await setUserSuspension({
        data: { user_id: row.id, suspend: row.is_active },
      });
      toast.success(row.is_active ? "User suspended" : "User reactivated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-border flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-heading text-base font-bold">Live users</h2>
            <p className="text-muted-foreground text-xs">
              Real accounts from your database. Suspend to block sign-in.
            </p>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-6 text-center text-sm">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {(u.full_name ?? u.email ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.full_name ?? "—"}</div>
                      <div className="text-muted-foreground text-xs">
                        {u.email ?? u.mobile ?? "—"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? "default" : "destructive"} className="capitalize">
                    {u.is_active ? "Active" : "Suspended"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(u.created_at).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={u.is_active ? "destructive" : "outline"}
                    onClick={() => toggleSuspension(u)}
                    disabled={busyId === u.id}
                  >
                    {busyId === u.id ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : u.is_active ? (
                      <ShieldX className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {u.is_active ? "Suspend" : "Reactivate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
