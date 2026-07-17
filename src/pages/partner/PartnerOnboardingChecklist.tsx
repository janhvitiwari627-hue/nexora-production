import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ClipboardList, Image as ImageIcon, MapPin, Phone, Sparkles, Loader2, Upload, X, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getPartnerProfile, updatePartnerProfile, type PartnerProfile } from "@/lib/partner.functions";
import { uploadToCloudinary, isCloudinaryConfigured, CloudinaryUploadError } from "@/lib/cloudinary";

function friendlyUploadError(raw: string): string {
  const msg = (raw || "").trim();
  if (!msg) return "Logo upload nahi hua — dobara try karein.";
  const low = msg.toLowerCase();
  if (low.includes("network")) return "Internet issue lag raha hai — connection check karke retry karein.";
  if (low.includes("cancel") || low.includes("abort")) return "Upload cancel ho gaya — retry dabaakar dobara bhejein.";
  if (low.includes("timeout")) return "Server ne time out kar diya — thodi der me retry karein.";
  if (low.includes("too large") || low.includes("file size")) return "Image bahut badi hai — 5 MB se choti file chunein.";
  if (low.includes("invalid") && low.includes("preset")) return "Cloudinary preset galat hai — admin se contact karein.";
  if (low.includes("unauthor") || low.includes("401") || low.includes("403")) return "Upload permission nahi mila — admin se contact karein.";
  if (low.includes("500") || low.includes("502") || low.includes("503")) return "Cloudinary server down hai — kuch der baad retry karein.";
  if (low.startsWith("upload failed")) return `${msg} — retry karein.`;
  return msg;
}

type ChecklistItem = {
  key: "logo" | "contact" | "location" | "tagline" | "story";
  label: string;
  hint: string;
  icon: typeof ImageIcon;
  done: boolean;
};

function computeItems(p: PartnerProfile | null | undefined): ChecklistItem[] {
  return [
    {
      key: "logo",
      label: "Logo / Photo",
      hint: "Upload karo taaki shop owners aapko pehchan sakein",
      icon: ImageIcon,
      done: !!p?.photo_url,
    },
    {
      key: "contact",
      label: "Contact details",
      hint: "Mobile aur email verify karo",
      icon: Phone,
      done: !!(p?.mobile && p?.email),
    },
    {
      key: "location",
      label: "Location",
      hint: "District, state aur pincode",
      icon: MapPin,
      done: !!(p?.district && p?.state && p?.pincode),
    },
    {
      key: "tagline",
      label: "Tagline",
      hint: "Ek line jo aapko describe kare",
      icon: Sparkles,
      done: !!(p?.tagline && p.tagline.trim().length >= 6),
    },
    {
      key: "story",
      label: "Success story",
      hint: "Aapki journey — shops ko motivate karegi",
      icon: ClipboardList,
      done: !!(p?.success_story && p.success_story.trim().length >= 20),
    },
  ];
}

