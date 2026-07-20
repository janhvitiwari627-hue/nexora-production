import { Eye, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StaffMember } from "./mockStaff";

export function StaffManagementCard({
  staff,
  onView,
  onEdit,
  onDelete,
}: {
  staff: StaffMember;
  onView: (s: StaffMember) => void;
  onEdit: (s: StaffMember) => void;
  onDelete: (s: StaffMember) => void;
}) {
  return (
    <div className="bg-card border-border group flex flex-col rounded-2xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={staff.photo}
            alt={staff.name}
            className="border-border h-20 w-20 rounded-2xl border object-cover"
          />
          <span
            className={cn(
              "border-card absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2",
              staff.available ? "bg-success" : "bg-danger",
            )}
            title={staff.available ? "Available" : "Off duty"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-heading truncate text-base font-bold">{staff.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
              {staff.designation}
            </span>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
              {staff.experienceYears} yrs exp
            </span>
          </div>
          <div className="text-muted-foreground mt-1.5 inline-flex items-center gap-1 text-xs">
            <Star className="fill-warning text-warning h-3.5 w-3.5" />
            <span className="text-heading font-semibold">{staff.rating.toFixed(1)}</span>
            <span>({staff.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {staff.specializations.slice(0, 4).map((s) => (
          <span
            key={s}
            className="border-border text-body rounded-full border px-2 py-0.5 text-[11px]"
          >
            {s}
          </span>
        ))}
        {staff.specializations.length > 4 && (
          <span className="text-muted-foreground text-[11px]">
            +{staff.specializations.length - 4}
          </span>
        )}
      </div>

      <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
        <span>
          <span className="text-heading font-semibold">{staff.bookingsThisMonth}</span> bookings · ₹
          {(staff.revenueThisMonth / 1000).toFixed(0)}K this month
        </span>
      </div>

      <div className="border-border mt-4 flex gap-1 border-t pt-3">
        <Button size="sm" variant="ghost" className="flex-1" onClick={() => onView(staff)}>
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button size="sm" variant="ghost" className="flex-1" onClick={() => onEdit(staff)}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-danger hover:bg-danger/10"
          onClick={() => onDelete(staff)}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
