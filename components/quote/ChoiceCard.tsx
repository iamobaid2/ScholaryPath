"use client";
import InfoHint from "../ui/InfoHint";

/** A selectable card. The info icon is a sibling of the button, not inside it, so both stay valid and clickable. */
export default function ChoiceCard({ selected, onClick, title, desc, info, infoLabel, className = "" }: { selected: boolean; onClick: () => void; title: string; desc?: string; info?: string; infoLabel?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <button type="button" className={`choice h-full w-full ${info ? "!pr-10" : ""}`} aria-pressed={selected} onClick={onClick}>
        <div className="font-semibold">{title}</div>
        {desc && <div className="mt-0.5 text-sm text-muted">{desc}</div>}
      </button>
      {info && (
        <span className="absolute right-2.5 top-2.5">
          <InfoHint label={infoLabel ?? `About ${title}`} align="right">{info}</InfoHint>
        </span>
      )}
    </div>
  );
}

/** A section heading inside a step, with an optional info icon and an optional/required marker. */
export function SectionTitle({ title, info, optional }: { title: string; info?: string; optional?: boolean }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="font-body text-base font-semibold" style={{ fontFamily: "var(--font-inter)" }}>{title}</h2>
      {info && <InfoHint label={`About ${title}`} align="left">{info}</InfoHint>}
      {optional && <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">Optional</span>}
    </div>
  );
}
