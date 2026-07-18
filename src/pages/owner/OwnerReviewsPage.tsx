import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageSquare, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { ownerReviewsQuery } from "@/lib/owner.queries";
import { replyToOwnerReview } from "@/lib/owner.functions";

type Filter = "all" | "1" | "2" | "3" | "4" | "5" | "replied" | "unreplied";

export function OwnerReviewsPage() {
  const { activeSalonId, isLoading: ownerLoading } = useOwnerContext();
  const qc = useQueryClient();
  const replyFn = useServerFn(replyToOwnerReview);
  const [filter, setFilter] = useState<Filter>("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const query = useQuery(ownerReviewsQuery(activeSalonId ?? ""));
  const reviews = useMemo(() => query.data ?? [], [query.data]);

  const reply = useMutation({
    mutationFn: ({ reviewId, text }: { reviewId: string; text: string }) =>
      replyFn({ data: { review_id: reviewId, reply: text } }),
    onSuccess: (_row, variables) => {
      toast.success("Reply published");
      setDrafts((current) => ({ ...current, [variables.reviewId]: "" }));
      if (activeSalonId) {
        qc.invalidateQueries({ queryKey: ["owner", "reviews", activeSalonId] });
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const stats = useMemo(() => {
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
    return { total, average };
  }, [reviews]);

  const filtered = useMemo(
    () =>
      reviews.filter((review) => {
        if (filter === "all") return true;
        if (filter === "replied") return Boolean(review.owner_reply);
        if (filter === "unreplied") return !review.owner_reply;
        return review.rating === Number(filter);
      }),
    [filter, reviews],
  );

  if (ownerLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!activeSalonId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">No salon connected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete salon setup to receive reviews.
        </p>
        <Button className="mt-4" asChild>
          <a href="/owner/onboarding">Start setup</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-heading">Reviews</h1>
        <p className="mt-1 text-muted-foreground">Real customer feedback for completed bookings.</p>
      </header>

      <Card className="grid gap-6 p-6 md:grid-cols-2">
        <div>
          <div className="text-5xl font-bold">{stats.average.toFixed(1)}</div>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= Math.round(stats.average) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Based on {stats.total} reviews</p>
        </div>
        <div className="flex flex-wrap content-center gap-2">
          {(["all", "5", "4", "3", "2", "1", "unreplied", "replied"] as Filter[]).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {value === "all"
                ? "All"
                : value === "replied"
                  ? "Replied"
                  : value === "unreplied"
                    ? "Needs reply"
                    : `${value} star`}
            </Button>
          ))}
        </div>
      </Card>

      {query.isLoading ? (
        <Card className="grid min-h-40 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </Card>
      ) : query.isError ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-destructive">{query.error.message}</p>
          <Button className="mt-3" variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-3 h-8 w-8" />
          {reviews.length ? "No reviews match this filter." : "No customer reviews yet."}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => {
            const customer = Array.isArray(review.customer) ? review.customer[0] : review.customer;
            const name = customer?.full_name?.trim() || "Customer";
            const draft = drafts[review.id] ?? "";
            return (
              <Card key={review.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{name}</div>
                    <div className="mt-1 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-IN")}
                  </time>
                </div>
                <p className="mt-3 text-sm">
                  {review.comment?.trim() || "Rating submitted without a comment."}
                </p>
                {review.owner_reply && (
                  <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
                    <strong>Your reply:</strong> {review.owner_reply}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Textarea
                    value={draft}
                    maxLength={1000}
                    rows={2}
                    placeholder={
                      review.owner_reply ? "Write an updated reply" : "Reply to this customer"
                    }
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [review.id]: event.target.value }))
                    }
                  />
                  <Button
                    size="icon"
                    aria-label="Publish reply"
                    disabled={!draft.trim() || reply.isPending}
                    onClick={() => reply.mutate({ reviewId: review.id, text: draft.trim() })}
                  >
                    {reply.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
