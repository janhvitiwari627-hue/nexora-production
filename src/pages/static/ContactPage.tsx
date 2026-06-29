import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-12">
      <header className="text-center">
        <h1 className="text-heading text-4xl font-bold">Get in Touch</h1>
        <p className="text-muted-foreground mt-2">We're here to help. Reach out anytime.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          <Card><CardContent className="space-y-4 p-5">
            <Info icon={<MapPin className="h-5 w-5" />} label="Office" value="WeWork Galaxy, Bangalore — 560008" />
            <Info icon={<Phone className="h-5 w-5" />} label="Phone" value="+91 80 4000 1234" />
            <Info icon={<Mail className="h-5 w-5" />} label="Email" value="hello@nexora.app" />
          </CardContent></Card>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
            <a href="https://wa.me/918040001234" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> WhatsApp Support</a>
          </Button>
          {(() => {
            const socials = [
              { url: import.meta.env.VITE_SOCIAL_INSTAGRAM as string | undefined, label: "Instagram", Icon: Instagram },
              { url: import.meta.env.VITE_SOCIAL_FACEBOOK as string | undefined, label: "Facebook", Icon: Facebook },
              { url: import.meta.env.VITE_SOCIAL_LINKEDIN as string | undefined, label: "LinkedIn", Icon: Linkedin },
            ].filter((s) => s.url);
            if (socials.length === 0) return null;
            return (
              <div className="flex justify-center gap-3">
                {socials.map(({ url, label, Icon }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon className="text-muted-foreground hover:text-primary h-5 w-5" />
                  </a>
                ))}
              </div>
            );
          })()}
          <div className="bg-muted h-40 overflow-hidden rounded-lg">
            <iframe title="Office map" className="h-full w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=77.62%2C12.97%2C77.65%2C12.99&layer=mapnik" loading="lazy" />
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Send Us a Message</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={e => { e.preventDefault(); toast.success("Message sent!"); setForm({ name: "", email: "", subject: "", message: "" }); }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Name</Label><Input maxLength={100} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" maxLength={255} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Subject</Label><Input maxLength={200} required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Message</Label><Textarea rows={5} required maxLength={2000} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-0.5">{icon}</div>
      <div><div className="text-muted-foreground text-xs uppercase tracking-wider">{label}</div><div className="font-medium">{value}</div></div>
    </div>
  );
}
