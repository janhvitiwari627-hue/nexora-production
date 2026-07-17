import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "./filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <SelectTrigger
        aria-label="Sort salons"
        className="h-10 w-[164px] rounded-full border-border bg-card text-xs font-semibold text-heading sm:w-[200px] sm:text-sm"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Sort:</span>
          <SelectValue />
        </span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.key} value={o.key}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
