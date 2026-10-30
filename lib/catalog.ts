// Static catalogue: labels and structure. All numbers live in lib/pricing-defaults.ts (and Firestore overrides).

export type LevelId = "highschool" | "bachelor" | "master" | "phd" | "mba" | "diploma";
export type ComplexityId = "standard" | "advanced" | "expert";
export type DeadlineId = "standard" | "fast" | "urgent" | "w4" | "w6" | "w8" | "w12";
export type Kind = "essay" | "assignment" | "thesis" | "edit" | "flat";

export const LEVELS: { id: LevelId; label: string; desc: string }[] = [
  { id: "highschool", label: "High School", desc: "Grades 9–12, A-Levels, IB" },
  { id: "bachelor", label: "Undergraduate", desc: "Bachelor's degree" },
  { id: "master", label: "Master's", desc: "Postgraduate study" },
  { id: "phd", label: "PhD / Doctoral", desc: "Doctoral research" },
  { id: "mba", label: "MBA", desc: "Business administration" },
  { id: "diploma", label: "Diploma / Certificate", desc: "Vocational & short courses" },
];

export const COURSE_GROUPS: { group: string; courses: string[] }[] = [
  { group: "Engineering", courses: ["Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Computer Engineering"] },
  { group: "Computer Science", courses: ["Software Engineering", "Artificial Intelligence", "Data Science", "Cyber Security"] },
  { group: "Business", courses: ["MBA", "Marketing", "Finance", "Management"] },
  { group: "Medical & Healthcare", courses: ["Medicine", "Nursing", "Pharmacy", "Nutrition"] },
  { group: "Sciences", courses: ["Biology", "Chemistry", "Physics", "Environmental Science"] },
  { group: "Social Sciences", courses: ["Psychology", "Sociology", "Education", "Political Science"] },
  { group: "Law", courses: ["Law", "Legal Studies"] },
];

export type ServiceOption = {
  id: string;
  label: string;
  desc?: string;
  kind: Kind;
  levelScaled?: boolean;
  /** Technical services: the client is asked whether they also need written documentation. */
  docs?: boolean;
  /** Longer explanation, shown in an info tooltip. */
  info?: string;
};
export type ServiceCategory = { id: string; label: string; blurb: string; icon: string; options: ServiceOption[] };

const w = (id: string, label: string, kind: Kind = "assignment", desc?: string): ServiceOption => ({ id, label, kind, desc, levelScaled: true });
const flat = (id: string, label: string, levelScaled = true, desc?: string): ServiceOption => ({ id, label, kind: "flat", levelScaled, desc });
const tech = (id: string, label: string): ServiceOption => ({ id, label, kind: "flat", levelScaled: true, docs: true });

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "writing",
    label: "Academic Writing Support",
    blurb: "Guidance, feedback and model material for essays, assignments and coursework.",
    icon: "PenLine",
    options: [
      w("essay", "Essay", "essay"),
      w("assignment", "Assignment"),
      w("coursework", "Coursework"),
      w("research-paper", "Research Paper"),
      w("case-study", "Case Study"),
      w("report", "Report"),
      w("literature-review", "Literature Review"),
      w("annotated-bibliography", "Annotated Bibliography"),
      w("presentation", "Presentation"),
    ],
  },
  {
    id: "thesis",
    label: "Thesis & Dissertation Support",
    blurb: "Proposals, chapters and full-project support for long-form research.",
    icon: "GraduationCap",
    options: [
      { id: "thesis-proposal", label: "Thesis Proposal", kind: "thesis" },
      { id: "dissertation-proposal", label: "Dissertation Proposal", kind: "thesis" },
      { id: "lit-review-chapter", label: "Literature Review Chapter", kind: "thesis" },
      { id: "methodology-chapter", label: "Methodology Chapter", kind: "thesis" },
      { id: "results-chapter", label: "Results Chapter", kind: "thesis" },
      { id: "discussion-chapter", label: "Discussion Chapter", kind: "thesis" },
      { id: "thesis-formatting", label: "Thesis Formatting", kind: "thesis" },
      { id: "thesis-full", label: "Complete Thesis Support", kind: "thesis" },
      { id: "thesis-with-project", label: "Thesis with Project", kind: "thesis", desc: "Written thesis plus the practical project" },
      { id: "dissertation-full", label: "Complete Dissertation Support", kind: "thesis" },
      { id: "dissertation-with-project", label: "Dissertation with Project", kind: "thesis", desc: "Written dissertation plus the practical project" },
      { id: "phd-thesis", label: "PhD Thesis Support", kind: "thesis" },
    ],
  },
  {
    id: "editing",
    label: "Editing & Proofreading",
    blurb: "From grammar checks to full academic polish, priced per word count.",
    icon: "SpellCheck",
    options: [
      { id: "edit-basic", label: "Basic Editing", kind: "edit", desc: "Grammar and spelling", levelScaled: true },
      { id: "edit-academic", label: "Academic Editing", kind: "edit", desc: "Grammar, structure, academic language", levelScaled: true },
      { id: "edit-premium", label: "Premium Editing", kind: "edit", desc: "Full improvement, formatting and referencing", levelScaled: true },
    ],
  },
  {
    id: "research",
    label: "Research Support",
    blurb: "Methodology, statistics and manuscript preparation.",
    icon: "FlaskConical",
    options: [
      flat("methodology-consult", "Research Methodology Consultation"),
      flat("research-design", "Research Design Guidance"),
      flat("statistics", "Statistical Guidance"),
      flat("data-interpretation", "Data Interpretation Support"),
      flat("journal-formatting", "Journal Formatting"),
      w("manuscript", "Manuscript Preparation"),
    ],
  },
  {
    id: "professional",
    label: "Professional Documents",
    blurb: "CVs, cover letters, statements and LinkedIn profiles.",
    icon: "BriefcaseBusiness",
    options: [
      flat("cv-writing", "CV Writing", false),
      flat("cv-editing", "CV Editing", false),
      flat("cover-letter", "Cover Letter", false),
      flat("sop", "Statement of Purpose (SOP)", false),
      flat("personal-statement", "Personal Statement", false),
      flat("linkedin", "LinkedIn Profile", false),
    ],
  },
  {
    id: "technical",
    label: "Technical Services",
    blurb: "Programming guidance, data analysis, ML, AI and UI/UX.",
    icon: "Code2",
    options: [
      tech("programming", "Programming Guidance"),
      tech("python", "Python"),
      tech("java", "Java"),
      tech("cpp", "C++"),
      tech("sql", "SQL"),
      tech("data-analysis", "Data Analysis"),
      tech("ml", "Machine Learning"),
      tech("ai-projects", "AI Projects"),
      tech("uiux", "UI/UX Design"),
    ],
  },
];

