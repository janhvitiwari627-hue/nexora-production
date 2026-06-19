import { useMemo, useState } from "react";
import { Flag, MessageSquare, Pencil, Send, Sparkles, Star, Trash2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FLAG_REASONS, initialReviews, type OwnerReview } from "./reviews/mockReviews";

type Filter = "all" | "1" | "2" | "3" | "4" | "5" | "replied" | "unreplied";

export function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<OwnerReview[]>(initialReviews);
  const [filter, setFilter] = useState<Filter>("all");
  const [autoRequest, setAutoRequest] = useState(true);
  const [flagTarget, setFlagTarget] = useState<OwnerReview | null>(null);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const buckets = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));
    return { total, avg, buckets };
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filter === "all") return true;
        if (filter === "replied") return !!r.reply;
        if (filter === "unreplied") return !r.reply;
        return r.rating === Number(filter);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [reviews, filter]);

  const updateReview = (id: string, patch: Partial<OwnerReview>) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const submitFlag = (reason: string) => {
    if (!flagTarget) return;
    updateReview(flagTarget.id, { flagged: true });
    console.log("Review flagged:", flagTarget.id, reason);
    setFlagTarget(null);
  };

  const FilterTab = ({ value, label }: { value: Filter; label: string }) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
        filter === value
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        <header>
          <h1 className="text-heading text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Respond to feedback and keep your reputation healthy.
          </p>
        </header>

        {/* Summary */}
        <Card className="p-6">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-heading">{stats.avg.toFixed(1)}</div>
              <div className="flex justify-center md:justify-start gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i <= Math.round(stats.avg)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on {stats.total} reviews
              </p>
            </div>
            <div className="space-y-2">
              {stats.buckets
                .slice()
                .reverse()
                .map(({ star, count }) => {
                  const pct = stats.total ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-6 text-right">{star}★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>

        {/* Auto-request toggle */}
        <Card className="p-4 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-full bg-primary/10 p-2 h-fit">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-heading">Auto-request reviews</p>
              <p className="text-sm text-muted-foreground">
                Automatically send a WhatsApp review request 2 hours after each completed booking.
              </p>
            </div>
          </div>
          <Switch checked={autoRequest} onCheckedChange={setAutoRequest} />
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <FilterTab value="all" label={`All (${reviews.length})`} />
          <FilterTab value="5" label="5★" />
          <FilterTab value="4" label="4★" />
          <FilterTab value="3" label="3★" />
          <FilterTab value="2" label="2★" />
          <FilterTab value="1" label="1★" />
          <FilterTab value="unreplied" label={`Unreplied (${reviews.filter((r) => !r.reply).length})`} />
          <FilterTab value="replied" label="Replied" />
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onSaveReply={(reply) =>
                updateReview(review.id, { reply, replyDate: new Date().toISOString().slice(0, 10) })
              }
              onDeleteReply={() =>
                updateReview(review.id, { reply: undefined, replyDate: undefined })
              }
              onFlag={() => setFlagTarget(review)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No reviews match this filter.</p>
          )}
        </div>
      </div>

      <FlagModal
        open={!!flagTarget}
        onClose={() => setFlagTarget(null)}
        onSubmit={submitFlag}
      />
    </div>
  );
}

function ReviewItem({
  review,
  onSaveReply,
  onDeleteReply,
  onFlag,
}: {
  review: OwnerReview;
  onSaveReply: (reply: string) => void;
  onDeleteReply: () => void;
  onFlag: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.reply ?? "");

  const startEdit = () => {
    setDraft(review.reply ?? "");
    setEditing(true);
  };

  const save = () => {
    if (!draft.trim()) return;
    onSaveReply(draft.trim());
    setEditing(false);
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <img src={review.avatar} alt={review.customerName} className="h-10 w-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-semibold text-heading">{review.customerName}</p>
              <p className="text-xs text-muted-foreground">
                {review.service} · {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground mt-3">{review.text}</p>

          {/* Existing reply */}
          {review.reply && !editing && (
            <div className="mt-4 rounded-xl bg-muted/50 p-3 border-l-4 border-primary">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-primary">Your reply</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startEdit}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600"
                    onClick={onDeleteReply}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm mt-1">{review.reply}</p>
              {review.replyDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Replied {new Date(review.replyDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Reply composer */}
          {(!review.reply || editing) && (
            <div className="mt-4 space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a thoughtful reply..."
                rows={3}
              />
              <div className="flex justify-end gap-2">
                {editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button size="sm" onClick={save} disabled={!draft.trim()}>
                  <Send className="h-3.5 w-3.5 mr-1" />
                  {editing ? "Update Reply" : "Post Reply"}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={onFlag}
              className={`flex items-center gap-1 ${
                review.flagged ? "text-red-600" : "text-muted-foreground hover:text-red-600"
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {review.flagged ? "Reported" : "Report Inappropriate"}
            </button>
            {!review.reply && !editing && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" /> Awaiting your reply
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function FlagModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState<string>(FLAG_REASONS[0]);
  return (
    <Modal open={open} onClose={onClose} title="Report Review" size="md">
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Tell us why this review violates our guidelines. Our team will review within 48 hours.
        </p>
        <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
          {FLAG_REASONS.map((r) => (
            <Label
              key={r}
              className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40"
            >
              <RadioGroupItem value={r} />
              <span>{r}</span>
            </Label>
          ))}
        </RadioGroup>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(reason)}>Submit Report</Button>
        </div>
      </div>
    </Modal>
  );
}
