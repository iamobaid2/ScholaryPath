"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { FileText, ImagePlus, Paperclip, X } from "lucide-react";

const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

type Props = {
  label: string;
  hint: string;
  files: File[];
  onChange: (files: File[]) => void;
  /** Image-only mode: restricts the picker and shows thumbnails instead of a file list. */
  images?: boolean;
  max?: number;
  maxMb?: number;
};

export default function FileDropzone({ label, hint, files, onChange, images = false, max = 10, maxMb = 10 }: Props) {
  const [err, setErr] = useState("");

  // Thumbnails are object URLs; revoke them when the selection changes or the component goes away.
  const previews = useMemo(() => (images ? files.map((f) => URL.createObjectURL(f)) : []), [images, files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function add(list: FileList | null) {
    if (!list) return;
    setErr("");
    const next = [...files];
    for (const file of Array.from(list)) {
      if (images && !file.type.startsWith("image/")) { setErr(`“${file.name}” isn't an image.`); continue; }
      if (file.size > maxMb * 1048576) { setErr(`“${file.name}” is over ${maxMb} MB.`); continue; }
      if (next.length >= max) { setErr(`You can add up to ${max} files.`); break; }
      next.push(file);
    }
    onChange(next);
  }

  const Icon = images ? ImagePlus : Paperclip;
  return (
    <div>
      <label className="label">{label}</label>
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line p-5 text-center transition hover:border-brand hover:bg-brand-soft">
        <Icon className="text-brand" />
        <span className="text-sm font-medium">{images ? "Tap to add images" : "Tap to add files"}</span>
        <span className="text-xs text-muted">{hint}</span>
        <input type="file" multiple accept={images ? "image/*" : undefined} className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}

      {files.length > 0 && images && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, i) => (
            <motion.li initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={file.name + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={previews[i]} alt={file.name} className="h-full w-full object-cover" />
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-fg/70 p-0 text-bg hover:bg-fg"><X size={14} /></button>
            </motion.li>
          ))}
        </ul>
      )}

      {files.length > 0 && !images && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={file.name + i} className="card flex items-center gap-3 px-4 py-2.5 text-sm">
              <FileText size={18} className="shrink-0 text-brand" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted">{fmtSize(file.size)}</span>
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))} className="p-0 text-muted hover:text-danger"><X size={16} /></button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
