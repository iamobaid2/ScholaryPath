/**
 * Global loading indicator: the ScholaryPath book mark whose pages draw themselves
 * while the brass dot hops along "the path". Centred on the screen or inside its container.
 *
 *   <Loader variant="screen" />   full-screen, used for auth/route gates
 *   <Loader />                    centred in the page content area (default)
 *   <Loader variant="inline" />   compact, for small panels
 */
type Props = { variant?: "screen" | "block" | "inline"; label?: string; size?: number };

export default function Loader({ variant = "block", label = "Loading", size }: Props) {
  const s = size ?? (variant === "inline" ? 40 : 64);
  const wrap =
    variant === "screen"
      ? "fixed inset-0 z-[60] grid place-items-center bg-bg"
      : variant === "block"
        ? "grid min-h-[calc(100vh-11rem)] place-items-center px-4"
        : "grid place-items-center py-10";

  return (
    <div className={wrap} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <div className="relative" style={{ width: s, height: s }}>
          <span className="ld-ring absolute inset-0 rounded-[22%] border-2 border-brand/40" />
          <svg className="ld-tile relative" width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--brand)" />
            <path className="ld-page" pathLength="1" d="M6.5 12c3.2-1.5 6.3-1.1 9.5 1.3v11c-3.2-2.4-6.3-2.8-9.5-1.3z" stroke="var(--on-brand)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
            <path className="ld-page ld-page-r" pathLength="1" d="M25.5 12c-3.2-1.5-6.3-1.1-9.5 1.3v11c3.2-2.4 6.3-2.8 9.5-1.3z" stroke="var(--on-brand)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
            <circle className="ld-dot" cx="16" cy="7.6" r="1.9" fill="var(--brand-2)" />
          </svg>
        </div>
        {variant !== "inline" && (
          <p className="text-sm font-medium text-muted">
            {label}
            <span className="ld-d1">.</span><span className="ld-d2">.</span><span className="ld-d3">.</span>
          </p>
        )}
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
