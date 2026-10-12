/**
 * Global loading indicator: the ScholaryPath emblem, gently pulsing inside an expanding ring.
 * Centred on the screen or inside its container.
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
        <div className="relative grid place-items-center" style={{ width: s, height: s }}>
          <span className="ld-ring absolute inset-0 rounded-full border-2 border-brand/30" />
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static emblem, no optimisation needed */}
          <img src="/logo-mark.png" alt="" className="ld-tile relative h-auto w-full" />
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
