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

export class CloudinaryUploadError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  rawResponse?: string;
  constructor(message: string, init: { status?: number; statusText?: string; code?: string; rawResponse?: string } = {}) {
    super(message);
    this.name = "CloudinaryUploadError";
    this.status = init.status;
    this.statusText = init.statusText;
    this.code = init.code;
    this.rawResponse = init.rawResponse;
  }
}


export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

export async function uploadToCloudinary(
  file: File,
  opts: { folder?: string; onProgress?: (pct: number) => void; signal?: AbortSignal } = {},
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image is too large (max 10 MB).");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  if (opts.folder) fd.append("folder", opts.folder);

  return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResult);
        } catch {
          reject(new CloudinaryUploadError("Invalid response from Cloudinary", {
            status: xhr.status,
            statusText: xhr.statusText,
            code: "INVALID_RESPONSE",
            rawResponse: xhr.responseText,
          }));
        }
      } else {
        let msg = `Upload failed (${xhr.status})`;
        let code: string | undefined;
        try {
          const j = JSON.parse(xhr.responseText) as { error?: { message?: string; http_code?: number; name?: string } };
          if (j?.error?.message) msg = j.error.message;
          if (j?.error?.name) code = j.error.name;
        } catch { /* noop */ }
        reject(new CloudinaryUploadError(msg, {
          status: xhr.status,
          statusText: xhr.statusText,
          code,
          rawResponse: xhr.responseText,
        }));
      }
    };
    xhr.onerror = () => reject(new CloudinaryUploadError("Network error during upload", { code: "NETWORK_ERROR" }));
    xhr.onabort = () => reject(new CloudinaryUploadError("Upload cancelled", { code: "ABORTED" }));
    if (opts.signal) {
      if (opts.signal.aborted) { xhr.abort(); return; }
      opts.signal.addEventListener("abort", () => xhr.abort());
    }
    xhr.send(fd);
  });
}
