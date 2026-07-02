import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileImageUploadProps = {
  /** Current image URL (signed URL, blob URL, or data URL). */
  value: string;
  /** Called with a picked File so the parent can upload it. */
  onFile: (file: File) => void | Promise<void>;
  /** Called when the user clicks Remove. */
  onRemove?: () => void | Promise<void>;
  /** Fallback text shown when no image is set (e.g. initials). */
  fallback?: string;
  /** Show the loader overlay. */
  uploading?: boolean;
  /** Max file size in MB. Defaults to 5. */
  maxSizeMB?: number;
  /** Accept string for the underlying <input type="file">. Defaults to image/*. */
  accept?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Reusable profile image upload widget:
 *  - Click or drag-and-drop to upload
 *  - Live preview with initials fallback
 *  - Remove button to clear the current image
 *  - Client-side size + type validation before calling onFile
 */
export function ProfileImageUpload({
  value,
  onFile,
  onRemove,
  fallback,
  uploading = false,
  maxSizeMB = 5,
  accept = "image/*",
  className,
  disabled,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const validateAndSend = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB} MB`);
      return;
    }
    setError(null);
    void onFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSend(e.target.files?.[0]);
    // reset so selecting the same file again re-triggers change
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    validateAndSend(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <button
        type="button"
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        aria-label="Upload profile image"
        className={cn(
          "group relative grid h-24 w-24 place-items-center overflow-hidden rounded-full ring-2 transition-all",
          "bg-muted ring-border",
          dragOver && "ring-primary ring-4",
          !disabled && "hover:ring-primary/60 cursor-pointer",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Profile" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ImagePlus className="h-6 w-6" />
            </span>
          </>
        ) : fallback ? (
          <span className="text-heading text-2xl font-black">{fallback}</span>
        ) : (
          <ImagePlus className="text-muted-foreground h-7 w-7" />
        )}
        {uploading && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </span>
        )}
      </button>

      <div className="flex-1">
        <p className="text-heading text-sm font-bold">Profile photo</p>
        <p className="text-muted-foreground text-xs">
          Drag &amp; drop or click to upload. JPG or PNG, max {maxSizeMB} MB.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled || uploading}
            className="border-border hover:bg-accent inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </button>
          {value && onRemove && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                void onRemove();
              }}
              disabled={disabled || uploading}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
        {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
