import { COMPLEXITY, DEADLINES, LEVELS, WORD_OPTIONS, BRAND } from "@/lib/catalog";
import { calculateItem, wordKind, type Item, type Quote, type Selection } from "@/lib/pricing";

export function wordLabel(item: Item) {
  const kind = wordKind(item.service, item.documentation);
  if (!kind || item.wordIndex === null) return "";
  return WORD_OPTIONS[kind][item.wordIndex]?.label ?? "";
}

export function orderText(
  sel: Selection,
  q: Quote,
  total: string,
  extra: { name?: string; email?: string; whatsapp?: string; country?: string; university?: string; degree?: string; notes?: string; files?: string[]; feedback?: string[]; orderId?: string }
) {
  const services = sel.items.map((it, i) => {
    const label = calculateItem(sel.level, it)?.label ?? it.service;
    const bits = [wordLabel(it), COMPLEXITY.find((c) => c.id === it.complexity)?.label, DEADLINES.find((d) => d.id === it.deadline)?.time].filter(Boolean);
    return `${i + 1}. ${label} (${bits.join(", ")})`;
  });
  const lines = [
    `*New order – ${BRAND}*`,
    extra.orderId ? `Order ID: ${extra.orderId}` : null,
    `Level: ${LEVELS.find((l) => l.id === sel.level)?.label}`,
    `Course: ${sel.course}`,
    "Services:",
    ...services,
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
    extra.feedback?.length ? `Previous marks / feedback (I'll attach them here): ${extra.feedback.join(", ")}` : null,
  ];
  return lines.filter((l) => l !== null).join("\n");
}
