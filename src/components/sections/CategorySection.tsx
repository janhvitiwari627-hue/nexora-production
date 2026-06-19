import { motion } from "framer-motion";
import {
  Scissors,
  Sparkles,
  Droplets,
  Palette,
  Hand,
  Brush,
  Heart,
  Flower2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

const CATEGORIES = [
  { name: "Salon", count: 412, icon: Scissors, from: "#635BFF", to: "#00D4FF" },
  { name: "Beauty Parlour", count: 287, icon: Flower2, from: "#FF6B9D", to: "#FFB36B" },
  { name: "Spa", count: 164, icon: Droplets, from: "#00D4FF", to: "#22D3A0" },
  { name: "Tattoo Studio", count: 58, icon: Palette, from: "#0A2540", to: "#635BFF" },
  { name: "Massage Center", count: 92, icon: Hand, from: "#22D3A0", to: "#00D4FF" },
  { name: "Nail Art Studio", count: 124, icon: Brush, from: "#FF6B9D", to: "#635BFF" },
  { name: "Makeup Artist", count: 211, icon: Sparkles, from: "#FFB36B", to: "#FF6B9D" },
  { name: "Bridal Services", count: 78, icon: Heart, from: "#FF4F8B", to: "#FFB36B" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
      <div className="mb-10">
        <h2 className="relative inline-block text-3xl font-black tracking-tight text-heading md:text-4xl">
          Explore by Category
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-2 left-0 h-1 w-24 origin-left rounded-full bg-gradient-to-r from-[#635BFF] to-[#00D4FF]"
          />
        </h2>
        <p className="mt-4 text-muted-foreground">
          Whatever you're in the mood for, we've got the right pros.
        </p>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {CATEGORIES.map((c) => (
          <motion.div key={c.name} variants={item}>
            <Link
              to="/search"
              className="group relative block overflow-hidden rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_rgba(99,91,255,0.45)]"
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              >
                <c.icon className="h-7 w-7" />
              </div>
              <div className="mt-4 text-base font-bold text-heading">{c.name}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {c.count} businesses
              </div>
              <div
                className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
