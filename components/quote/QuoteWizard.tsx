"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useShop } from "../Providers";
import ServiceIcon from "../ServiceIcon";
import PricePanel from "./PricePanel";
import BookingStep from "./BookingStep";
import { wordLabel } from "./helpers";
import { asksDocumentation, calculate, calculateItem, emptyItem, isWeekTimeline, needsWords, wordKind, type Item, type Selection } from "@/lib/pricing";
import { COMPLEXITY, COURSE_GROUPS, DEADLINES, LEVELS, SERVICE_CATEGORIES, WORD_OPTIONS, findCategory, findOption } from "@/lib/catalog";

type StepId = "level" | "course" | "service" | "docs" | "words" | "complexity" | "deadline" | "cart" | "book";
const TITLES: Record<StepId, string> = {
  level: "What is your academic level?",
  course: "What are you studying?",
  service: "What do you need help with?",
  docs: "Do you need documentation?",
  words: "How long is it?",
  complexity: "How complex is the work?",
  deadline: "When do you need it?",
  cart: "Your services",
  book: "Book your order",
};

const stepsFor = (draft: Item): StepId[] => [
  "level",
  "course",
  "service",
  ...(draft.service && asksDocumentation(draft.service) ? (["docs"] as StepId[]) : []),
  ...(draft.service && needsWords(draft.service, draft.documentation) ? (["words"] as StepId[]) : []),
  "complexity",
  "deadline",
  "cart",
  "book",
];

