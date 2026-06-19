import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pencil, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StarPicker } from "./reviews/StarPicker";
import { ReviewModal } from "./reviews/ReviewModal";
import {
  mockPendingReviews,
  mockReviews,
  type MyReview,
  type PendingReviewItem,
} from "./reviews/mockReviews";

export function MyReviewsPage() {
  const [reviews, setReviews] = useState<MyReview[]>(mockReviews);
  const [pending, setPending] = useState<PendingReviewItem[]>(mockPendingReviews);
  const [editing, setEditing] = useState<MyReview | null>(null);
  const [writingFor, setWritingFor] = useState<PendingReviewItem | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-black sm:text-3xl">My Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit your reviews, manage moderation status, and complete pending feedback.
          </p>
        </header>

        {/* Pending */}
        {pending.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Awaiting your review</h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                {pending.length} pending
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {pending.map((p) => (
                <article
                  key={p.bookingId}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"
                >
                  <img
                    src={p.shopImage}
                    alt={p.shopName}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{p.shopName}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.service}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Completed{" "}
                      {new Date(p.completedISO).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWritingFor(p)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <Star className="h-3.5 w-3.5 fill-current" /> Write Review
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Reviews list */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Your reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
              <Star className="mx-auto h-10 w-10 text-amber-400" />
              <p className="mt-3 text-lg font-bold">No reviews yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share your experience after your next visit.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5"
                >
                  <div className="flex gap-4">
                    <img
                      src={r.shopImage}
                      alt={r.shopName}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to="/shop/$slug"
                            params={{ slug: r.shopSlug }}
                            className="truncate text-sm font-bold hover:underline"
                          >
                            {r.shopName}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            <StarPicker value={r.rating} readOnly size={16} />
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(r.dateISO).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-bold capitalize",
                            r.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {r.status === "published" ? "Published" : "Pending Moderation"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{r.text}</p>

                      {r.photos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.photos.map((p, i) => (
                            <img
                              key={i}
                              src={p}
                              alt=""
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(r)}
                          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReviews((rs) => rs.filter((x) => x.id !== r.id))
                          }
                          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ReviewModal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={editing ? `Edit review · ${editing.shopName}` : ""}
          initialRating={editing?.rating ?? 0}
          initialText={editing?.text ?? ""}
          initialPhotos={editing?.photos ?? []}
          onSubmit={({ rating, text, photos }) => {
            if (!editing) return;
            setReviews((rs) =>
              rs.map((r) =>
                r.id === editing.id
                  ? { ...r, rating, text, photos, status: "pending" }
                  : r,
              ),
            );
            setEditing(null);
          }}
        />

        <ReviewModal
          open={!!writingFor}
          onClose={() => setWritingFor(null)}
          title={writingFor ? `Review ${writingFor.shopName}` : ""}
          onSubmit={({ rating, text, photos }) => {
            if (!writingFor) return;
            setReviews((rs) => [
              {
                id: `rv-${Date.now()}`,
                shopName: writingFor.shopName,
                shopSlug: writingFor.shopSlug,
                shopImage: writingFor.shopImage,
                rating,
                text,
                photos,
                dateISO: new Date().toISOString(),
                status: "pending",
              },
              ...rs,
            ]);
            setPending((p) => p.filter((x) => x.bookingId !== writingFor.bookingId));
            setWritingFor(null);
          }}
        />
      </main>
      <PublicFooter />
    </div>
  );
}
