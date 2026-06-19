import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Eye, Search } from "lucide-react";
import { toast } from "sonner";

type Role = "customer" | "owner" | "staff" | "admin";
type Status = "active" | "suspended" | "deleted";
type User = {
  id: string; name: string; email: string; mobile: string; role: Role; status: Status;
  joinedAt: string; lastActive: string; bookings: number; spend: number; flagged: boolean; notes: string;
};

const USERS: User[] = Array.from({ length: 22 }).map((_, i) => ({
  id: `u${i + 1}`,
  name: ["Aarav Mehta", "Priya Sharma", "Rohan Iyer", "Sneha Rao", "Vikram Singh", "Deepa Nair"][i % 6] + ` ${i + 1}`,
  email: `user${i + 1}@mail.com`,
  mobile: `+91 9${String(800000000 + i * 13579).slice(0, 9)}`,
  role: (["customer", "owner", "staff", "admin"] as Role[])[i % 4],
  status: (["active", "active", "active", "suspended", "deleted"] as Status[])[i % 5],
  joinedAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  lastActive: `${(i % 14) + 1}d ago`,
  bookings: 3 + (i * 7) % 50,
  spend: 1200 + (i * 421) % 18000,
  flagged: i % 7 === 0,
  notes: "",
}));

export function UserManagementPage() {
  const [users, setUsers] = useState(USERS);
  const [role, setRole] = useState<"all" | Role>("all");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<User | null>(null);

  const filtered = useMemo(() => users.filter(u =>
    (role === "all" || u.role === role) &&
    (status === "all" || u.status === status) &&
    (!q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q) || u.mobile.includes(q))
  ), [users, role, status, q]);

  const updateNotes = (id: string, notes: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, notes } : u));
    if (detail?.id === id) setDetail({ ...detail, notes });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm">Manage all platform users across roles</p>
      </header>
      <Card><CardContent className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          <Input className="pl-9" placeholder="Search name, email, mobile…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Select value={role} onValueChange={v => setRole(v as "all" | Role)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={v => setStatus(v as "all" | Status)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead>
            <TableHead>Bookings</TableHead><TableHead>Spend</TableHead><TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id} className={u.flagged ? "border-l-4 border-l-destructive" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback>{u.name.slice(0, 2)}</AvatarFallback></Avatar>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium">
                        {u.name}
                        {u.flagged && <AlertTriangle className="text-destructive h-3.5 w-3.5" />}
                      </div>
                      <div className="text-muted-foreground text-xs">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
                <TableCell><Badge variant={u.status === "active" ? "default" : "secondary"} className="capitalize">{u.status}</Badge></TableCell>
                <TableCell>{u.bookings}</TableCell>
                <TableCell>₹{u.spend.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.joinedAt}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => setDetail(u)}><Eye className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Sheet open={!!detail} onOpenChange={o => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (
            <>
              <SheetHeader><SheetTitle className="flex items-center gap-2">
                {detail.name}
                {detail.flagged && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Flagged</Badge>}
              </SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="text-muted-foreground text-xs">Email</div>{detail.email}</div>
                  <div><div className="text-muted-foreground text-xs">Mobile</div>{detail.mobile}</div>
                  <div><div className="text-muted-foreground text-xs">Role</div><span className="capitalize">{detail.role}</span></div>
                  <div><div className="text-muted-foreground text-xs">Status</div><span className="capitalize">{detail.status}</span></div>
                  <div><div className="text-muted-foreground text-xs">Joined</div>{detail.joinedAt}</div>
                  <div><div className="text-muted-foreground text-xs">Last Active</div>{detail.lastActive}</div>
                </div>
                <Tabs defaultValue="bookings">
                  <TabsList className="w-full">
                    <TabsTrigger value="bookings" className="flex-1">Bookings</TabsTrigger>
                    <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                  </TabsList>
                  <TabsContent value="bookings" className="text-muted-foreground">{detail.bookings} bookings · ₹{detail.spend.toLocaleString("en-IN")} lifetime spend</TabsContent>
                  <TabsContent value="payments" className="text-muted-foreground">Last payment 3 days ago via UPI</TabsContent>
                  <TabsContent value="reviews" className="text-muted-foreground">12 reviews · avg 4.6★</TabsContent>
                  <TabsContent value="activity" className="text-muted-foreground">Login from Mumbai · last active {detail.lastActive}</TabsContent>
                </Tabs>
                <div>
                  <label className="text-muted-foreground text-xs">Admin Notes</label>
                  <Textarea value={detail.notes} onChange={e => updateNotes(detail.id, e.target.value)} placeholder="Internal note for this user…" rows={4} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setUsers(p => p.map(x => x.id === detail.id ? { ...x, flagged: !x.flagged } : x)); toast.success("Flag toggled"); }}>Toggle Fraud Flag</Button>
                  <Button variant="destructive" className="flex-1" onClick={() => { setUsers(p => p.map(x => x.id === detail.id ? { ...x, status: "suspended" } : x)); toast.success("User suspended"); setDetail(null); }}>Suspend</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
