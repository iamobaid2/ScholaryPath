"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useShop } from "../Providers";
import ServiceIcon from "../ServiceIcon";
import Select from "../ui/Select";
import InfoHint from "../ui/InfoHint";
import PricePanel from "./PricePanel";
import BookingStep from "./BookingStep";
import ChoiceCard, { SectionTitle } from "./ChoiceCard";
import { wordLabel } from "./helpers";
import { asksDocumentation, calculate, calculateItem, emptyItem, isWeekTimeline, needsWords, wordKind, type Item, type Selection } from "@/lib/pricing";
import { COMPLEXITY, COURSE_GROUPS, DEADLINES, LEVELS, SERVICE_CATEGORIES, WORD_OPTIONS, findCategory, findOption } from "@/lib/catalog";

/** Five steps: who you are, what you need, the details, a review of your services, and booking. */
type StepId = "about" | "service" | "details" | "cart" | "book";
const STEPS: StepId[] = ["about", "service", "details", "cart", "book"];
const TITLES: Record<StepId, string> = {
  about: "Tell us a little about you",
  service: "What do you need help with?",
  details: "A few details",
  cart: "Your order so far",
  book: "Book your order",
};

const COURSE_OPTIONS = [
  ...COURSE_GROUPS.flatMap((g) => g.courses.map((c) => ({ value: c, label: c, hint: g.group }))),
  { value: "__other", label: "Other / not listed", hint: "" },
];
const OTHER = "__other";

/** The delivery time to start from: the standard one, or a middle timeline for long documents. */
const defaultDeadline = (service: string) => (isWeekTimeline(service) ? "w8" : "standard");

const WORDS_INFO = "Choose the range your finished document will fall into. If you're not sure, pick the closest one; we'll confirm the length with you before starting. Longer documents cost more.";
const COMPLEXITY_INFO = "How demanding the work is. Standard is normal coursework. Advanced is for technical subjects or work with research requirements. Expert is for PhD-level or specialised research. Higher levels cost more because they need a more specialised writer.";
const DOCS_INFO = "Written documentation explains the work: a report, user guide or design rationale. If you say yes, you'll pick its length and it's priced like an assignment of that size, added to the project price.";

