import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function WContact({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  return (
    <section className="px-6 py-16 md:px-12">
      <SectionTitle font={template.font}>Get In Touch</SectionTitle>
      <div className="mx-auto mt-8 grid max-w-4xl gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Info icon={<MapPin className="h-5 w-5" />} label="Visit Us" value={shop.address} />
          <Info icon={<Phone className="h-5 w-5" />} label="Call" value={shop.phone} />
          {shop.email && <Info icon={<Mail className="h-5 w-5" />} label="Email" value={shop.email} />}
        </div>
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); toast.success("Message sent"); setForm({ name: "", email: "", message: "" }); }}>
          <Input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} />
          <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required maxLength={255} />
          <Textarea placeholder="Message" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required maxLength={1000} />
          <Button type="submit" className="w-full" style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}>Send Message</Button>
        </form>
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="text-primary">{icon}</div>
      <div><div className="text-muted-foreground text-xs uppercase tracking-wider">{label}</div><div className="font-medium">{value}</div></div>
    </div>
  );
}
