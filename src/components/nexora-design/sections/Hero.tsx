import { motion } from "framer-motion";
import { ArrowRight, Play, Star, MapPin } from "lucide-react";
import FadeIn from "../FadeIn";

export default function Hero() {
  return (
    <section className="relative overflow-hidden gradient-mesh">
      {/* Soft decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* Left Content */}
          <FadeIn direction="up" className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
              Now live in Jaipur
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Book Jaipur's Best{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Beauty Services
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              Discover trusted professionals, manage appointments, and grow your
              business — all on India's Beauty Industry Operating System.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#explore"
                className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
              >
                Find a Salon
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-700"
              >
                <Play className="h-4 w-4 fill-current" />
                For Shop Owners
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"
                    />
                  ))}
                </div>
                <span className="font-medium text-slate-700">12,000+</span> bookings
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-slate-700">4.9</span> average rating
              </div>
            </div>
          </FadeIn>

          {/* Right Visual Composition */}
          <div className="relative mx-auto h-[480px] w-full max-w-xl lg:max-w-none">
            {/* Amber Fort watermark */}
            <div className="pointer-events-none absolute -right-10 bottom-10 h-64 w-64 overflow-hidden rounded-full opacity-20 blur-sm lg:h-80 lg:w-80">
              <img
                src="https://images.pexels.com/photos/19446861/pexels-photo-19446861.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=600"
                alt="Amber Fort Jaipur"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Background landmark card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 h-[360px] w-[78%] overflow-hidden rounded-[2rem] border border-white/50 bg-white shadow-2xl shadow-indigo-900/10 lg:w-[70%]"
            >
              <img
                src="https://images.pexels.com/photos/19149591/pexels-photo-19149591.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1000"
                alt="Hawa Mahal Jaipur"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-sm backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" />
                Jaipur, Rajasthan
              </div>
            </motion.div>

            {/* Foreground salon card */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 h-[280px] w-[65%] overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl shadow-indigo-900/15 lg:w-[55%]"
            >
              <img
                src="https://images.pexels.com/photos/7195801/pexels-photo-7195801.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=900"
                alt="Premium salon interior"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-4 top-1/2 z-10 w-44 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-xl shadow-indigo-900/10 backdrop-blur-xl"
            >
              <p className="text-xs font-medium text-slate-500">Today's bookings</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">2,840</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-600">+18% this week</p>
            </motion.div>

            {/* Tech badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute left-[55%] top-8 z-10 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
            >
              India's Beauty OS
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