export default function QuoteWizard() {
  const { cfg, code, money } = useShop();
  const params = useSearchParams();
  const [base, setBase] = useState({ level: "", course: "" });
  const [otherCourse, setOtherCourse] = useState(false);
  // Services already configured, and the one being configured now.
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>(emptyItem);
  const [step, setStep] = useState<StepId>("about");
  const [cat, setCat] = useState(params.get("cat") || SERVICE_CATEGORIES[0].id);
  const [sheet, setSheet] = useState(false);

  const idx = STEPS.indexOf(step);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const weeks = isWeekTimeline(draft.service);
  const draftOpt = findOption(draft.service);
  const kind = wordKind(draft.service, draft.documentation);
  const detailsReady = !!draft.service && (!asksDocumentation(draft.service) || !!draft.documentation) && (!needsWords(draft.service, draft.documentation) || draft.wordIndex !== null);

  // While a service is being configured the panel shows its price as far as it can be worked out.
  const previewDraft: Item | undefined = draft.service
    ? { ...draft, documentation: draft.documentation || (asksDocumentation(draft.service) ? "no" : "") }
    : undefined;
  const sel: Selection = { ...base, items, code };
  const q = calculate({ ...sel, items: previewDraft ? [...items, previewDraft] : items }, cfg);
  const draftQuote = previewDraft ? calculateItem(base.level, previewDraft, cfg) : undefined;
  const complete = items.length > 0 && !draft.service;
  const bookable = complete && calculate(sel, cfg).ok;

  const go = (n: StepId) => setStep(n);
  const startService = (service: string) => {
    setDraft({ ...emptyItem, service, complexity: "standard", deadline: defaultDeadline(service) });
    setTimeout(() => go("details"), 200);
  };
  const addToOrder = () => {
    setItems((list) => [...list, { ...draft }]);
    setDraft(emptyItem);
    go("cart");
  };
  const editItem = (i: number) => {
    setDraft(items[i]);
    setItems(items.filter((_, j) => j !== i));
    go("details");
  };

  const back = () => {
    if (step === "details") { setDraft(emptyItem); return go(items.length ? "cart" : "service"); }
    if (step === "service") return go(items.length ? "cart" : "about");
    if (step === "cart") return go("service");
    if (step === "book") return go("cart");
  };
  const showBack = step !== "about";
  const pct = Math.round((idx / (STEPS.length - 1)) * 100);

  const courseValue = otherCourse ? OTHER : COURSE_OPTIONS.some((o) => o.value === base.course) ? base.course : "";
  const aboutReady = !!base.level && !!base.course.trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Step {idx + 1} of {STEPS.length}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${Math.max(pct, 4)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 pb-24 lg:pb-0">
          {showBack && (
            <button onClick={back} className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft size={16} /> Back</button>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>
              {step !== "book" && <h1 className="text-2xl font-semibold sm:text-3xl">{TITLES[step]}</h1>}

              {step === "about" && (
                <div className="mt-6 space-y-8">
                  <div>
                    <SectionTitle title="Your academic level" info="Your level changes the price because the depth and expectations differ. For example, a PhD thesis needs more specialised input than a high school essay." />
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {LEVELS.map((l) => (
                        <ChoiceCard key={l.id} selected={base.level === l.id} onClick={() => setBase((b) => ({ ...b, level: l.id }))} title={l.label} desc={l.desc} />
                      ))}
                    </div>
                  </div>
                  <div className="max-w-md">
                    <SectionTitle title="Your course or subject" info="We use this to match you with someone who knows the subject. Pick the closest match, or choose “Other” and type your own." />
                    <Select
                      ariaLabel="Course or subject"
                      value={courseValue}
                      searchable
                      placeholder="Search or choose your subject"
                      options={COURSE_OPTIONS}
                      menuClassName="w-full min-w-72"
                      onChange={(v) => {
                        if (v === OTHER) { setOtherCourse(true); setBase((b) => ({ ...b, course: "" })); }
                        else { setOtherCourse(false); setBase((b) => ({ ...b, course: v })); }
                      }}
                    />
                    {otherCourse && (
                      <input className="input mt-3 !h-11 !py-0" autoFocus placeholder="Type your subject" maxLength={100} value={base.course} onChange={(e) => setBase((b) => ({ ...b, course: e.target.value }))} />
                    )}
                  </div>
                  <button className="btn btn-primary" disabled={!aboutReady} onClick={() => go("service")}>Continue</button>
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
                        <p className="mb-4 text-sm text-muted">{c.blurb} Tap the <span className="inline-block translate-y-0.5">ⓘ</span> on a card to see what it covers.</p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {c.options.map((o) => (
                            <ChoiceCard key={o.id} selected={draft.service === o.id && selCat === c.id} onClick={() => startService(o.id)} title={o.label} desc={o.desc} info={o.info} />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>
              )}

              {step === "details" && draftOpt && (
                <div className="mt-6 space-y-8">
                  <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-soft px-4 py-3">
                    <span className="text-sm text-muted">You chose</span>
                    <span className="font-semibold">{draftOpt.label}</span>
                    {draftOpt.info && <InfoHint label={`About ${draftOpt.label}`} align="left">{draftOpt.info}</InfoHint>}
                    <button className="ml-auto text-sm font-medium text-brand hover:underline" onClick={back}>Change</button>
                  </div>

                  {asksDocumentation(draft.service) && (
                    <div>
                      <SectionTitle title="Do you need documentation too?" info={DOCS_INFO} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ChoiceCard selected={draft.documentation === "yes"} onClick={() => setDraft((d) => ({ ...d, documentation: "yes", wordIndex: null }))} title="Yes, include documentation" desc="Priced by length, on top of the project." />
                        <ChoiceCard selected={draft.documentation === "no"} onClick={() => setDraft((d) => ({ ...d, documentation: "no", wordIndex: null }))} title="No, just the work" desc="The project on its own." />
                      </div>
                    </div>
                  )}

                  {kind && (
                    <div>
                      <SectionTitle title={draft.documentation === "yes" ? "How long is the documentation?" : kind === "thesis" ? "How long is the whole thesis or dissertation?" : "How long is it?"} info={WORDS_INFO} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        {WORD_OPTIONS[kind].map((w, i) => (
                          <button key={w.label} type="button" className="choice !py-3 text-center" aria-pressed={draft.wordIndex === i} onClick={() => setDraft((d) => ({ ...d, wordIndex: i }))}>
                            <span className="font-medium">{w.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <SectionTitle title="How complex is the work?" info={COMPLEXITY_INFO} />
                    <div className="grid gap-2 sm:grid-cols-3">
                      {COMPLEXITY.map((c) => {
                        const m = cfg.complexity[c.id] ?? 1;
                        return (
                          <button key={c.id} type="button" className="choice !py-3" aria-pressed={draft.complexity === c.id} onClick={() => setDraft((d) => ({ ...d, complexity: c.id }))}>
                            <div className="font-medium">{c.label}{m > 1 && <span className="ml-1.5 text-xs font-normal text-brand">+{Math.round((m - 1) * 100)}%</span>}</div>
                            <div className="mt-0.5 text-xs text-muted">{c.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <SectionTitle
                      title="When do you need it?"
                      info={weeks ? "Choose how long we have for a long document. Longer timelines let us do more careful work." : "Standard is the normal price. Fast and Urgent cost more because we move other work aside to deliver sooner."}
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      {DEADLINES.filter((d) => d.group === (weeks ? "weeks" : "days")).map((d) => {
                        const m = cfg.deadlines[d.id] ?? 1;
                        return (
                          <button key={d.id} type="button" className="choice !py-3" aria-pressed={draft.deadline === d.id} onClick={() => setDraft((x) => ({ ...x, deadline: d.id }))}>
                            <div className="font-medium">{weeks ? d.label : d.label}{m > 1 && <span className="ml-1.5 text-xs font-normal text-brand">+{Math.round((m - 1) * 100)}%</span>}</div>
                            {!weeks && <div className="mt-0.5 text-xs text-muted">{d.time}</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted">
                      {detailsReady && draftQuote ? <>This service: <b className="font-display text-lg text-fg">{money(draftQuote.subtotal)}</b></> : "Choose the options above to see the price."}
                    </div>
                    <button className="btn btn-primary" disabled={!detailsReady} onClick={addToOrder}>Add to order</button>
                  </div>
                </div>
              )}

              {step === "cart" && (
                <div className="mt-6">
                  <p className="mb-4 text-sm text-muted">Need more than one thing? Add as many services as you like and book them together.</p>
                  <ul className="space-y-3">
                    {items.map((it, i) => {
                      const lq = calculateItem(base.level, it, cfg);
                      const opt = findOption(it.service);
                      return (
                        <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card flex items-start gap-3 p-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold">{lq?.label ?? opt?.label}</div>
                            <div className="mt-0.5 text-sm text-muted">
                              {[wordLabel(it), COMPLEXITY.find((c) => c.id === it.complexity)?.label, DEADLINES.find((d) => d.id === it.deadline)?.time].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <div className="font-display text-lg font-semibold">{lq ? money(lq.subtotal) : ""}</div>
                          <button type="button" aria-label={`Edit ${opt?.label}`} onClick={() => editItem(i)} className="p-1 text-muted hover:text-brand"><Pencil size={17} /></button>
                          <button type="button" aria-label={`Remove ${opt?.label}`} onClick={() => setItems(items.filter((_, j) => j !== i))} className="p-1 text-muted hover:text-danger"><Trash2 size={17} /></button>
                        </motion.li>
                      );
                    })}
                  </ul>
                  {items.length === 0 && <p className="text-muted">No services yet. Add one to continue.</p>}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button className="btn btn-ghost" onClick={() => go("service")}><Plus size={18} /> Add another service</button>
                    <button className="btn btn-primary" disabled={items.length === 0} onClick={() => go("book")}>Continue to booking</button>
                  </div>
                  <p className="mt-4 text-xs text-muted">Next you&apos;ll add your details and, if you like, reference files and previous marks. No payment is taken yet.</p>
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
