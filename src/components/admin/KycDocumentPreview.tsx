import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  MoveHorizontal,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type Props = {
  kycPath: string | null | undefined;
  applicantName: string;
  variant?: "thumb" | "inline";
};

const BUCKET = "partner-kyc";
const SIGNED_TTL = 60 * 10;

function isPdf(path: string) {
  return /\.pdf($|\?)/i.test(path);
}
function isImage(path: string) {
  return /\.(png|jpe?g|webp|gif|avif)($|\?)/i.test(path);
}

// Lazy PDF.js loader (worker configured once)
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url" as string)) as { default: string };
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
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
          <img src={url} alt={`KYC preview for ${applicantName}`} className="h-full w-full object-cover" loading="lazy" />
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
          <img src={url} alt={`KYC document for ${applicantName}`} className="max-h-48 w-full rounded object-contain" />
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
        <DialogContent className="max-w-6xl p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="truncate text-base">KYC · {applicantName}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[85vh] min-h-[60vh]">
            {loading && (
              <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && <div className="p-6 text-sm text-red-600">{error}</div>}
            {!loading && !error && url && pdf && (
              <PdfViewer url={url} applicantName={applicantName} downloadUrl={url} />
            )}
            {!loading && !error && url && img && (
              <ImageViewer
                url={url}
                applicantName={applicantName}
                zoom={zoom}
                rotate={rotate}
                setZoom={setZoom}
                setRotate={setRotate}
              />
            )}
            {!loading && !error && url && !img && !pdf && (
              <div className="p-6 text-sm">
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

/* -------- Image viewer -------- */
function ImageViewer({
  url,
  applicantName,
  zoom,
  rotate,
  setZoom,
  setRotate,
}: {
  url: string;
  applicantName: string;
  zoom: number;
  rotate: number;
  setZoom: (fn: (z: number) => number) => void;
  setRotate: (fn: (r: number) => number) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-end gap-1 border-b bg-muted/40 px-3 py-2">
        <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => setRotate((r) => (r + 90) % 360)} aria-label="Rotate 90°">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" asChild aria-label="Download">
          <a href={url} target="_blank" rel="noreferrer" download>
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <div className="flex max-h-[75vh] items-center justify-center overflow-auto bg-slate-900/95 p-4">
        <img
          src={url}
          alt={`KYC document for ${applicantName}`}
          style={{ transform: `scale(${zoom}) rotate(${rotate}deg)`, transformOrigin: "center center", transition: "transform 120ms ease" }}
          className="max-h-none select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}

/* -------- PDF viewer with thumbnails, page nav, rotate, fit-to-width -------- */
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<any> };

function PdfViewer({ url, applicantName, downloadUrl }: { url: string; applicantName: string; downloadUrl: string }) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadErr(null);
    setDoc(null);
    setPage(1);
    loadPdfjs()
      .then((pdfjs) => pdfjs.getDocument({ url }).promise)
      .then((d) => {
        if (!cancelled) setDoc(d as unknown as PdfDoc);
      })
      .catch((e) => !cancelled && setLoadErr(e?.message ?? "Failed to load PDF"));
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Render current page
  useEffect(() => {
    if (!doc || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const p = await doc.getPage(page);
      const containerW = containerRef.current?.clientWidth ?? 800;
      const baseViewport = p.getViewport({ scale: 1, rotation: rotate });
      const scale = fitWidth ? (containerW - 32) / baseViewport.width : zoom;
      const viewport = p.getViewport({ scale, rotation: rotate });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
      const task = p.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, page, rotate, zoom, fitWidth]);

  const numPages = doc?.numPages ?? 0;
  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  return (
    <div className="flex h-[80vh] flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-3 py-2">
        <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div
          className="inline-flex min-w-[6rem] items-center justify-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold tabular-nums text-primary"
          aria-live="polite"
          aria-atomic="true"
        >
          Page <span className="text-sm">{page}</span>
          <span className="text-primary/60">/ {numPages || "…"}</span>
        </div>
        <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="mx-2 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant={fitWidth ? "default" : "outline"}
          onClick={() => setFitWidth((v) => !v)}
          aria-pressed={fitWidth}
        >
          <MoveHorizontal className="mr-1 h-4 w-4" /> Fit width
        </Button>
        <Button size="icon" variant="outline" onClick={() => { setFitWidth(false); setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2))); }} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-muted-foreground">{fitWidth ? "Fit" : `${Math.round(zoom * 100)}%`}</span>
        <Button size="icon" variant="outline" onClick={() => { setFitWidth(false); setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2))); }} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => setRotate((r) => (r + 90) % 360)} aria-label="Rotate 90°">
          <RotateCw className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button size="icon" variant="outline" asChild aria-label="Download">
            <a href={downloadUrl} target="_blank" rel="noreferrer" download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Body: thumbnails + page */}
      <div className="flex min-h-0 flex-1">
        {/* Thumbnails */}
        <aside className="hidden w-40 shrink-0 overflow-y-auto border-r bg-muted/20 p-2 md:block">
          {loadErr && <div className="p-2 text-xs text-red-600">{loadErr}</div>}
          {!doc && !loadErr && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <ul className="space-y-2">
            {pages.map((n) => (
              <li key={n}>
                <ThumbButton
                  active={n === page}
                  onSelect={() => setPage(n)}
                  ariaLabel={`Go to page ${n}${n === page ? " (current)" : ""}`}
                >
                  <div className="relative">
                    <PdfThumb doc={doc} pageNumber={n} />
                    {n === page && (
                      <span className="pointer-events-none absolute right-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow">
                        Current
                      </span>
                    )}
                  </div>
                  <span
                    className={`block py-1 text-center text-[10px] font-medium ${
                      n === page ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Page {n}
                  </span>
                </ThumbButton>
              </li>
            ))}
          </ul>
        </aside>

        {/* Page canvas */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-slate-900/95 p-4">
          {loadErr ? (
            <div className="text-sm text-red-200">{loadErr}</div>
          ) : !doc ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white/80" />
            </div>
          ) : (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                aria-label={`KYC document for ${applicantName}, page ${page}`}
                className="rounded bg-white shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThumbButton({
  active,
  onSelect,
  ariaLabel,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [active]);
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={`block w-full overflow-hidden rounded border bg-white transition hover:border-primary ${
        active ? "border-primary ring-2 ring-primary shadow-md" : "border-border"
      }`}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </button>
  );
}

function PdfThumb({ doc, pageNumber }: { doc: PdfDoc | null; pageNumber: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!doc || !ref.current) return;
    let cancelled = false;
    (async () => {
      const p = await doc.getPage(pageNumber);
      const base = p.getViewport({ scale: 1 });
      const scale = 130 / base.width;
      const vp = p.getViewport({ scale });
      const canvas = ref.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;
      canvas.width = vp.width;
      canvas.height = vp.height;
      try {
        await p.render({ canvasContext: ctx, viewport: vp }).promise;
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber]);
  return <canvas ref={ref} className="block h-auto w-full" />;
}
