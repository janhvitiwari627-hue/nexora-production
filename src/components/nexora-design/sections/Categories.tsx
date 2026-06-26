import { Scissors, Sparkles, Droplets, PenTool, Heart, Palette, Crown, Gem } from "lucide-react";
import FadeIn from "../components/FadeIn";

const categories = [
  {
    title: "Salon",
    icon: Scissors,
    image: "https://images.pexels.com/photos/7195801/pexels-photo-7195801.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Beauty Parlour",
    icon: Sparkles,
    image: "https://images.pexels.com/photos/7195812/pexels-photo-7195812.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Spa",
    icon: Droplets,
    image: "https://images.pexels.com/photos/7031713/pexels-photo-7031713.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Tattoo Studio",
    icon: PenTool,
    image: "https://images.pexels.com/photos/28991529/pexels-photo-28991529.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Massage Center",
    icon: Heart,
    image: "https://images.pexels.com/photos/9146378/pexels-photo-9146378.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Nail Art Studio",
    icon: Palette,
    image: "https://images.pexels.com/photos/7755218/pexels-photo-7755218.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Makeup Artist",
    icon: Gem,
    image: "https://images.pexels.com/photos/7234531/pexels-photo-7234531.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
  {
    title: "Bridal Services",
    icon: Crown,
    image: "https://images.pexels.com/photos/20695691/pexels-photo-20695691.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600",
  },
];

export default function Categories() {
  return (
    <section id="explore" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Explore by Category
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              From quick trims to bridal makeovers — find exactly what you need.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <FadeIn key={cat.title} delay={i * 0.05}>
              <button className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 text-left shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md transition-colors group-hover:bg-indigo-600">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{cat.title}</h3>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
