import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Loader2, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSavedJobs, removeSavedJob, type SavedJob } from "@/lib/jobs";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export function SavedJobsPage() {
  const { user, isLoading } = useAuthStore();
  const [items, setItems] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    listSavedJobs(user.id)
      .then(setItems)
      .catch(() => toast.error("Saved jobs load nahi ho paaye."))
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Bookmark className="mx-auto mb-4 h-12 w-12 text-orange-600" />
        <h1 className="text-2xl font-black">Saved jobs dekhein</h1>
        <p className="mt-2 text-sm text-slate-600">
          Jobs save aur sync karne ke liye login karein.
        </p>
        <Button asChild className="mt-5">
          <Link to="/login">Login / Signup</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-black">Saved Jobs</h1>
        <p className="text-sm text-slate-600">Aapki shortlist ki hui openings.</p>
      </div>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-bold">Abhi koi saved job nahi hai</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/app/jobs">Browse jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        items.map(({ id, job }) => (
          <Card key={id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="min-w-0 flex-1">
                <h2 className="font-black">{job.title}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {job.employer?.business_name || "Nexora Partner"}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {job.area ? `${job.area}, ` : ""}
                  {job.city}
                </p>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remove saved job"
                onClick={async () => {
                  try {
                    await removeSavedJob(job.id, user.id);
                    setItems((current) => current.filter((item) => item.id !== id));
                    toast.success("Saved job removed");
                  } catch {
                    toast.error("Job remove nahi ho paayi.");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