// What each service covers, for the info icon on its card.
const SUPPORT = "Guidance, feedback and model material to support your learning.";
const INFO: Record<string, string> = {
  essay: `A written essay on your topic. ${SUPPORT} Pick the length next.`,
  assignment: `A general assignment, such as a question set or short report. ${SUPPORT}`,
  coursework: `Coursework with several parts or a marking rubric. ${SUPPORT}`,
  "research-paper": `A paper built around a research question, with sources. ${SUPPORT}`,
  "case-study": "Analysis of a real or fictional case, usually with recommendations.",
  report: "A structured report, such as a business, lab or technical report.",
  "literature-review": "A review of existing research on a topic, organised by theme.",
  "annotated-bibliography": "A list of sources, each with a short summary and evaluation.",
  presentation: "Slides for a presentation, with speaker notes where needed.",
  "thesis-proposal": "The plan for your thesis: question, aims, background and method.",
  "dissertation-proposal": "The plan for your dissertation: question, aims, background and method.",
  "lit-review-chapter": "The literature review chapter of your thesis or dissertation. The range is the length of your whole thesis.",
  "methodology-chapter": "The chapter explaining how your research was done. The range is the length of your whole thesis.",
  "results-chapter": "The chapter presenting your findings. The range is the length of your whole thesis.",
  "discussion-chapter": "The chapter interpreting your findings. The range is the length of your whole thesis.",
  "thesis-formatting": "Layout to your university's rules: headings, numbering, contents and references.",
  "thesis-full": "Support for the whole thesis from start to finish. Choose the range that matches its final length.",
  "thesis-with-project": "A thesis that includes a practical project (software, a design, an experiment). Covers the written thesis and the project together.",
  "dissertation-full": "Support for the whole dissertation from start to finish. Choose the range that matches its final length.",
  "dissertation-with-project": "A dissertation that includes a practical project. Covers the written dissertation and the project together.",
  "phd-thesis": "Support for a doctoral thesis. Choose the range that matches its final length.",
  "edit-basic": "Corrects spelling, grammar and punctuation. Doesn't change structure or wording.",
  "edit-academic": "Basic editing plus clearer structure, flow and academic tone.",
  "edit-premium": "The full treatment: academic editing, formatting and a check of your referencing.",
  "methodology-consult": "A one-to-one discussion of which research methods suit your question.",
  "research-design": "Help shaping your study: sample, variables, data collection and analysis plan.",
  statistics: "Choosing and running the right statistical tests, and understanding the output.",
  "data-interpretation": "Making sense of your results and explaining what they mean.",
  "journal-formatting": "Formatting a finished paper to a journal's author guidelines.",
  manuscript: "Preparing a paper for submission to a journal.",
  "cv-writing": "A new CV written for you from your background and the role you want.",
  "cv-editing": "Improving and tidying a CV you already have.",
  "cover-letter": "A cover letter tailored to a job or programme.",
  sop: "A statement of purpose for a university application.",
  "personal-statement": "A personal statement for a university or scholarship application.",
  linkedin: "A rewritten LinkedIn headline, summary and experience section.",
};
const TECH_INFO = "Hands-on help with this. After choosing it we'll ask whether you also want written documentation (report, user guide or design notes).";
for (const c of SERVICE_CATEGORIES) for (const o of c.options) o.info = INFO[o.id] ?? (o.docs ? TECH_INFO : undefined);

