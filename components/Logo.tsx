import Image from "next/image";
import Link from "next/link";

/** The brand emblem from the supplied logo, used on its own where space is tight. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return <Image src="/logo-mark.png" alt="" width={size} height={Math.round(size * 0.85)} priority className="h-auto shrink-0" style={{ width: size }} />;
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="ScholaryPath home">
      <LogoMark size={44} />
      <span className="font-display text-[1.35rem] font-medium leading-none tracking-tight">
        Scholary<span className="text-brand-2">Path</span>
      </span>
    </Link>
  );
}