export default function QuoteWizard() {
  const { cfg, code, money } = useShop();
  const params = useSearchParams();
  const [base, setBase] = useState({ level: "", course: "" });
  // Services already configured, and the one being configured now.
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>(emptyItem);
  const [step, setStep] = useState<StepId>("level");
  const [cat, setCat] = useState(params.get("cat") || SERVICE_CATEGORIES[0].id);
  const [other, setOther] = useState("");
  const [sheet, setSheet] = useState(false);

  const steps = useMemo(() => stepsFor(draft), [draft]);
  const idx = Math.max(0, steps.indexOf(step));

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const weeks = isWeekTimeline(draft.service);

  // The price shown while a service is still being configured uses sensible fallbacks for what isn't chosen yet.
  const previewDraft: Item | undefined = draft.service
    ? {
        ...draft,
        complexity: draft.complexity || "standard",
        deadline: draft.deadline || (weeks ? "w4" : "standard"),
        documentation: draft.documentation || (asksDocumentation(draft.service) ? "no" : ""),
      }
    : undefined;
  const sel: Selection = { ...base, items, code };
  const q = calculate({ ...sel, items: previewDraft ? [...items, previewDraft] : items }, cfg);
  const complete = items.length > 0 && !draft.service;
  const bookable = complete && calculate(sel, cfg).ok;

  const go = (n: StepId) => setStep(n);
  const advance = (list: StepId[], from: StepId) => setTimeout(() => go(list[list.indexOf(from) + 1]), 220);

  const pickBase = (patch: Partial<typeof base>) => {
    setBase((b) => ({ ...b, ...patch }));
    advance(steps, step);
  };
  const pickDraft = (patch: Partial<Item>) => {
    const merged = { ...draft, ...patch };
    setDraft(merged);
    advance(stepsFor(merged), step);
  };
  // The last choice for a service commits it to the order and moves on to the summary.
  const commit = (deadline: string) => {
    setItems((list) => [...list, { ...draft, deadline }]);
    setDraft(emptyItem);
    setTimeout(() => go("cart"), 220);
  };

  const back = () => {
    if (step === "service" && items.length > 0) return go("cart");
    if (step === "cart" && items.length > 0) {
      // Undo the last service so it can be changed.
      const last = items[items.length - 1];
      setItems(items.slice(0, -1));
      setDraft({ ...last, deadline: "" });
      return go("deadline");
    }
    if (step === "book") return go("cart");
    const at = steps.indexOf(step);
    if (at > 0) go(steps[at - 1]);
  };
  const pct = Math.round((idx / (steps.length - 1)) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Step {idx + 1} of {steps.length}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${Math.max(pct, 4)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 pb-24 lg:pb-0">
          {idx > 0 && (
            <button onClick={back} className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft size={16} /> Back</button>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>
              {step !== "book" && <h1 className="text-2xl font-semibold sm:text-3xl">{TITLES[step]}</h1>}

              {step === "level" && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {LEVELS.map((l) => (
                    <button key={l.id} className="choice" aria-pressed={base.level === l.id} onClick={() => pickBase({ level: l.id })}>
                      <div className="font-semibold">{l.label}</div><div className="mt-0.5 text-sm text-muted">{l.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === "course" && (
                <div className="mt-6 space-y-6">
                  {COURSE_GROUPS.map((g) => (
                    <div key={g.group}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{g.group}</div>
                      <div className="flex flex-wrap gap-2">
                        {g.courses.map((c) => (
                          <button key={g.group + c} className="choice !rounded-full !px-4 !py-2 text-sm" aria-pressed={base.course === c} onClick={() => pickBase({ course: c })}>{c}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Other</div>
                    <form className="flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); if (other.trim()) pickBase({ course: other.trim() }); }}>
                      <input className="input" placeholder="Not listed? Enter your subject" value={other} onChange={(e) => setOther(e.target.value)} maxLength={100} />
                      <button className="btn btn-primary" disabled={!other.trim()}>Continue</button>
                    </form>
                  </div>
                </div>
              )}

              {step === "service" && (
                <div className="mt-6">
                  <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
                    {SERVICE_CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => setCat(c.id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${cat === c.id ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-muted hover:text-fg"}`}>
                        <ServiceIcon name={c.icon} size={16} /> {c.label}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const c = SERVICE_CATEGORIES.find((x) => x.id === cat) ?? SERVICE_CATEGORIES[0];
                    const selCat = findCategory(draft.service)?.id;
                    return (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                        <p className="mb-4 text-sm text-muted">{c.blurb}</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {c.options.map((o) => (
                            <button key={o.id} className="choice" aria-pressed={draft.service === o.id && selCat === c.id} onClick={() => pickDraft({ service: o.id, wordIndex: null, deadline: "", documentation: "" })}>
                              <div className="font-semibold">{o.label}</div>
                              {o.desc && <div className="mt-0.5 text-sm text-muted">{o.desc}</div>}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>
              )}

              {step === "docs" && (
                <div className="mt-6">
                  <p className="mb-4 text-sm text-muted">A written document explaining the work, such as a report, user guide or design rationale.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {([["yes", "Yes, include documentation", "Priced by length, like an assignment, on top of the project."], ["no", "No, just the work", "The project on its own."]] as const).map(([v, title, desc]) => (
                      <button key={v} className="choice" aria-pressed={draft.documentation === v} onClick={() => pickDraft({ documentation: v, wordIndex: null })}>
                        <div className="font-semibold">{title}</div><div className="mt-0.5 text-sm text-muted">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "words" && (() => {
                const kind = wordKind(draft.service, draft.documentation);
                if (!kind) return null;
                const opts = WORD_OPTIONS[kind];
                return (
                  <div className="mt-6">
                    {kind === "thesis" && <p className="mb-4 text-sm text-muted">Overall thesis / dissertation length.</p>}
                    {draft.documentation === "yes" && <p className="mb-4 text-sm text-muted">Length of the documentation.</p>}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {opts.map((w, i) => (
                        <button key={w.label} className="choice text-center" aria-pressed={draft.wordIndex === i} onClick={() => pickDraft({ wordIndex: i })}>
                          <div className="font-semibold">{w.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {step === "complexity" && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {COMPLEXITY.map((c) => {
                    const m = cfg.complexity[c.id] ?? 1;
                    return (
                      <button key={c.id} className="choice" aria-pressed={draft.complexity === c.id} onClick={() => pickDraft({ complexity: c.id })}>
                        <div className="font-semibold">{c.label}</div><div className="mt-0.5 text-sm text-muted">{c.desc}</div>
                        {m !== 1 && <div className="mt-2 text-xs font-medium text-brand">+{Math.round((m - 1) * 100)}%</div>}
                      </button>
                    );
                  })}
                </div>
              )}

              {step === "deadline" && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {DEADLINES.filter((d) => d.group === (weeks ? "weeks" : "days")).map((d) => {
                    const m = cfg.deadlines[d.id] ?? 1;
                    return (
                      <button key={d.id} className="choice" aria-pressed={draft.deadline === d.id} onClick={() => commit(d.id)}>
                        <div className="font-semibold">{weeks ? d.label : `${d.label} delivery`}</div>
                        {!weeks && <div className="mt-0.5 text-sm text-muted">{d.time}</div>}
                        <div className="mt-2 text-xs font-medium text-brand">{m > 1 ? `+${Math.round((m - 1) * 100)}%` : weeks ? "" : "Normal price"}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === "cart" && (
                <div className="mt-6">
                  <ul className="space-y-3">
                    {items.map((it, i) => {
                      const lq = calculateItem(base.level, it, cfg);
                      const opt = findOption(it.service);
                      return (
                        <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card flex items-start gap-4 p-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold">{lq?.label ?? opt?.label}</div>
                            <div className="mt-0.5 text-sm text-muted">
                              {[wordLabel(it), COMPLEXITY.find((c) => c.id === it.complexity)?.label, DEADLINES.find((d) => d.id === it.deadline)?.time].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <div className="font-display text-lg font-semibold">{lq ? money(lq.subtotal) : ""}</div>
                          <button type="button" aria-label={`Remove ${opt?.label}`} onClick={() => setItems(items.filter((_, j) => j !== i))} className="p-1 text-muted hover:text-danger"><Trash2 size={18} /></button>
                        </motion.li>
                      );
                    })}
                  </ul>
                  {items.length === 0 && <p className="text-muted">No services yet. Add one to continue.</p>}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button className="btn btn-ghost" onClick={() => go("service")}><Plus size={18} /> Add another service</button>
                    <button className="btn btn-primary" disabled={items.length === 0} onClick={() => go("book")}>Continue to booking</button>
                  </div>
                  {items.length > 1 && <p className="mt-3 text-xs text-muted">Your student discount, if you have one, applies to the whole order.</p>}
                </div>
              )}

              {step === "book" && (bookable ? <BookingStep sel={sel} q={q} /> : <p className="mt-6 text-muted">Please finish the earlier steps first.</p>)}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24"><PricePanel level={base.level} course={base.course} items={items} draft={draft} q={q} complete={complete} /></div>
        </aside>
      </div>

      {/* mobile price bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur-xl lg:hidden">
        <AnimatePresence>
          {sheet && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-h-[70vh] overflow-y-auto px-4 pt-4">
              <PricePanel level={base.level} course={base.course} items={items} draft={draft} q={q} complete={complete} />
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setSheet(!sheet)} className="flex w-full items-center justify-between px-4 py-3">
          <span className="text-sm text-muted">{q.ok ? (complete ? "Estimated price" : "Starting from") : "Your quote"}</span>
          <span className="flex items-center gap-2 font-display text-lg font-semibold">{q.ok ? <Money gbp={q.totalGBP} /> : "—"}<ChevronUp size={18} className={`transition ${sheet ? "rotate-180" : ""}`} /></span>
        </button>
      </div>
    </div>
  );
}

function Money({ gbp }: { gbp: number }) {
  const { money } = useShop();
  return <>{money(gbp)}</>;
}
