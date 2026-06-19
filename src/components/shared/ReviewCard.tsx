import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";
import { StarRating } from "./StarRating";

export type Review = {
  id: string;
  author_name: string;
  author_avatar?: string | null;
  rating: number;
  date: string;
  text: string;
  photos?: string[];
  helpful_count: number;
  owner_reply?: { author: string; date: string; text: string } | null;
};

export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = review.photos ?? [];

  return (
    <article className="bg-card border-border rounded-[var(--radius-card)] border p-5">
      <header className="flex items-start gap-3">
        <div className="bg-muted h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {review.author_avatar ? (
            <img src={review.author_avatar} alt={review.author_name} className="h-full w-full object-cover" />
          ) : (
            <div className="bg-gradient-cta text-primary-foreground grid h-full w-full place-items-center text-sm font-bold">
              {review.author_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-heading">{review.author_name}</h4>
            <time className="text-muted-foreground text-xs">{review.date}</time>
          </div>
          <StarRating value={review.rating} size={14} />
        </div>
      </header>

      <p className={cn("text-body mt-3 text-sm leading-relaxed", !expanded && "line-clamp-2")}>
        {review.text}
      </p>
      {review.text.length > 140 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-primary mt-1 text-xs font-semibold hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {photos.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((src, i) => (
            <button
              type="button"
              key={src + i}
              onClick={() => setLightboxIndex(i)}
              className="h-20 w-20 shrink-0 overflow-hidden rounded-lg"
            >
              <img src={src} alt={`Review photo ${i + 1}`} className="h-full w-full object-cover transition hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {review.owner_reply && (
        <div className="bg-muted mt-4 rounded-lg p-3">
          <p className="text-heading text-xs font-semibold">
            {review.owner_reply.author} <span className="text-muted-foreground font-normal">· Owner · {review.owner_reply.date}</span>
          </p>
          <p className="text-body mt-1 text-sm">{review.owner_reply.text}</p>
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setHelpful((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
            helpful ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/40",
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({review.helpful_count + (helpful ? 1 : 0)})
        </button>
        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <Star className="h-3 w-3 fill-warning text-warning" /> Verified booking
        </span>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}
