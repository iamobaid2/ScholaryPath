"use client";

export type UploadedFile = { name: string; size: number; publicId: string; resourceType: string; url: string };

/** Uploads one file straight to Cloudinary using parameters signed by our server. */
export async function uploadToCloudinary(file: File, token: string, purpose: "order" | "showcase"): Promise<UploadedFile> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ purpose }),
  });
  const s = await signRes.json();
  if (!signRes.ok) throw new Error(s.error || "Couldn't prepare the upload.");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", s.apiKey);
  form.append("timestamp", String(s.timestamp));
  form.append("signature", s.signature);
  form.append("folder", s.folder);
  form.append("type", s.type);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/auto/upload`, { method: "POST", body: form });
  const d = await up.json();
  if (!up.ok) throw new Error(d?.error?.message || "Upload failed.");
  return { name: file.name, size: file.size, publicId: d.public_id, resourceType: d.resource_type, url: d.secure_url };
}
