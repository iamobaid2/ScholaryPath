import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireAdmin } from "@/lib/server";
import { SHOWCASE_KINDS, type ShowcaseItem, type ShowcaseKind } from "@/lib/public-types";

const str = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
// Showcase files are public uploads in this folder only; anything else is refused.
const PREFIX = "scholarlypath/showcase/";
const cloudUrl = (v: unknown) => {
  const u = str(v, 600);
  return u.startsWith("https://res.cloudinary.com/") ? u : "";
};

export function POST(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const b = await req.json().catch(() => ({}));
    const kind = b.kind as ShowcaseKind;
    if (!SHOWCASE_KINDS.some((k) => k.id === kind)) throw new HttpError(400, "Choose a category.");
    const title = str(b.title, 140);
    if (title.length < 2) throw new HttpError(400, "Add a title.");

    const imagePublicId = str(b.imagePublicId, 300);
    const filePublicId = str(b.filePublicId, 300);
    const imageUrl = imagePublicId.startsWith(PREFIX) ? cloudUrl(b.imageUrl) : "";
    const fileUrl = filePublicId.startsWith(PREFIX) ? cloudUrl(b.fileUrl) : "";
    if (!imageUrl && !fileUrl) throw new HttpError(400, "Upload an image or a PDF.");
    if (kind === "marks" && !imageUrl) throw new HttpError(400, "Marks need an image.");

    const ref = adminDb().collection("showcase").doc();
    const item: ShowcaseItem = {
      id: ref.id,
      kind,
      title,
      subject: str(b.subject, 100),
      level: str(b.level, 60),
      grade: str(b.grade, 40),
      description: str(b.description, 400),
      imageUrl,
      imagePublicId: imageUrl ? imagePublicId : "",
      fileUrl,
      filePublicId: fileUrl ? filePublicId : "",
      fileResourceType: ["image", "raw", "video"].includes(String(b.fileResourceType)) ? String(b.fileResourceType) : "image",
      createdAt: new Date().toISOString(),
    };
    await ref.set(item);
    return NextResponse.json({ item });
  });
}
