import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  salon_id: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
  salons: { name: string | null } | null;
};

export function ReviewModerationPage() {
  const qc = useQueryClient();

  const reviewsQ = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,rating,comment,created_at,user_id,salon_id,profiles(full_name,avatar_url),salons(name)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as ReviewRow[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviews = reviewsQ.data ?? [];
  const [minRating, setMinRating] = useState<number>(0);
  const filtered = reviews.filter((r) => r.rating >= minRating);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground text-sm">All customer reviews across the platform ({reviews.length} total).</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <Button key={r} size="sm" variant={minRating === r ? "default" : "outline"} onClick={() => setMinRating(r)}>
            {r === 0 ? "All ratings" : `${r}★ +`}
          </Button>
        ))}
      </div>

      {reviewsQ.isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
        </div>
      ) : reviewsQ.error ? (
        <div className="py-8 text-sm text-rose-600">Failed to load reviews.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{(r.profiles?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.profiles?.full_name ?? "Anonymous"}</span>
                      <span className="text-muted-foreground text-xs">on {r.salons?.name ?? "unknown shop"}</span>
                      <span className="text-muted-foreground text-xs">· {new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm">{r.comment ?? <span className="text-muted-foreground italic">(no comment)</span>}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => del.mutate(r.id)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No reviews match.</div>
          )}
        </div>
      )}
    </div>
  );
}
