import { useRef, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { StarPicker } from "./StarPicker";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  initialRating?: number;
  initialText?: string;
  initialPhotos?: string[];
  onSubmit: (data: { rating: number; text: string; photos: string[] }) => void;
}

export function ReviewModal({
  open,
  onClose,
  title,
  initialRating = 0,
  initialText = "",
  initialPhotos = [],
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - photos.length;
    const additions = Array.from(files)
      .slice(0, remaining)
      .map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...additions]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  };

  const disabled = rating === 0 || text.trim().length < 10;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your rating
            </p>
            <div className="mt-2">
              <StarPicker value={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your review
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              rows={5}
              placeholder="Share details about your visit — what stood out, what could improve…"
              className="mt-2 w-full resize-none rounded-2xl border bg-background p-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">{text.length}/1000</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Add photos ({photos.length}/5)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="group relative h-16 w-16 overflow-hidden rounded-xl border"
                >
                  <img src={p} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="grid h-16 w-16 place-items-center rounded-xl border border-dashed text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-card"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSubmit({ rating, text: text.trim(), photos })}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            Submit Review
          </button>
        </footer>
      </div>
    </div>
  );
}
