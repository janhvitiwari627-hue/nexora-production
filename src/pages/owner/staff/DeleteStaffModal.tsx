import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { StaffMember } from "./mockStaff";

export function DeleteStaffModal({
  staff, others, onClose, onConfirm,
}: {
  staff: StaffMember | null;
  others: StaffMember[];
  onClose: () => void;
  onConfirm: (deleteId: string, reassignTo: string | null) => void;
}) {
  const [reassign, setReassign] = useState<string>("");

  if (!staff) return null;
  const activeBookings = 3; // mocked

  return (
    <Modal open={!!staff} onClose={onClose} title="Delete staff" size="md">
      <div className="space-y-5 p-6">
        <div className="bg-danger/10 text-danger flex gap-3 rounded-lg p-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            You're about to permanently delete <strong>{staff.name}</strong>. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-heading text-xs font-semibold uppercase tracking-wide">
            Reassign {activeBookings} upcoming bookings to
          </Label>
          <Select value={reassign} onValueChange={setReassign}>
            <SelectTrigger>
              <SelectValue placeholder="Select another staff member" />
            </SelectTrigger>
            <SelectContent>
              {others.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} · {s.designation}</SelectItem>
              ))}
              <SelectItem value="__none__">Don't reassign (cancel bookings)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-xs">
            Customers will be notified about the change.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!reassign}
            className="bg-danger hover:bg-danger/90 text-white"
            onClick={() => onConfirm(staff.id, reassign === "__none__" ? null : reassign)}
          >
            Delete staff
          </Button>
        </div>
      </div>
    </Modal>
  );
}
