import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "portal-media";
const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

async function upload(file: File, userId: string, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
  if (error || !data) throw error ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export function SingleFileUpload({
  label,
  value,
  onChange,
  userId,
  folder,
  accept = "image/*",
  preview = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  userId: string | undefined;
  folder: string;
  accept?: string;
  preview?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    setBusy(true);
    try {
      const url = await upload(f, userId, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      <div className="flex items-center gap-3">
        {preview && value ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border/60 bg-muted">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl bg-black/60 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => ref.current?.click()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1 h-4 w-4" />
          )}
          {value ? "Replace" : "Upload"}
        </Button>
        <input ref={ref} type="file" className="hidden" accept={accept} onChange={onPick} />
      </div>
    </div>
  );
}

export function MultiFileUpload({
  label,
  values,
  onChange,
  userId,
  folder,
  accept = "image/*,application/pdf",
  max = 10,
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  userId: string | undefined;
  folder: string;
  accept?: string;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }
    if (values.length + files.length > max) {
      toast.error(`Max ${max} files`);
      return;
    }
    setBusy(true);
    try {
      const next = [...values];
      for (const f of files) {
        if (f.size > 10 * 1024 * 1024) {
          toast.error(`${f.name} > 10 MB`);
          continue;
        }
        next.push(await upload(f, userId, folder));
      }
      onChange(next);
      toast.success("Uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {values.map((u, i) => {
          const isImg = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(u);
          return (
            <div
              key={i}
              className="relative h-16 w-16 overflow-hidden rounded-lg border border-border/60 bg-muted"
            >
              {isImg ? (
                <img src={u} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <FileText className="h-6 w-6" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl bg-black/60 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-border/60 text-muted-foreground hover:bg-muted"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
        </button>
        <input
          ref={ref}
          type="file"
          multiple
          className="hidden"
          accept={accept}
          onChange={onPick}
        />
      </div>
    </div>
  );
}
