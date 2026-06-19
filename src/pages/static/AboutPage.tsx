import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Target, Trophy, Users } from "lucide-react";

const TEAM = [
  { name: "Aarav Kapoor", role: "Founder & CEO" },
  { name: "Priya Mehta", role: "Co-founder & CPO" },
  { name: "Vikram Singh", role: "CTO" },
  { name: "Neha Sharma", role: "Head of Design" },
];
const MILESTONES = [
  { year: "2022", title: "Nexora founded", desc: "Started with a mission to digitize India's salon industry." },
  { year: "2023", title: "1,000 shops onboarded", desc: "Crossed our first major milestone." },
  { year: "2024", title: "Series A funding", desc: "Raised ₹40Cr to expand nationwide." },
  { year: "2026", title: "10,000+ businesses", desc: "Powering salons across 50+ cities." },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 p-6 md:p-12">
      <section className="text-center">
        <h1 className="text-heading text-4xl font-bold md:text-5xl">We're building the OS for beauty businesses</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">From bookings to billing, marketing to memberships — Nexora empowers India's salon ecosystem with one platform.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card><CardContent className="p-6">
          <Target className="text-primary mb-3 h-8 w-8" />
          <h2 className="text-xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground mt-2">Democratize technology for every salon, spa, and studio owner in India.</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <Sparkles className="text-primary mb-3 h-8 w-8" />
          <h2 className="text-xl font-bold">Our Vision</h2>
          <p className="text-muted-foreground mt-2">A world where every beauty professional can build, grow, and thrive with the tools they deserve.</p>
        </CardContent></Card>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold flex items-center justify-center gap-2"><Users className="h-6 w-6" /> Meet the Team</h2>
        <div className="grid gap-5 md:grid-cols-4">
          {TEAM.map(t => (
            <div key={t.name} className="text-center">
              <Avatar className="mx-auto h-20 w-20"><AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback></Avatar>
              <div className="mt-3 font-semibold">{t.name}</div>
              <div className="text-muted-foreground text-sm">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-2xl font-bold flex items-center justify-center gap-2"><Trophy className="h-6 w-6" /> Milestones</h2>
        <ol className="relative space-y-6 border-l-2 pl-6">
          {MILESTONES.map((m, i) => (
            <li key={i} className="relative">
              <div className="bg-primary absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-white">{i + 1}</div>
              <div className="text-primary text-sm font-semibold">{m.year}</div>
              <div className="font-bold">{m.title}</div>
              <div className="text-muted-foreground text-sm">{m.desc}</div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
