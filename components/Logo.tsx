import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      <path d="M6.5 12c3.2-1.5 6.3-1.1 9.5 1.3v11c-3.2-2.4-6.3-2.8-9.5-1.3z" stroke="var(--on-brand)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M25.5 12c-3.2-1.5-6.3-1.1-9.5 1.3v11c3.2-2.4 6.3-2.8 9.5-1.3z" stroke="var(--on-brand)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="16" cy="7.6" r="1.9" fill="var(--brand-2)" />
    </svg>
  );
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="ScholaryPath home">
      <LogoMark />
      <span className="font-display text-[1.35rem] font-medium leading-none tracking-tight">
        Scholary<span className="text-brand-2">Path</span>
      </span>
    </Link>
  );
}
