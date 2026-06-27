import { ArrowRight, Check, Globe, Paintbrush, Rocket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import FadeIn from "../FadeIn";
import { websiteTemplatesQuery } from "@/lib/website-templates.queries";

const FALLBACK_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-slate-700 to-slate-900",
  "from-rose-400 to-pink-600",
];

export default function WhiteLabelBuilder() {
  const { data: templates = [], isLoading } = useQuery(websiteTemplatesQuery());

  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <FadeIn>
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                White Label Website Builder
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Launch a brand that looks like you.
              </h2>
              <p className="mt-5 text-lg text-slate-500">
                Choose a premium template, customize your services, and publish a
                stunning website for your salon in minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/owner/create-website"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  <Globe className="h-4 w-4" />
                  Explore Templates
                </Link>
                <Link
                  to="/owner/create-website"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                >
                  <Paintbrush className="h-4 w-4" />
                  Customize
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Go live in 3 steps</p>
                <p className="text-xs text-slate-500">Choose · Customize · Publish</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Horizontal scroll */}
        <FadeIn>
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 hide-scrollbar snap-x snap-mandatory">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg sm:w-[520px]"
                  >
                    <div className="h-12 bg-slate-50 animate-pulse" />
                    <div className="aspect-[16/10] bg-slate-100 animate-pulse" />
                    <div className="p-5">
                      <div className="h-5 w-1/3 rounded bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                ))
              : templates.length === 0 ? (
                  <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                    No templates available yet.
                  </div>
                ) : templates.map((tpl, idx) => {
                  const gradient = FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length];
                  const slug = (tpl.template_slug ?? tpl.template_key ?? tpl.template_name).toLowerCase().replace(/\s+/g, "");
                  const previewKey = tpl.template_key ?? tpl.template_slug ?? "";
                  return (
                    <div
                      key={tpl.id}
                      className="group w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:w-[520px]"
                    >
                      {/* Browser chrome */}
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-rose-400" />
                          <span className="h-3 w-3 rounded-full bg-amber-400" />
                          <span className="h-3 w-3 rounded-full bg-emerald-400" />
                        </div>
                        <div className="ml-4 h-6 flex-1 rounded-md bg-white text-[10px] leading-6 text-slate-400">
                          <span className="pl-3">{slug}.nexora.site</span>
                        </div>
                      </div>
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {tpl.preview_image ? (
                          <img
                            src={tpl.preview_image}
                            alt={tpl.template_name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div
                            className="h-full w-full"
                            style={{
                              background: `linear-gradient(135deg, ${tpl.primary_color ?? "#6366f1"}, ${tpl.secondary_color ?? "#a855f7"})`,
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute bottom-4 left-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <a
                            href={`/site/preview?t=${encodeURIComponent(previewKey)}&preview=1`}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-block rounded-full bg-gradient-to-r ${gradient} px-4 py-2 text-xs font-bold text-white shadow-lg`}
                          >
                            Preview {tpl.template_name}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-5">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{tpl.template_name}</h3>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {[tpl.category ?? "Salon", tpl.theme_type ?? "Premium", "Booking"].map((f) => (
                              <li
                                key={f}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                <Check className="h-3 w-3" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link
                          to="/owner/create-website"
                          aria-label={`Use ${tpl.template_name}`}
                          className="rounded-full bg-slate-900 p-2.5 text-white transition-transform hover:scale-110 active:scale-95"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
