import { useRef, useState } from "react";
import { Crown, Loader2, Trash2, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getSalonGallery, setSalonGallery } from "@/lib/owner.functions";

const MAX_PHOTOS = 20;
const MAX_BYTES = 5 * 1024 * 1024;

export function LivePhotosTab({ salonId }: { salonId: string }) {
  const qc = useQueryClient();
  const getFn = useServerFn(getSalonGallery);
  const setFn = useServerFn(setSalonGallery);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const queryKey = ["owner", "gallery", salonId];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getFn({ data: { salon_id: salonId } }),
  });
  const images = data?.images ?? [];
  const cover = data?.cover ?? null;

  const persist = useMutation({
    mutationFn: (vars: { images: string[]; cover: string | null }) =>
      setFn({ data: { salon_id: salonId, images: vars.images, cover: vars.cover } }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - images.length;
    const slice = Array.from(files).slice(0, remaining);
    if (!slice.length) return;
    setUploading(true);
    const next = [...images];
    let firstNewUrl: string | null = null;
    try {
      for (const file of slice) {
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} exceeds 5MB — skipped`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${salonId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("salon-media").upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) {
          toast.error(upErr.message);
          continue;
        }
        const { data: pub } = supabase.storage.from("salon-media").getPublicUrl(path);
        next.push(pub.publicUrl);
        if (!firstNewUrl) firstNewUrl = pub.publicUrl;
      }
      const nextCover = cover ?? firstNewUrl ?? null;
      await persist.mutateAsync({ images: next, cover: nextCover });
      toast.success("Photos uploaded");
    } finally {
      setUploading(false);
    }
  };

  const setCover = (url: string) => persist.mutate({ images, cover: url });

  const remove = async (url: string) => {
    const next = images.filter((u) => u !== url);
    const nextCover = cover === url ? (next[0] ?? null) : cover;
    // try to delete from storage if it's our bucket
    const prefix = "/storage/v1/object/public/salon-media/";
    const i = url.indexOf(prefix);
    if (i !== -1) {
      const path = url.slice(i + prefix.length);
      await supabase.storage.from("salon-media").remove([path]);
    }
    persist.mutate({ images: next, cover: nextCover });
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin mb-3" />
        ) : (
          <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        )}
        <p className="text-heading font-semibold">
          {uploading ? "Uploading…" : "Drag photos here or click to browse"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 5MB each</p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-heading">{images.length}</span> of {MAX_PHOTOS} photos
        </span>
        <span className="text-muted-foreground">5MB limit per photo</span>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((url) => {
            const isCover = url === cover;
            return (
              <div
                key={url}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-square">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {isCover && (
                    <Badge className="absolute left-2 top-2 bg-amber-500 text-white border-0 gap-1">
                      <Crown className="h-3 w-3" /> Cover
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(url)}
                        className="rounded-full bg-white/90 p-2 hover:bg-white"
                        aria-label="Set as cover"
                      >
                        <Crown className="h-4 w-4 text-amber-600" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(url)}
                      className="rounded-full bg-white/90 p-2 hover:bg-white"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
