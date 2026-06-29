import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { ShareButton } from "./ShareButton";
import { Calendar } from "lucide-react";

export function WBlog({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  if (!shop.blog || shop.blog.length === 0) return null;
  return (
    <section id="blog" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Latest from the Blog</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">Tips, trends and beauty inspiration.</p>
      <div className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">
        {shop.blog.map((post) => (
          <article key={post.id} className="overflow-hidden border bg-white shadow-sm transition-transform hover:-translate-y-1" style={{ borderRadius: template.radius }}>
            <img src={post.image} alt={post.title} loading="lazy" className="aspect-video w-full object-cover" />
            <div className="space-y-2 p-5">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" /> {post.date}
              </div>
              <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{post.title}</h3>
              <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
              <div className="flex items-center justify-end pt-2">
                <ShareButton title={`${post.title} — ${shop.name}`} label="" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
