import { useRef, useState, type DragEvent } from "react";
import { Upload, Loader2, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_MB = 5;
const OUTPUT_SIZE = 512; // square output dimension in px
const COMPRESS_THRESHOLD = 1 * 1024 * 1024; // compress if > 1MB

export type ProfileImageDropzoneProps = {
  value: string;
  onFile: (file: File) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  onRetry?: () => void;
  canRetry?: boolean;
  uploading?: boolean;
  progress?: number | null;
  error?: string | null;
  disabled?: boolean;
  className?: string;
};

/** Crop the largest centered square from an image and return a compressed JPEG blob. */
async function processImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  bitmap.close?.();

  const shouldCompress = file.size > COMPRESS_THRESHOLD;
  const type = shouldCompress ? "image/jpeg" : file.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = shouldCompress ? 0.82 : 0.92;

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
  if (!blob) return file;
  const ext = type === "image/png" ? "png" : "jpg";
  return new File([blob], `avatar-${Date.now()}.${ext}`, { type });
}

export function ProfileImageDropzone({
  value,
  onFile,
  onRemove,
  onRetry,
  canRetry = false,
  uploading = false,
  progress = null,
  error: externalError = null,
  disabled,
  className,
}: ProfileImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const error = externalError ?? localError;

  const open = () => {
    if (disabled || uploading || processing) return;
    inputRef.current?.click();
  };

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type.toLowerCase())) {
      return "Unsupported file type. Please choose a JPG, PNG, or WEBP image.";
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `Image must be under ${MAX_MB} MB.`;
    }
    return null;
  };

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    const v = validate(file);
    if (v) {
      setLocalError(v);
      return;
    }
    setLocalError(null);
    setProcessing(true);
    try {
      const processed = await processImage(file);
      await onFile(processed);
    } catch (err) {
      console.error("[profile image] processing failed", err);
      setLocalError("We couldn't process that image. Please try another one.");
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading || processing) return;
    void handleFile(e.dataTransfer.files?.[0]);
  };

  const busy = uploading || processing;

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
            <img src={value} alt="Profile preview" className="h-full w-full object-cover" />
            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-black/50 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={open}
              disabled={disabled || busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-accent disabled:opacity-60"
            >
              <Upload className="h-4 w-4" /> Change Photo
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  void onRemove();
                }}
                disabled={disabled || busy}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> Remove Photo
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              open();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          aria-label="Upload profile image"
          className={cn(
            "grid w-full cursor-pointer place-items-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors",
            "bg-muted/30 hover:bg-muted",
            dragOver && "border-primary bg-primary/5",
            (disabled || busy) && "cursor-not-allowed opacity-70",
          )}
        >
          {busy ? (
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-background ring-1 ring-border">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="text-heading text-sm font-semibold">
            {processing ? "Processing image…" : "Upload Profile Image"}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">JPG, PNG, WEBP (Max {MAX_MB}MB)</div>
        </div>
      )}

      {uploading && typeof progress === "number" && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">Uploading… {Math.round(progress)}%</p>
        </div>
      )}

      {error && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-destructive flex-1 text-xs">{error}</p>
          {canRetry && onRetry && !busy && (
            <button
              type="button"
              onClick={onRetry}
              className="border-border hover:bg-accent inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
