import { motion } from "framer-motion";
import { Award, BadgeCheck, Clock, GraduationCap, PlayCircle, Sparkles, Star, Users } from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

const CATEGORIES = [
  { name: "Hair", count: 24, color: "from-rose-400 to-fuchsia-500" },
  { name: "Skin & Facial", count: 18, color: "from-amber-300 to-orange-500" },
  { name: "Makeup", count: 22, color: "from-pink-400 to-rose-500" },
  { name: "Nails", count: 12, color: "from-violet-400 to-indigo-500" },
  { name: "Spa & Massage", count: 16, color: "from-emerald-400 to-teal-500" },
  { name: "Business", count: 9, color: "from-sky-400 to-indigo-500" },
];

const COURSES = [
  { id: "c1", title: "Master Hair Colouring", level: "Intermediate", duration: "6 weeks", price: 4999, rating: 4.9, students: 1820, instructor: "Aanya Sharma", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80" },
  { id: "c2", title: "Bridal Makeup Mastery", level: "Advanced", duration: "8 weeks", price: 7499, rating: 4.8, students: 1260, instructor: "Priya Nair", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" },
  { id: "c3", title: "Aromatherapy Foundations", level: "Beginner", duration: "4 weeks", price: 2999, rating: 4.7, students: 980, instructor: "Vikram Singh", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80" },
  { id: "c4", title: "Salon Business 101", level: "All levels", duration: "5 weeks", price: 3999, rating: 4.9, students: 2410, instructor: "Karan Mehta", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80" },
];

const INSTRUCTORS = [
  { name: "Aanya Sharma", title: "Senior Stylist · 8 yrs", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80" },
  { name: "Vikram Singh", title: "Colour Specialist · 12 yrs", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80" },
  { name: "Priya Nair", title: "Skin Therapist · 6 yrs", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80" },
  { name: "Rohan Mehta", title: "Master Barber · 10 yrs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" },
];

export function AcademyPage() {
  return (
  <div className="min-h-screen bg-background">
    <PublicPageHeader />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-20 md:py-28">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:32px_32px]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <GraduationCap className="h-3 w-3" /> Nexora Academy
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>
            Learn from India's best.
          </h1>
          <p className="mt-4 text-base text-white/85 md:text-lg">
            Industry-recognised certifications taught by award-winning professionals. Built for stylists, by stylists.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Explore by category</h2>
        <div className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <motion.button key={c.name} whileHover={{ y: -3 }} className={`overflow-hidden rounded-[20px] bg-gradient-to-br p-5 text-left shadow-[var(--shadow-card)] ${c.color}`}>
              <Sparkles className="h-6 w-6 text-white" />
              <div className="mt-6 text-white">
                <div className="text-base font-bold">{c.name}</div>
                <div className="text-xs opacity-80">{c.count} courses</div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-heading mb-8 text-3xl font-black md:text-4xl">Popular courses</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {COURSES.map((c) => (
              <article key={c.id} className="border-border bg-card flex flex-col overflow-hidden rounded-[var(--radius-card)] border transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]">
                <div className="relative aspect-video bg-muted">
                  <img src={c.image} alt={c.title} className="h-full w-full object-cover" />
                  <PlayCircle className="absolute inset-0 m-auto h-12 w-12 text-white drop-shadow-lg" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="text-primary text-[10px] font-bold uppercase tracking-wider">{c.level}</div>
                  <h3 className="text-heading mt-1 text-base font-bold">{c.title}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">by {c.instructor}</p>
                  <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                    <span className="inline-flex items-center gap-1"><Star className="text-warning fill-warning h-3 w-3" /> {c.rating}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.students.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-heading text-lg font-black">₹{c.price.toLocaleString("en-IN")}</span>
                    <button className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] px-3 py-1.5 text-xs font-bold">Enrol</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="mx-auto max-w-5xl px-4 py-20 md:px-6">
        <div className="from-primary/10 to-accent/10 border-primary/30 grid items-center gap-8 rounded-[24px] border bg-gradient-to-br p-8 md:grid-cols-[1fr_280px] md:p-12">
          <div>
            <BadgeCheck className="text-primary h-10 w-10" />
            <h3 className="text-heading mt-4 text-3xl font-black md:text-4xl">Industry-recognised certificates</h3>
            <p className="text-muted-foreground mt-3">Every course ends with a Nexora Academy certificate, recognised by 12,000+ partner salons. Get hired faster, earn more.</p>
            <ul className="text-heading mt-5 grid gap-2 text-sm md:grid-cols-2">
              {["Lifetime access", "Hands-on practice kits", "Live Q&A sessions", "Job placement help"].map((b) => <li key={b} className="flex items-start gap-2"><BadgeCheck className="text-primary mt-0.5 h-4 w-4 shrink-0" /> {b}</li>)}
            </ul>
          </div>
          <div className="border-primary/30 from-card to-muted relative aspect-[4/3] overflow-hidden rounded-[20px] border bg-gradient-to-br p-6 text-center shadow-xl">
            <Award className="text-primary mx-auto h-12 w-12" />
            <div className="text-muted-foreground mt-2 text-[10px] uppercase tracking-wider">Certified</div>
            <div className="text-heading mt-1 text-lg font-black">Nexora Academy</div>
            <div className="text-muted-foreground mt-2 text-xs">Master Hair Colouring</div>
            <div className="from-primary to-accent absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r" />
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-heading text-3xl font-black md:text-4xl">Meet your instructors</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {INSTRUCTORS.map((i) => (
              <article key={i.name} className="border-border bg-card rounded-[var(--radius-card)] border p-5 text-center">
                <img src={i.avatar} alt={i.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
                <h4 className="text-heading mt-3 text-sm font-bold">{i.name}</h4>
                <p className="text-muted-foreground text-xs">{i.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">Stories from our students</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: "Meera Kapoor", text: "I doubled my salary in 6 months after finishing the Bridal Makeup course." },
            { name: "Arjun Verma", text: "Loved the hands-on kits. Felt like learning from a friend, not a textbook." },
            { name: "Sneha Reddy", text: "Got placed in a top salon within 2 weeks of getting certified." },
          ].map((t) => (
            <article key={t.name} className="border-border bg-card rounded-[var(--radius-card)] border p-6">
              <div className="text-warning flex">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">"{t.text}"</p>
              <div className="text-heading border-border mt-4 border-t pt-3 text-sm font-bold">{t.name}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
