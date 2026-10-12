"use client";
import { useState } from "react";
import { FileText, ImagePlus, Trash2 } from "lucide-react";
import { useAuth, useContent } from "../Providers";
import Select from "../ui/Select";
import { api } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/upload-client";
import { SHOWCASE_KINDS, type ShowcaseKind } from "@/lib/public-types";

const KIND_OPTIONS = SHOWCASE_KINDS.map((k) => ({ value: k.id, label: k.label }));
const empty = { kind: "marks" as ShowcaseKind, title: "", subject: "", level: "", grade: "", description: "" };

export default function ShowcaseTab() {
  const { token } = useAuth();
  const { showcase, refresh } = useContent();
  const [f, setF] = useState(empty);
  const [image, setImage] = useState<File | undefined>(undefined);
  const [pdf, setPdf] = useState<File | undefined>(undefined);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setOk("");
    if (f.title.trim().length < 2) return setErr("Add a title.");
    if (f.kind === "marks" && !image) return setErr("Marks need an image.");
    if (!image && !pdf) return setErr("Upload an image or a PDF.");
    try {
      const t = await token();
      const body: Record<string, unknown> = { ...f };
      if (image) {
        setBusy("Uploading image…");
        const up = await uploadToCloudinary(image, t, "showcase");
        body.imageUrl = up.url; body.imagePublicId = up.publicId;
      }
      if (pdf) {
        setBusy("Uploading PDF…");
        const up = await uploadToCloudinary(pdf, t, "showcase");
        body.fileUrl = up.url; body.filePublicId = up.publicId; body.fileResourceType = up.resourceType;
      }
      setBusy("Saving…");
      await api("/api/admin/showcase", t, { method: "POST", body: JSON.stringify(body) });
      setF({ ...empty, kind: f.kind }); setImage(undefined); setPdf(undefined);
      setOk("Added to the showcase.");
      refresh();
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "Couldn't add it."); } finally { setBusy(""); }
  }

  async function remove(id: string) {
    if (!confirm("Remove this from the showcase?")) return;
    try { await api(`/api/admin/showcase/${id}`, await token(), { method: "DELETE" }); refresh(); } catch (e2) { setErr(e2 instanceof Error ? e2.message : "Couldn't remove it."); }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={add} className="card h-fit space-y-4 p-5" noValidate>
        <h2 className="text-lg">Add to the showcase</h2>
        <div><label className="label">Category</label><Select ariaLabel="Category" value={f.kind} onChange={(v) => setF({ ...f, kind: v as ShowcaseKind })} options={KIND_OPTIONS} /></div>
        <div><label className="label" htmlFor="sc-title">Title</label><input id="sc-title" className="input !h-11 !py-0" value={f.title} onChange={set("title")} maxLength={140} placeholder={f.kind === "marks" ? "e.g. MSc Marketing – result" : "e.g. Supply chain dissertation"} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label" htmlFor="sc-sub">Subject</label><input id="sc-sub" className="input !h-11 !py-0" value={f.subject} onChange={set("subject")} /></div>
          <div><label className="label" htmlFor="sc-grade">Grade / mark</label><input id="sc-grade" className="input !h-11 !py-0" value={f.grade} onChange={set("grade")} placeholder="e.g. 82%" /></div>
        </div>
        <div><label className="label" htmlFor="sc-level">Level</label><input id="sc-level" className="input !h-11 !py-0" value={f.level} onChange={set("level")} placeholder="e.g. Master's" /></div>
        <div><label className="label" htmlFor="sc-desc">Short description</label><textarea id="sc-desc" className="input min-h-20" maxLength={400} value={f.description} onChange={set("description")} /></div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line p-3 text-sm hover:border-brand">
            <ImagePlus size={20} className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1 truncate">{image ? image.name : f.kind === "marks" ? "Add the marks image (required)" : "Add a cover image (optional)"}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { setImage(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          {f.kind !== "marks" && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line p-3 text-sm hover:border-brand">
              <FileText size={20} className="shrink-0 text-brand" />
              <span className="min-w-0 flex-1 truncate">{pdf ? pdf.name : "Add the PDF"}</span>
              <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => { setPdf(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <p className="text-xs text-muted">Up to 10 MB per file. Remove names and personal details from anything you publish.</p>
        {err && <p className="text-sm text-danger">{err}</p>}
        {ok && <p className="text-sm text-ok">{ok}</p>}
        <button className="btn btn-primary w-full" disabled={!!busy}>{busy || "Add to showcase"}</button>
      </form>

      <div>
        <h2 className="mb-4 text-lg">Published ({showcase.length})</h2>
        {!showcase.length ? (
          <div className="card p-8 text-center text-sm text-muted">Nothing here yet. What you add appears on the home page under “Work that scored well”.</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {showcase.map((s) => (
              <li key={s.id} className="card flex gap-3 p-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-2 text-muted">
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary image
                    <img src={s.imageUrl.replace("/upload/", "/upload/w_160,h_160,c_fill/")} alt="" className="h-full w-full object-cover" />
                  ) : (<FileText size={22} />)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.title}</div>
                  <div className="truncate text-xs text-muted">{SHOWCASE_KINDS.find((k) => k.id === s.kind)?.short}{s.grade ? ` · ${s.grade}` : ""}</div>
                </div>
                <button aria-label={`Remove ${s.title}`} onClick={() => void remove(s.id)} className="self-start p-1 text-muted hover:text-danger"><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

