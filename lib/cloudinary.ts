import "server-only";
import { v2 as cloudinary } from "cloudinary";

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function init() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/**
 * Parameters for a browser → Cloudinary upload, signed here so the secret never leaves the server.
 * The browser must send exactly `folder`, `type`, `timestamp`, `api_key` and `signature` with the file.
 *  - client documents are uploaded as `authenticated` (not publicly reachable; only signed URLs work)
 *  - showcase items are plain public uploads
 */
export function signUpload(folder: string, type: "authenticated" | "upload") {
  const c = init();
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = { folder, timestamp, type };
  const signature = c.utils.api_sign_request(toSign, process.env.CLOUDINARY_API_SECRET!);
  return { cloudName: process.env.CLOUDINARY_CLOUD_NAME!, apiKey: process.env.CLOUDINARY_API_KEY!, timestamp, signature, folder, type };
}

/** A time-limited link to a private (authenticated) asset, for the admin to open. */
export function privateUrl(publicId: string, resourceType: string) {
  const c = init();
  return c.url(publicId, { type: "authenticated", resource_type: resourceType as "image" | "raw" | "video", sign_url: true, secure: true });
}

export async function deleteAsset(publicId: string, resourceType: string, type: "authenticated" | "upload") {
  const c = init();
  try {
    await c.uploader.destroy(publicId, { resource_type: resourceType as "image" | "raw" | "video", type });
  } catch (e) {
    console.error("Cloudinary delete failed", e);
  }
}