export const ALL_OPTIONS = SERVICE_CATEGORIES.flatMap((c) => c.options);
export const findOption = (id: string) => ALL_OPTIONS.find((o) => o.id === id);
export const findCategory = (optionId: string) => SERVICE_CATEGORIES.find((c) => c.options.some((o) => o.id === optionId));

export const COMPLEXITY: { id: ComplexityId; label: string; desc: string }[] = [
  { id: "standard", label: "Standard", desc: "Normal academic requirements" },
  { id: "advanced", label: "Advanced", desc: "Technical subject and research requirements" },
  { id: "expert", label: "Expert", desc: "PhD-level or specialised research" },
];

export const DEADLINES: { id: DeadlineId; label: string; time: string; note: string; group: "days" | "weeks" }[] = [
  { id: "standard", label: "Standard", time: "7–14 days", note: "Normal price", group: "days" },
  { id: "fast", label: "Fast", time: "3–7 days", note: "+25%", group: "days" },
  { id: "urgent", label: "Urgent", time: "24–72 hours", note: "+50%", group: "days" },
  { id: "w4", label: "4 weeks", time: "4 weeks", note: "", group: "weeks" },
  { id: "w6", label: "6 weeks", time: "6 weeks", note: "", group: "weeks" },
  { id: "w8", label: "8 weeks", time: "8 weeks", note: "", group: "weeks" },
  { id: "w12", label: "12 weeks", time: "12 weeks", note: "", group: "weeks" },
];

export type WordOption = { label: string; words: number };
/** Each option is a range; `words` is its upper bound, which is what editing is charged on. */
const DOC_RANGES: WordOption[] = [
  { label: "100 – 1,000 words", words: 1000 },
  { label: "1,000 – 3,000 words", words: 3000 },
  { label: "3,000 – 5,000 words", words: 5000 },
  { label: "5,000 – 10,000 words", words: 10000 },
];
export const WORD_OPTIONS: Record<Exclude<Kind, "flat">, WordOption[]> = {
  essay: DOC_RANGES,
  assignment: DOC_RANGES,
  thesis: [
    { label: "10,000 – 15,000 words", words: 15000 },
    { label: "15,000 – 25,000 words", words: 25000 },
    { label: "25,000 – 40,000 words", words: 40000 },
    { label: "40,000 – 60,000 words", words: 60000 },
  ],
  edit: [
    ...DOC_RANGES,
    { label: "10,000 – 20,000 words", words: 20000 },
    { label: "20,000 – 40,000 words", words: 40000 },
    { label: "40,000 – 60,000 words", words: 60000 },
  ],
};

export const CURRENCIES = ["GBP", "AUD", "USD", "EUR", "CAD", "NZD", "AED", "PKR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const STAGES = [
  { id: "received", label: "Order Received" },
  { id: "payment", label: "Payment Confirmed" },
  { id: "assigned", label: "Expert Assigned" },
  { id: "started", label: "Work Started" },
  { id: "review", label: "Quality Review" },
  { id: "completed", label: "Completed" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

export const DISCOUNT_CODE = "SCHOLAR15";
export const WHATSAPP_NUMBER = "923207201065";
export const WHATSAPP_DISPLAY = "+92 320 7201065";
// Fixed in code rather than read from an environment variable: NEXT_PUBLIC_ values are baked in at build
// time, so a stale value on the host kept showing an old address after the code was corrected.
export const CONTACT_EMAIL = "scholarlypath2@gmail.com";
export const FACEBOOK_URL = "https://www.facebook.com/share/1EUDFuVJrV/";
export const BRAND = "ScholaryPath";
