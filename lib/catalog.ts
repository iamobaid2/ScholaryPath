// Static catalogue: labels and structure. All numbers live in lib/pricing-defaults.ts (and Firestore overrides).

export type LevelId = "highschool" | "bachelor" | "master" | "phd" | "mba" | "diploma";
export type ComplexityId = "standard" | "advanced" | "expert";
export type DeadlineId = "standard" | "fast" | "urgent" | "w4" | "w6" | "w8" | "w12";
export type Kind = "essay" | "assignment" | "thesis" | "phd" | "edit" | "flat";

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

export type ServiceOption = { id: string; label: string; desc?: string; kind: Kind; levelScaled?: boolean };
export type ServiceCategory = { id: string; label: string; blurb: string; icon: string; options: ServiceOption[] };

const w = (id: string, label: string, kind: Kind = "assignment", desc?: string): ServiceOption => ({ id, label, kind, desc, levelScaled: true });
const flat = (id: string, label: string, levelScaled = true, desc?: string): ServiceOption => ({ id, label, kind: "flat", levelScaled, desc });

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
      { id: "thesis-full", label: "Complete Thesis Support", kind: "thesis", desc: "10,000–30,000 words" },
      { id: "dissertation-full", label: "Complete Dissertation Support", kind: "thesis", desc: "10,000–30,000 words" },
      { id: "phd-thesis", label: "PhD Thesis Support", kind: "phd", desc: "40,000–60,000+ words" },
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
      flat("programming", "Programming Guidance"),
      flat("python", "Python"),
      flat("java", "Java"),
      flat("cpp", "C++"),
      flat("sql", "SQL"),
      flat("data-analysis", "Data Analysis"),
      flat("ml", "Machine Learning"),
      flat("ai-projects", "AI Projects"),
      flat("uiux", "UI/UX Design"),
    ],
  },
];

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

export const EXTRAS: { id: string; label: string }[] = [
  { id: "formatting", label: "Formatting to university guidelines" },
  { id: "referencing", label: "APA / Harvard / MLA referencing" },
  { id: "citation", label: "Citation correction" },
  { id: "reflist", label: "Reference list creation" },
  { id: "tables", label: "Table formatting" },
  { id: "figures", label: "Figure formatting" },
  { id: "plagiarism", label: "Plagiarism report" },
  { id: "journal", label: "Journal guidelines compliance" },
  { id: "latex", label: "LaTeX formatting" },
];

export type WordOption = { label: string; words: number };
export const WORD_OPTIONS: Record<Exclude<Kind, "flat">, WordOption[]> = {
  essay: [
    { label: "500–1,000", words: 1000 },
    { label: "1,000–2,000", words: 2000 },
    { label: "2,000–3,000", words: 3000 },
    { label: "3,000–4,000", words: 4000 },
    { label: "4,000–5,000", words: 5000 },
    { label: "Above 5,000", words: 6000 },
  ],
  assignment: [
    { label: "500–1,000", words: 1000 },
    { label: "1,000–2,000", words: 2000 },
    { label: "2,000–3,000", words: 3000 },
    { label: "3,000–4,000", words: 4000 },
    { label: "4,000–5,000", words: 5000 },
    { label: "Above 5,000", words: 6000 },
  ],
  thesis: [
    { label: "10,000 words", words: 10000 },
    { label: "20,000 words", words: 20000 },
    { label: "30,000 words", words: 30000 },
  ],
  phd: [
    { label: "40,000 words", words: 40000 },
    { label: "50,000 words", words: 50000 },
    { label: "60,000+ words", words: 60000 },
  ],
  edit: [
    { label: "Up to 1,000", words: 1000 },
    { label: "2,000", words: 2000 },
    { label: "3,000", words: 3000 },
    { label: "5,000", words: 5000 },
    { label: "10,000", words: 10000 },
    { label: "20,000", words: 20000 },
    { label: "30,000", words: 30000 },
    { label: "50,000", words: 50000 },
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
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@scholarypath.com";
export const BRAND = "ScholaryPath";
