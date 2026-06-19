import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export function WAppointmentForm({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const [form, setForm] = useState({ service: "", date: "", time: "", name: "", phone: "" });
  return (
    <section className="px-6 py-16 md:px-12" style={{ backgroundColor: `${template.colors.primary}10` }}>
      <SectionTitle font={template.font}>Book An Appointment</SectionTitle>
      <form
        onSubmit={e => { e.preventDefault(); toast.success("Booking confirmed — see you soon!"); setForm({ service: "", date: "", time: "", name: "", phone: "" }); }}
        className="mx-auto mt-8 grid max-w-3xl gap-3 md:grid-cols-2"
      >
        <Select value={form.service} onValueChange={v => setForm({ ...form, service: v })}>
          <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
          <SelectContent>{shop.services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — ₹{s.price}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
        <Input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={100} />
        <Input placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="md:col-span-2" />
        <Button type="submit" size="lg" className="md:col-span-2" style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}>Confirm Booking</Button>
      </form>
    </section>
  );
}
