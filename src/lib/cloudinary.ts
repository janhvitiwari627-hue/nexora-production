// Cloudinary unsigned client-side upload.
// Requires two publishable build-time env vars:
//   VITE_CLOUDINARY_CLOUD_NAME    e.g. "nexora"
//   VITE_CLOUDINARY_UPLOAD_PRESET an UNSIGNED preset configured in Cloudinary
//
// Cloud name + unsigned preset are safe to expose client-side. The preset
// itself controls what's allowed (folder, transformations, file size, etc.).

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

export async function uploadToCloudinary(
  file: File,
  opts: { folder?: string } = {},
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  // 10 MB client-side cap (mirrors a sensible Cloudinary preset).
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image is too large (max 10 MB).");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  if (opts.folder) fd.append("folder", opts.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd },
  );
  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (j?.error?.message) msg = j.error.message;
    } catch { /* noop */ }
    throw new Error(msg);
  }
  return (await res.json()) as CloudinaryUploadResult;
}
