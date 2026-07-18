import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerSalonFull, updateOwnerSalon } from "@/lib/owner.functions";

const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

export function LiveVideoTab({ salonId }: { salonId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const getSalon = useServerFn(getOwnerSalonFull);
  const updateSalon = useServerFn(updateOwnerSalon);
  const [uploading, setUploading] = useState(false);
  const queryKey = ["owner", "salon-full", salonId];
  const salonQuery = useQuery({
    queryKey,
    queryFn: () => getSalon({ data: { salon_id: salonId } }),
  });
  const videoUrl = salonQuery.data?.video_url ?? null;
  const save = useMutation({
    mutationFn: (url: string | null) =>
      updateSalon({ data: { salon_id: salonId, patch: { video_url: url } } }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (error: Error) => toast.error(error.message),
  });

  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) return toast.error("Video must be 10MB or smaller");
    if (!file.type.startsWith("video/")) return toast.error("Please select a video file");
    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${salonId}/salon-video-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("salon-media").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
      await save.mutateAsync(data.publicUrl);
      toast.success("Salon video uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (salonQuery.isLoading)
    return (
      <div className="grid min-h-40 place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5">
      <input
        ref={input}
        className="hidden"
        type="file"
        accept="video/mp4,video/webm"
        onChange={(event) => upload(event.target.files?.[0])}
      />
      {videoUrl ? (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <video className="aspect-video w-full bg-black object-contain" controls src={videoUrl} />
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-muted-foreground">One public salon video · maximum 10MB</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => input.current?.click()} disabled={uploading}>
                Replace
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => save.mutate(null)}
                disabled={save.isPending}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="grid min-h-64 w-full place-items-center rounded-2xl border-2 border-dashed bg-card p-8 text-center hover:bg-muted/40"
        >
          <span>
            <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <strong className="block">{uploading ? "Uploading…" : "Upload salon video"}</strong>
            <span className="mt-1 block text-sm text-muted-foreground">
              MP4 or WebM · maximum 10MB
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
