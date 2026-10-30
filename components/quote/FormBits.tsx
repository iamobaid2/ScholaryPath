"use client";
import InfoHint from "../ui/InfoHint";

/** A numbered section heading for the booking form. */
export function StepHeading({ n, title, info, optional }: { n: number; title: string; info?: string; optional?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-on-brand">{n}</span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {info && <InfoHint label={`About ${title}`} align="left">{info}</InfoHint>}
      {optional && <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">Optional</span>}
    </div>
  );
}

/** A labelled form field with an optional info icon. */
export function Field({ label, info, children }: { label: string; info?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-sm font-medium text-muted">{label}</span>
        {info && <InfoHint label={`About ${label}`} align="left">{info}</InfoHint>}
      </div>
      {children}
    </div>
  );
}