export function PartnerOnboardingChecklist() {
  const fetchProfile = useServerFn(getPartnerProfile);
  const saveProfile = useServerFn(updatePartnerProfile);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["partner", "profile"],
    queryFn: () => fetchProfile({}),
    staleTime: 30_000,
  });

  const items = useMemo(() => computeItems(profile), [profile]);
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    photo_url: "",
    mobile: "",
    email: "",
    state: "",
    pincode: "",
    tagline: "",
    success_story: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorDetails, setUploadErrorDetails] = useState<{
    status?: number;
    statusText?: string;
    code?: string;
    raw: string;
  } | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  // Screen-reader announcements for upload lifecycle (progress milestones + final result)
  const [srStatus, setSrStatus] = useState("");
  const [srAlert, setSrAlert] = useState("");
  const lastAnnouncedMilestoneRef = useRef<number>(-1);
  const announceStatus = (msg: string) => setSrStatus(msg);
  const announceAlert = (msg: string) => setSrAlert(msg);
  const cloudinaryReady = isCloudinaryConfigured();

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const lastFileRef = useRef<File | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const cancelHadFocusRef = useRef(false);
  const wasUploadingRef = useRef(false);

  // When the upload finishes (success, error, or cancel), restore focus to the
  // dropzone so its describedby hint is announced and keyboard users don't lose
  // their place. We only steal focus if it currently sits inside our upload
  // region (dropzone, cancel button that just unmounted, or document.body after
  // that unmount) — mouse users who moved on elsewhere are not disturbed.
  useEffect(() => {
    if (wasUploadingRef.current && !uploading) {
      const shouldRestore = (() => {
        if (cancelHadFocusRef.current) return true;
        const active = typeof document !== "undefined" ? document.activeElement : null;
        if (!active || active === document.body) return true;
        const dz = dropzoneRef.current;
        if (dz && (active === dz || dz.contains(active))) return true;
        return false;
      })();
      cancelHadFocusRef.current = false;
      if (shouldRestore) {
        // Defer past the unmount of the Cancel button / progress region
        requestAnimationFrame(() => dropzoneRef.current?.focus());
      }
    }
    wasUploadingRef.current = uploading;
  }, [uploading]);


  const cancelUpload = () => {
    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
      uploadAbortRef.current = null;
    }
  };

  const doUpload = async (file: File, keepPreview?: string) => {
    // Cancel any previous in-flight upload before starting a new one
    if (uploadAbortRef.current) uploadAbortRef.current.abort();
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    lastAnnouncedMilestoneRef.current = -1;
    setSrAlert("");
    // File X of Y context — single-file flow today, but keep the phrasing so
    // screen-reader users hear a consistent "file 1 of 1" summary that scales
    // when batch uploads land.
    const fileIndex = 1;
    const fileTotal = 1;
    const batchLabel = `file ${fileIndex} of ${fileTotal}`;
    announceStatus(
      `Uploading ${batchLabel}: ${file.name}. 0 percent complete.`,
    );
    try {
      const res = await uploadToCloudinary(file, {
        folder: "partner-logos",
        onProgress: (pct) => {
          setUploadProgress(pct);
          // Announce at 25/50/75 milestones to avoid flooding the screen reader
          const milestone = pct >= 75 ? 75 : pct >= 50 ? 50 : pct >= 25 ? 25 : 0;
          if (milestone > lastAnnouncedMilestoneRef.current && milestone > 0 && pct < 100) {
            lastAnnouncedMilestoneRef.current = milestone;
            announceStatus(
              `Uploading ${batchLabel} (${file.name}): ${milestone} percent complete.`,
            );
          }
          if (pct >= 100 && lastAnnouncedMilestoneRef.current < 100) {
            lastAnnouncedMilestoneRef.current = 100;
            announceStatus(
              `${batchLabel} (${file.name}) transfer complete. Cloudinary is processing the image.`,
            );
          }
        },
        signal: controller.signal,
      });

      setForm((f) => ({ ...f, photo_url: res.secure_url }));
      setUploadError(null);
      lastFileRef.current = null;
      setUploadProgress(100);
      const sizeKb = Math.max(1, Math.round(file.size / 1024));
      announceStatus(
        `Success: ${file.name} (${sizeKb} KB) uploaded to Cloudinary. Logo preview updated. Save karke pakka karo.`,
      );
      // Final summary in the assertive region so screen readers get a clear
      // end-of-batch message even when the upload finishes automatically.
      announceAlert(`Upload complete. 1 of 1 file uploaded successfully: ${file.name}.`);
      toast.success("Logo uploaded — save karke pakka karo");

    } catch (err) {
      const isAbort =
        (err instanceof CloudinaryUploadError && err.code === "ABORTED") ||
        controller.signal.aborted;
      if (isAbort) {
        setUploadError("Upload cancel ho gaya");
        setUploadErrorDetails({ code: "ABORTED", raw: "User cancelled upload" });
        announceStatus(`Upload cancelled for ${file.name}. Retry button available.`);
        toast.info("Upload cancel");
        lastFileRef.current = file;
        if (!keepPreview && localPreview) {
          URL.revokeObjectURL(localPreview);
          setLocalPreview(null);
        }
        return;
      }
      const raw = err instanceof Error ? err.message : String(err);
      const friendly = friendlyUploadError(raw);
      setUploadError(friendly);
      if (err instanceof CloudinaryUploadError) {
        setUploadErrorDetails({
          status: err.status,
          statusText: err.statusText,
          code: err.code,
          raw: err.rawResponse || err.message,
        });
      } else {
        setUploadErrorDetails({ raw });
      }
      const statusPart =
        err instanceof CloudinaryUploadError && err.status
          ? ` Status ${err.status}${err.statusText ? ` ${err.statusText}` : ""}.`
          : "";
      // Combined per-file + end-of-batch summary in one assertive announcement
      // (two setState calls in the same tick would collapse to the last one).
      announceAlert(
        `All uploads failed. 1 of 1 file failed: ${file.name}.${statusPart} Reason: ${friendly}. Retry button available.`,
      );


      toast.error(friendly);
      lastFileRef.current = file;
      if (!keepPreview && localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }
    } finally {
      if (uploadAbortRef.current === controller) uploadAbortRef.current = null;
      setUploading(false);
    }
  };


  const MIN_DIM = 200;
  const MAX_DIM = 4000;
  const MIN_BYTES = 2 * 1024; // 2 KB — catches empty/corrupt files

  const readImageDimensions = (objectUrl: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Image file corrupt lag rahi hai — dobara chunein"));
      img.src = objectUrl;
    });

  const failFast = (msg: string, keepPreview = false) => {
    setUploadError(msg);
    setUploadErrorDetails({ code: "CLIENT_VALIDATION", raw: msg });
    toast.error(msg);
    if (!keepPreview && localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  };

  const validateAndUpload = async (file: File) => {
    setUploadError(null);
    setUploadErrorDetails(null);

    // MIME type — trust file.type but also require image/*
    if (!file.type || !file.type.startsWith("image/")) {
      failFast("Sirf image files allowed hain (JPG, PNG, WEBP, GIF)");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      failFast(`"${file.type}" allowed nahi hai — JPG, PNG, WEBP ya GIF chunein`);
      return;
    }
    // Size
    if (file.size < MIN_BYTES) {
      failFast("File bahut choti/khali hai — dobara chunein");
      return;
    }
    if (file.size > MAX_BYTES) {
      failFast(`File 5 MB se choti honi chahiye (abhi ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    if (!cloudinaryReady) {
      failFast("Cloudinary configure nahi hai — admin se contact karein");
      return;
    }

    // Instant local preview while dimensions load / upload runs
    if (localPreview) URL.revokeObjectURL(localPreview);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    // Dimension validation (skip animated GIFs — first frame is enough)
    try {
      const { width, height } = await readImageDimensions(objectUrl);
      if (width < MIN_DIM || height < MIN_DIM) {
        failFast(`Image chhoti hai (${width}×${height}px) — kam se kam ${MIN_DIM}×${MIN_DIM}px chahiye`, true);
        return;
      }
      if (width > MAX_DIM || height > MAX_DIM) {
        failFast(`Image bahut badi hai (${width}×${height}px) — max ${MAX_DIM}×${MAX_DIM}px`, true);
        return;
      }
      const ratio = Math.max(width, height) / Math.min(width, height);
      if (ratio > 4) {
        failFast(`Aspect ratio bahut extreme hai (${width}×${height}) — square-ish logo behtar rahega`, true);
        return;
      }
    } catch (err) {
      failFast(err instanceof Error ? err.message : "Image read nahi ho payi");
      return;
    }

    await doUpload(file, objectUrl);
  };

  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    await validateAndUpload(file);
  };

  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length === 0) return;
    if (files.length > 1) {
      toast.info("Ek time par ek hi logo — pehli file use kar rahe hain");
    }
    await validateAndUpload(files[0]);
  };



  const onRetryUpload = async () => {
    const file = lastFileRef.current;
    if (!file) {
      fileInputRef.current?.click();
      return;
    }
    setUploadError(null);
    await doUpload(file, localPreview ?? undefined);
  };


  useEffect(() => {
    if (!profile) return;
    setForm({
      photo_url: profile.photo_url ?? "",
      mobile: profile.mobile ?? "",
      email: profile.email ?? "",
      state: profile.state ?? "",
      pincode: profile.pincode ?? "",
      tagline: profile.tagline ?? "",
      success_story: profile.success_story ?? "",
    });
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data: typeof form) => saveProfile({ data }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Update failed"),
  });

  if (isLoading || !profile) return null;
  const allDone = doneCount === items.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 overflow-hidden rounded-2xl border p-6 ${
          allDone
            ? "border-[#16A34A]/30 bg-gradient-to-br from-[#DCFCE7] to-white"
            : "border-[#4F46E5]/20 bg-gradient-to-br from-[#EEF2FF] to-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${allDone ? "bg-[#16A34A] text-white" : "bg-[#4F46E5] text-white"}`}>
              {allDone ? <CheckCircle2 className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1330]">
                {allDone ? "Onboarding complete 🎉" : "Complete your onboarding"}
              </h3>
              <p className="text-xs text-slate-500">
                {allDone
                  ? "Aapka partner profile fully setup hai."
                  : `${doneCount} of ${items.length} steps done — profile 100% karo aur trust badhao.`}
              </p>
            </div>
          </div>
          {!allDone && (
            <Button size="sm" onClick={() => setOpen(true)} className="bg-[#0B1330] hover:bg-[#0B1330]/90">
              Complete now
            </Button>
          )}
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`h-full rounded-full ${allDone ? "bg-[#16A34A]" : "bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"}`}
          />
        </div>
        <div className="mt-1 text-right text-[11px] font-bold text-slate-500">{pct}%</div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                onClick={() => setOpen(true)}
                className={`text-left rounded-xl border p-3 transition ${
                  it.done
                    ? "border-[#16A34A]/30 bg-white/80"
                    : "border-slate-200 bg-white hover:border-[#4F46E5]/40 hover:bg-[#EEF2FF]/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  {it.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                  <Icon className={`h-3.5 w-3.5 ${it.done ? "text-[#16A34A]" : "text-[#4F46E5]"}`} />
                  <span className="text-xs font-bold text-[#0B1330]">{it.label}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{it.hint}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete partner profile</DialogTitle>
            <DialogDescription>Ye details shop owners aur admin ko dikhengi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field
              label="Logo / Photo"
              hint={cloudinaryReady ? "JPG, PNG, WEBP ya GIF — max 5 MB" : "Cloudinary configure nahi hai — URL paste karein"}
            >
              <div
                ref={dropzoneRef}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => {
                  if (!uploading && cloudinaryReady) {
                    fileInputRef.current?.click();
                  }
                }}
                onKeyDown={(e) => {
                  if (uploading || !cloudinaryReady) return;
                  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={uploading ? -1 : 0}
                aria-label={
                  form.photo_url || localPreview
                    ? "Replace logo. Press Enter or Space to browse files, or drag and drop an image here."
                    : "Upload logo. Press Enter or Space to browse files, or drag and drop an image here."
                }
                aria-disabled={uploading || !cloudinaryReady}
                aria-busy={uploading}
                aria-describedby="logo-dropzone-hint"
                className={`flex items-start gap-3 rounded-xl border-2 border-dashed p-3 transition outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 ${
                  isDragging
                    ? "border-[#4F46E5] bg-[#EEF2FF]"
                    : uploading
                      ? "border-slate-200 bg-slate-50/50 cursor-not-allowed"
                      : "border-slate-200 bg-slate-50/40 hover:border-[#4F46E5]/50 hover:bg-[#EEF2FF]/30 cursor-pointer"
                }`}
              >


                {(localPreview || form.photo_url) ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={localPreview ?? form.photo_url}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span className="text-[10px] font-bold text-white">{uploadProgress}%</span>
                      </div>
                    )}
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, photo_url: "" });
                          if (localPreview) URL.revokeObjectURL(localPreview);
                          setLocalPreview(null);
                          setUploadError(null);
                        }}
                        className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl bg-black/60 text-white"
                        aria-label="Remove logo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !cloudinaryReady}
                    aria-busy={uploading}
                  >
                    {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                    {uploading
                      ? `Uploading… ${uploadProgress}%`
                      : form.photo_url
                        ? "Replace logo"
                        : "Upload logo"}
                  </Button>
                  <p id="logo-dropzone-hint" className="text-[10px] text-slate-500" aria-live="polite">
                    {isDragging
                      ? "Release to upload"
                      : "Drag & drop image here, Enter/Space press karein, ya button click karein"}
                  </p>

                  {/* Screen-reader only live regions for upload lifecycle */}
                  <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                  >
                    {srStatus}
                  </div>
                  <div
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    className="sr-only"
                  >
                    {srAlert}
                  </div>



                  {uploading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
                          role="progressbar"
                          aria-valuenow={uploadProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuetext={
                            uploadProgress >= 100
                              ? "Upload complete, processing on Cloudinary"
                              : `Uploading to Cloudinary, ${uploadProgress}% complete`
                          }
                          aria-label="Cloudinary upload progress"
                          aria-live="polite"
                          aria-busy={uploadProgress < 100}
                        >
                          <div
                            className={`h-full bg-[#4F46E5] transition-[width] duration-200 ease-out ${
                              uploadProgress >= 100 ? "animate-pulse" : ""
                            }`}
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span
                          className="min-w-[3ch] text-right text-[11px] font-bold tabular-nums text-slate-600"
                          aria-hidden="true"
                        >
                          {uploadProgress}%
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelUpload}
                          onFocus={() => {
                            cancelHadFocusRef.current = true;
                          }}
                          className="h-7 border-red-200 px-2 text-[11px] text-red-600 hover:bg-red-50"
                          aria-label="Cancel upload"
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {uploadProgress >= 100
                          ? "Cloudinary process kar raha hai…"
                          : "Uploading to Cloudinary…"}
                      </p>
                    </div>
                  )}

                  <Input
                    placeholder="https://..."
                    value={form.photo_url}
                    disabled={uploading}
                    onChange={(e) => {
                      setForm({ ...form, photo_url: e.target.value });
                      setUploadError(null);
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={onPickLogo}
                  />
                  {uploadError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="flex-1 text-[11px] font-medium text-red-600">{uploadError}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onRetryUpload}
                          disabled={uploading}
                          className="h-7 border-red-300 px-2 text-[11px] text-red-700 hover:bg-red-100"
                        >
                          {uploading ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1 h-3 w-3" />
                          )}
                          {uploading
                            ? `Retrying… ${uploadProgress}%`
                            : lastFileRef.current
                              ? "Retry upload"
                              : "Choose file"}
                        </Button>
                      </div>
                      {uploadErrorDetails && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => setShowErrorDetails((v) => !v)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-red-700 hover:underline"
                            aria-expanded={showErrorDetails}
                          >
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${showErrorDetails ? "rotate-180" : ""}`}
                            />
                            {showErrorDetails ? "Hide details" : "Details"}
                          </button>
                          {showErrorDetails && (
                            <div className="mt-1 space-y-0.5 rounded border border-red-200 bg-white/60 p-1.5 text-[10px] font-mono text-red-800">
                              {typeof uploadErrorDetails.status === "number" && (
                                <div>
                                  <span className="opacity-60">HTTP:</span> {uploadErrorDetails.status}
                                  {uploadErrorDetails.statusText ? ` ${uploadErrorDetails.statusText}` : ""}
                                </div>
                              )}
                              {uploadErrorDetails.code && (
                                <div>
                                  <span className="opacity-60">Code:</span> {uploadErrorDetails.code}
                                </div>
                              )}
                              {uploadErrorDetails.raw && (
                                <div className="max-h-24 overflow-auto whitespace-pre-wrap break-all">
                                  <span className="opacity-60">Raw:</span> {uploadErrorDetails.raw.slice(0, 500)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mobile">
                <Input
                  placeholder="+91 98765 43210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <Input
                  placeholder="Rajasthan"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </Field>
              <Field label="Pincode">
                <Input
                  placeholder="302001"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Tagline" hint="Max 140 characters">
              <Input
                maxLength={140}
                placeholder="Helping salons grow in my district"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </Field>
            <Field label="Success story" hint="Aapki journey (min 20 characters)">
              <Textarea
                rows={4}
                maxLength={2000}
                placeholder="Maine apne district me..."
                value={form.success_story}
                onChange={(e) => setForm({ ...form, success_story: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="bg-[#0B1330] hover:bg-[#0B1330]/90"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-[#0B1330]">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
