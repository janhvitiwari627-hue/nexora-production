import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Image as ImageIcon, Loader2, Maximize2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  kycPath: string | null | undefined;
  applicantName: string;
  /** thumbnail | inline (larger, in dialog) */
  variant?: "thumb" | "inline";
};

const BUCKET = "partner-kyc";
const SIGNED_TTL = 60 * 10; // 10 minutes

function isPdf(path: string) {
  return /\.pdf($|\?)/i.test(path);
}
function isImage(path: string) {
  return /\.(png|jpe?g|webp|gif|avif)($|\?)/i.test(path);
}

export function KycDocumentPreview({ kycPath, applicantName, variant = "thumb" }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!kycPath) {
      setUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(kycPath, SIGNED_TTL)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setError(error?.message ?? "Could not generate preview link.");
          setUrl(null);
        } else {
          setUrl(data.signedUrl);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kycPath]);

  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotate(0);
    }
  }, [open]);

  if (!kycPath) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> No KYC
      </span>
    );
  }

  const pdf = isPdf(kycPath);
  const img = isImage(kycPath);

  const trigger =
    variant === "thumb" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted/40 transition hover:border-primary hover:shadow-sm"
        aria-label={`Preview KYC document for ${applicantName}`}
        title="Click to preview & zoom"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : error ? (
          <FileText className="h-4 w-4 text-red-500" />
        ) : img && url ? (
          <img
            src={url}
            alt={`KYC preview for ${applicantName}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : pdf ? (
          <FileText className="h-5 w-5 text-primary" />
        ) : (
          <ImageIcon className="h-5 w-5 text-primary" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="h-4 w-4 text-white" />
        </span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col items-center gap-2 rounded-lg border bg-muted/30 p-3 transition hover:border-primary hover:bg-muted/50"
        aria-label={`Open KYC document for ${applicantName}`}
      >
        {loading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex h-40 w-full flex-col items-center justify-center gap-1 text-xs text-red-600">
            <FileText className="h-6 w-6" />
            {error}
          </div>
        ) : img && url ? (
          <img
            src={url}
            alt={`KYC document for ${applicantName}`}
            className="max-h-48 w-full rounded object-contain"
          />
        ) : (
          <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-primary">
            <FileText className="h-8 w-8" />
            <span className="text-xs font-medium">PDF document</span>
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Maximize2 className="h-3.5 w-3.5" /> Click to zoom
        </span>
      </button>
    );

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
            <DialogTitle className="truncate text-base">KYC · {applicantName}</DialogTitle>
            <div className="flex items-center gap-1">
              {img && (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                    aria-label="Zoom out"
                    disabled={zoom <= 0.25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))}
                    aria-label="Zoom in"
                    disabled={zoom >= 5}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setRotate((r) => (r + 90) % 360)}
                    aria-label="Rotate 90°"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              {url && (
                <Button size="icon" variant="outline" asChild aria-label="Download / open in new tab">
                  <a href={url} target="_blank" rel="noreferrer" download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="relative flex max-h-[80vh] min-h-[60vh] items-center justify-center overflow-auto bg-slate-900/95 p-4">
            {loading && <Loader2 className="h-8 w-8 animate-spin text-white/80" />}
            {error && <div className="text-sm text-red-200">{error}</div>}
            {!loading && !error && url && img && (
              <img
                src={url}
                alt={`KYC document for ${applicantName}`}
                style={{
                  transform: `scale(${zoom}) rotate(${rotate}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 120ms ease",
                }}
                className="max-h-none select-none"
                draggable={false}
              />
            )}
            {!loading && !error && url && pdf && (
              <iframe
                src={`${url}#view=FitH`}
                title={`KYC document for ${applicantName}`}
                className="h-[75vh] w-full rounded bg-white"
              />
            )}
            {!loading && !error && url && !img && !pdf && (
              <div className="text-sm text-white/80">
                Preview not supported —{" "}
                <a className="underline" href={url} target="_blank" rel="noreferrer">
                  open in new tab
                </a>
                .
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
