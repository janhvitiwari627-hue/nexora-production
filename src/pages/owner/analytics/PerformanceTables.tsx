import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staffPerformance, servicePerformance } from "./mockAnalytics";

type SortDir = "asc" | "desc";

function useSort<T>(rows: T[], defaultKey: keyof T) {
  const [key, setKey] = useState<keyof T>(defaultKey);
  const [dir, setDir] = useState<SortDir>("desc");
  const sorted = [...rows].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av === bv) return 0;
    const cmp = av > bv ? 1 : -1;
    return dir === "asc" ? cmp : -cmp;
  });
  const toggle = (k: keyof T) => {
    if (k === key) setDir(dir === "asc" ? "desc" : "asc");
    else { setKey(k); setDir("desc"); }
  };
  return { sorted, key, dir, toggle };
}

function SortBtn({ active, dir, onClick, children }: { active: boolean; dir: SortDir; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="h-7 px-2 -ml-2">
      {children}
      {active && (dir === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
    </Button>
  );
}

export function StaffPerformanceTable() {
  const { sorted, key, dir, toggle } = useSort(staffPerformance, "revenue");
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortBtn active={key === "name"} dir={dir} onClick={() => toggle("name")}>Staff</SortBtn></TableHead>
          <TableHead><SortBtn active={key === "bookings"} dir={dir} onClick={() => toggle("bookings")}>Bookings</SortBtn></TableHead>
          <TableHead><SortBtn active={key === "revenue"} dir={dir} onClick={() => toggle("revenue")}>Revenue</SortBtn></TableHead>
          <TableHead><SortBtn active={key === "rating"} dir={dir} onClick={() => toggle("rating")}>Rating</SortBtn></TableHead>
          <TableHead>Top Service</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={s.name}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell>{s.bookings}</TableCell>
            <TableCell>₹{s.revenue.toLocaleString()}</TableCell>
            <TableCell className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{s.rating}</TableCell>
            <TableCell className="text-muted-foreground">{s.top}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ServicePerformanceTable() {
  const { sorted, key, dir, toggle } = useSort(servicePerformance, "revenue");
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortBtn active={key === "name"} dir={dir} onClick={() => toggle("name")}>Service</SortBtn></TableHead>
          <TableHead><SortBtn active={key === "bookings"} dir={dir} onClick={() => toggle("bookings")}>Bookings</SortBtn></TableHead>
          <TableHead><SortBtn active={key === "revenue"} dir={dir} onClick={() => toggle("revenue")}>Revenue</SortBtn></TableHead>
          <TableHead><SortBtn active={key === "rating"} dir={dir} onClick={() => toggle("rating")}>Rating</SortBtn></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={s.name}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell>{s.bookings}</TableCell>
            <TableCell>₹{s.revenue.toLocaleString()}</TableCell>
            <TableCell className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{s.rating}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
