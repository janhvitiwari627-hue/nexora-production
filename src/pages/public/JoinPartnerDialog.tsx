import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

const ROLES = [
  "Hair Product Salesman",
  "Cosmetic Sales Executive",
  "Distributor",
  "Brand Representative",
  "Spa Supplier",
  "Tattoo Supplier",
  "Beauty Consultant",
  "Nail Product Distributor",
  "Other",
];

type Props = { trigger: React.ReactNode };

export function JoinPartnerDialog({ trigger }: Props) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.full_name ?? "",
    phone: profile?.mobile ?? "",
    district: profile?.city ?? "",
    role: "",
  });

  const submit = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const district = form.district.trim();
    const role = form.role.trim();

    if (name.length < 2) return toast.error("Please enter your full name");
    if (!/^[0-9+\-\s()]{6,20}$/.test(phone))
      return toast.error("Please enter a valid phone number");
    if (district.length < 2) return toast.error("Please enter your district");
    if (!role) return toast.error("Please select your role");

    setLoading(true);
    const { error } = await supabase.from("portal_leads").insert({
      target_type: "partner",
      from_user_id: user?.id ?? null,
      name,
      phone,
      city: district,
      message: `Role: ${role}`,
      status: "new",
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thanks! Our team will reach out shortly.");
    setOpen(false);
    setForm((f) => ({ ...f, role: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join the Partner Program — Free</DialogTitle>
          <DialogDescription>
            Fill in a few details. Our team will contact you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label htmlFor="jp-name">Full name</Label>
            <Input
              id="jp-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="jp-phone">Phone</Label>
            <Input
              id="jp-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98xxxxxxxx"
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="jp-district">District</Label>
            <Input
              id="jp-district"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="e.g. Jaipur"
            />
          </div>
          <div>
            <Label htmlFor="jp-role">Your role</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
            >
              <SelectTrigger id="jp-role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
            className="bg-gradient-cta text-primary-foreground"
          >
            {loading ? "Submitting…" : "Join Free"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
