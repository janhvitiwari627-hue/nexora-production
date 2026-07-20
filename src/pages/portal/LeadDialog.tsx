import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

type Props = {
  trigger: React.ReactNode;
  target: { type: "brand" | "distributor"; id: string; name: string };
};

export function LeadDialog({ trigger, target }: Props) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.full_name ?? "",
    email: user?.email ?? "",
    phone: profile?.mobile ?? "",
    city: profile?.city ?? "",
    message: "",
  });

  const submit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Please add your name and a short message");
      return;
    }
    setLoading(true);
    const payload: any = {
      target_type: target.type,
      from_user_id: user?.id ?? null,
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      city: form.city.trim() || null,
      message: form.message.trim(),
    };
    if (target.type === "brand") payload.brand_id = target.id;
    else payload.distributor_id = target.id;

    const { error } = await supabase.from("portal_leads").insert(payload);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Inquiry sent to ${target.name}`);
    setOpen(false);
    setForm((f) => ({ ...f, message: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send inquiry to {target.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="ld-name">Your name *</Label>
            <Input
              id="ld-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ld-email">Email</Label>
              <Input
                id="ld-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ld-phone">Phone</Label>
              <Input
                id="ld-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="ld-city">City</Label>
            <Input
              id="ld-city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ld-msg">Message *</Label>
            <Textarea
              id="ld-msg"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell them about your business and what you're looking for…"
            />
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
            {loading ? "Sending…" : "Send inquiry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
