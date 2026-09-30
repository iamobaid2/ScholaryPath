import { COMPLEXITY, DEADLINES, LEVELS, WORD_OPTIONS, findOption, EXTRAS, BRAND } from "@/lib/catalog";
import type { Quote, Selection } from "@/lib/pricing";

export const emptySel: Selection = { level: "", course: "", service: "", wordIndex: null, complexity: "", deadline: "", extras: [], code: "" };

export function wordLabel(sel: Selection) {
  const o = findOption(sel.service);
  if (!o || o.kind === "flat" || sel.wordIndex === null) return "";
  return WORD_OPTIONS[o.kind][sel.wordIndex]?.label ?? "";
}

export function orderText(sel: Selection, q: Quote, total: string, extra: { name?: string; email?: string; whatsapp?: string; country?: string; university?: string; degree?: string; notes?: string; files?: string[]; orderId?: string }) {
  const o = findOption(sel.service);
  const lines = [
    `*New order – ${BRAND}*`,
    extra.orderId ? `Order ID: ${extra.orderId}` : null,
    `Level: ${LEVELS.find((l) => l.id === sel.level)?.label}`,
    `Course: ${sel.course}`,
    `Service: ${o?.label}`,
    wordLabel(sel) ? `Length: ${wordLabel(sel)} words` : null,
    `Complexity: ${COMPLEXITY.find((c) => c.id === sel.complexity)?.label}`,
    `Deadline: ${DEADLINES.find((d) => d.id === sel.deadline)?.time}`,
    sel.extras.length ? `Extras: ${sel.extras.map((e) => EXTRAS.find((x) => x.id === e)?.label).join(", ")}` : null,
    q.discount > 0 ? `Discount code: ${sel.code.toUpperCase()}` : null,
    `*Estimated price: ${total}*`,
    "",
    extra.name ? `Name: ${extra.name}` : null,
    extra.email ? `Email: ${extra.email}` : null,
    extra.whatsapp ? `WhatsApp: ${extra.whatsapp}` : null,
    extra.country ? `Country: ${extra.country}` : null,
    extra.university ? `University: ${extra.university}` : null,
    extra.degree ? `Degree: ${extra.degree}` : null,
    extra.notes ? `Notes: ${extra.notes}` : null,
    extra.files?.length ? `Files (I'll attach them here): ${extra.files.join(", ")}` : null,
  ];
  return lines.filter((l) => l !== null).join("\n");
}
