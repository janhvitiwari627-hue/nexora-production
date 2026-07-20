import { toast } from "sonner";
import { Share2 } from "lucide-react";

export function ShareButton({
  title,
  text,
  url,
  label = "Share",
  className,
}: {
  title: string;
  text?: string;
  url?: string;
  label?: string;
  className?: string;
}) {
  const handleShare = async () => {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${title}\n${shareUrl}`);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };
  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${title}`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white/80 px-3 py-1 text-xs font-medium backdrop-blur transition hover:bg-white ${className ?? ""}`}
    >
      <Share2 className="h-3 w-3" />
      {label}
    </button>
  );
}
