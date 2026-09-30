import { PenLine, GraduationCap, SpellCheck, FlaskConical, BriefcaseBusiness, Code2, type LucideIcon } from "lucide-react";
const map: Record<string, LucideIcon> = { PenLine, GraduationCap, SpellCheck, FlaskConical, BriefcaseBusiness, Code2 };
export default function ServiceIcon({ name, size = 22 }: { name: string; size?: number }) {
  const I = map[name] ?? PenLine;
  return <I size={size} />;
}
