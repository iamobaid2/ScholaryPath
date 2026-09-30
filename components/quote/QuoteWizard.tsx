"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronUp, Check } from "lucide-react";
import { useShop } from "../Providers";
import ServiceIcon from "../ServiceIcon";
import PricePanel from "./PricePanel";
import BookingStep from "./BookingStep";
import { emptySel } from "./helpers";
import { calculate, isWeekTimeline, needsWords, type Selection } from "@/lib/pricing";
import { COMPLEXITY, COURSE_GROUPS, DEADLINES, EXTRAS, LEVELS, SERVICE_CATEGORIES, WORD_OPTIONS, findCategory, findOption } from "@/lib/catalog";

type StepId = "level" | "course" | "service" | "words" | "complexity" | "deadline" | "extras" | "book";
const TITLES: Record<StepId, string> = {
  level: "What is your academic level?",
  course: "What are you studying?",
  service: "What do you need help with?",
  words: "How long is it?",
  complexity: "How complex is the work?",
  deadline: "When do you need it?",
  extras: "Any extras?",
  book: "Book your order",
};

export default function QuoteWizard() {
  const { cfg, code, money } = useShop();
  const params = useSearchParams();
  const [picked, setSel] = useState<Selection>(emptySel);
  const sel = useMemo<Selection>(() => ({ ...picked, code }), [picked, code]);
  const [step, setStep] = useState<StepId>("level");
  const [cat, setCat] = useState(params.get("cat") || SERVICE_CATEGORIES[0].id);
  const [other, setOther] = useState("");
  const [sheet, setSheet] = useState(false);

  const steps = useMemo<StepId[]>(
    () => ["level", "course", "service", ...(sel.service && needsWords(sel.service) ? (["words"] as StepId[]) : []), "complexity", "deadline", "extras", "book"],
    [sel.service]
  );
  const idx = steps.indexOf(step);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const weeks = isWeekTimeline(sel.service);
  const preview: Selection = { ...sel, complexity: sel.complexity || "standard", deadline: sel.deadline || (weeks ? "w4" : "standard") };
  const q = calculate(preview, cfg);
  const complete = !!(sel.complexity && sel.deadline);

  const go = (n: StepId) => setStep(n);
  const next = (patch: Partial<Selection>, after?: StepId) => {
    const merged = { ...sel, ...patch };
    setSel(merged);
    const list: StepId[] = ["level", "course", "service", ...(merged.service && needsWords(merged.service) ? (["words"] as StepId[]) : []), "complexity", "deadline", "extras", "book"];
    const at = list.indexOf(step);
    setTimeout(() => go(after ?? list[at + 1]), 220);
  };
  const back = () => idx > 0 && go(steps[idx - 1]);
  const pct = Math.round((idx / (steps.length - 1)) * 100);
  const canContinueExtras = true;
  const bookable = q.ok && complete;

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
                    <button key={l.id} className="choice" aria-pressed={sel.level === l.id} onClick={() => next({ level: l.id })}>
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
                          <button key={g.group + c} className="choice !rounded-full !px-4 !py-2 text-sm" aria-pressed={sel.course === c} onClick={() => next({ course: c })}>{c}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Other</div>
                    <form className="flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); if (other.trim()) next({ course: other.trim() }); }}>
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
                    const selCat = findCategory(sel.service)?.id;
                    return (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                        <p className="mb-4 text-sm text-muted">{c.blurb}</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {c.options.map((o) => (
                            <button key={o.id} className="choice" aria-pressed={sel.service === o.id && selCat === c.id} onClick={() => next({ service: o.id, wordIndex: null, deadline: "" })}>
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

              {step === "words" && (() => {
                const kind = findOption(sel.service)!.kind;
                if (kind === "flat") return null;
                const opts = WORD_OPTIONS[kind];
                return (
                  <div className="mt-6">
                    {(kind === "thesis" || kind === "phd") && <p className="mb-4 text-sm text-muted">Overall {kind === "phd" ? "PhD thesis" : "thesis / dissertation"} length.</p>}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {opts.map((w, i) => (
                        <button key={w.label} className="choice text-center" aria-pressed={sel.wordIndex === i} onClick={() => next({ wordIndex: i })}>
                          <div className="font-semibold">{w.label}</div>{!w.label.includes("words") && <div className="text-xs text-muted">words</div>}
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
                      <button key={c.id} className="choice" aria-pressed={sel.complexity === c.id} onClick={() => next({ complexity: c.id })}>
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
                      <button key={d.id} className="choice" aria-pressed={sel.deadline === d.id} onClick={() => next({ deadline: d.id })}>
                        <div className="font-semibold">{weeks ? d.label : `${d.label} delivery`}</div>
                        {!weeks && <div className="mt-0.5 text-sm text-muted">{d.time}</div>}
                        <div className="mt-2 text-xs font-medium text-brand">{m > 1 ? `+${Math.round((m - 1) * 100)}%` : weeks ? "" : "Normal price"}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === "extras" && (
                <div className="mt-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {EXTRAS.map((e) => {
                      const on = sel.extras.includes(e.id);
                      return (
                        <button key={e.id} className="choice flex items-center gap-3" aria-pressed={on} onClick={() => setSel({ ...sel, extras: on ? sel.extras.filter((x) => x !== e.id) : [...sel.extras, e.id] })}>
                          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? "border-brand bg-brand text-on-brand" : "border-line"}`}>{on && <Check size={14} />}</span>
                          <span className="flex-1 text-sm font-medium">{e.label}</span>
                          <span className="text-sm text-muted">+{money(cfg.extras[e.id] ?? 0)}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button className="btn btn-primary mt-6" disabled={!canContinueExtras} onClick={() => go("book")}>{sel.extras.length ? "Continue" : "Skip extras"}</button>
                </div>
              )}

              {step === "book" && (bookable ? <BookingStep sel={sel} q={q} /> : <p className="mt-6 text-muted">Please finish the earlier steps first.</p>)}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24"><PricePanel sel={sel} q={q} complete={complete} /></div>
        </aside>
      </div>

      {/* mobile price bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur-xl lg:hidden">
        <AnimatePresence>
          {sheet && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-h-[70vh] overflow-y-auto px-4 pt-4">
              <PricePanel sel={sel} q={q} complete={complete} />
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
