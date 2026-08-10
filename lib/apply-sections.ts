/**
 * Schema-driven question sets.
 *
 * One engine (components/apply/ApplyEngine.tsx) renders both applications:
 * the intern side and the startup side. Everything the engine needs to draw a
 * question lives here as data — labels, help text, options, conditionals.
 *
 * The intern set is BUILT FROM lib/apply-contract.ts rather than retyped.
 * That file is the frozen wire contract the Apps Script webhook and the Sheet
 * depend on, so `field()` looks every id up by name and throws at module load
 * if one drifts. Restructuring the UI is safe; renaming a field is not.
 */

import { APPLY_STEPS, type ApplyField } from "@/lib/apply-contract";
import { startups } from "@/lib/site-data";

export type QuestionType =
  | "short_text"
  | "textarea"
  | "url"
  | "select"
  | "yes_no"
  | "multi_checkbox"
  | "file";

export type Option = {
  value: string;
  label: string;
};

export type Question = {
  /** Wire name. For the intern set this is a frozen contract field name. */
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  options?: Option[];
  /** File inputs only — mirrors the contract's `accept`. */
  accept?: string;
  /** HTML autocomplete token, passed through to the input. */
  autocomplete?: string;
  /** Input mode for short_text: drives the keyboard and browser validation. */
  inputType?: "text" | "email" | "tel";
  conditional?: {
    dependsOn: string;
    showWhen: string;
  };
};

export type Section = {
  id: string;
  /** Rail label — short. */
  nav: string;
  title: string;
  blurb?: string;
  questions: Question[];
};

export type QuestionSet = {
  key: "intern" | "startup";
  /** Storage namespace for autosave — the two sets never share answers. */
  storageKey: string;
  heading: string;
  dates: string;
  note: string;
  /**
   * The two ids the opening gate writes into. Everything below the gate stays
   * locked until they are filled, and the email is what resume-by-email keys
   * off, so both must be real question ids inside `sections`.
   */
  gate: {
    nameId: string;
    emailId: string;
  };
  sections: Section[];
};

/* ------------------------------------------------------------------ */
/* intern — derived from the frozen contract                           */
/* ------------------------------------------------------------------ */

const CONTRACT_FIELDS: ReadonlyMap<string, ApplyField> = new Map(
  APPLY_STEPS.flatMap((step) => step.fields).map((f) => [f.name, f]),
);

const CONTRACT_TYPE_TO_QUESTION: Record<ApplyField["type"], QuestionType> = {
  text: "short_text",
  email: "short_text",
  tel: "short_text",
  select: "select",
  textarea: "textarea",
  file: "file",
};

/**
 * Pull one field out of the frozen contract by name. Overrides may change how
 * a question is *presented* (label copy, help text, placeholder) but never the
 * id — that is the wire name and it is taken from the contract only.
 */
function field(
  name: string,
  overrides: Partial<Omit<Question, "id">> = {},
): Question {
  const source = CONTRACT_FIELDS.get(name);
  if (!source) {
    throw new Error(
      `apply-sections: "${name}" is not a field in lib/apply-contract.ts. ` +
        `The contract is frozen — the section layout must reference existing names.`,
    );
  }

  return {
    id: source.name,
    label: source.label,
    type: CONTRACT_TYPE_TO_QUESTION[source.type],
    required: source.required,
    placeholder: source.placeholder,
    helpText: source.hint,
    accept: source.accept,
    autocomplete: source.autocomplete,
    inputType:
      source.type === "email" ? "email" : source.type === "tel" ? "tel" : "text",
    options: source.options?.map((option) => ({ value: option, label: option })),
    ...overrides,
  };
}

/** Cap on the scannable short answers. The letter is deliberately uncapped. */
export const SHORT_ANSWER_LIMIT = 150;

/**
 * Shown under every long-form answer. Numbers are the single strongest signal
 * in an application, so the hint says so plainly rather than hedging.
 */
export const TEXTAREA_HINT =
  "Numbers help — a lot. Statistics, users, revenue, views: real figures beat adjectives every time.";

const INTERN_SECTIONS: Section[] = [
  {
    id: "about-you",
    nav: "about you",
    title: "About you",
    blurb: "The basics. Thirty seconds.",
    questions: [
      field("name"),
      field("email"),
      field("phone"),
      field("school"),
      field("grade"),
    ],
  },
  {
    id: "where-you-fit",
    nav: "where you fit",
    title: "Where you fit",
    blurb: "What you want to work on, and where you are.",
    questions: [
      field("interest"),
      field("chapter", {
        helpText: "Online is a real answer — most of the network is remote.",
      }),
    ],
  },
  {
    id: "your-work",
    nav: "your work",
    title: "Your work",
    blurb:
      "This is the part we actually read. Links beat adjectives — a repo, a deployed site, an app in a store, a video with views.",
    questions: [
      // 150 characters on the short answers. The Sheet was drowning in
      // multi-paragraph entries nobody could scan; the letter below is where
      // long-form still belongs.
      field("startup_role", { maxLength: SHORT_ANSWER_LIMIT }),
      field("background", { maxLength: SHORT_ANSWER_LIMIT }),
      field("fields_interest", { maxLength: SHORT_ANSWER_LIMIT }),
      // Was free text, which produced answers nobody could sort. Same wire
      // name, same comma-joined string on the way out — the Sheet and the
      // Supabase column keep working untouched — but the applicant now picks
      // from the real roster instead of typing names from memory.
      field("startup_picks", {
        type: "multi_checkbox",
        label: "Which of these would you want to work at?",
        helpText:
          "Pick every one you would genuinely take. This is what we match on first.",
        options: [
          ...startups.map((startup) => ({
            value: startup.name,
            label: startup.yc ? `${startup.name} · ${startup.yc}` : startup.name,
          })),
          // Not everyone wants a name off this list — some want the network
          // rather than a specific company, and saying so is useful signal.
          { value: "Other", label: "Other / open to anything" },
        ],
      }),
    ],
  },
  {
    id: "why",
    nav: "why",
    title: "Why",
    blurb: "Optional — but it is the thing people remember you by.",
    questions: [field("letter"), field("comments")],
  },
  {
    id: "links",
    nav: "links",
    title: "Links",
    blurb: "Anywhere we can see what you have made.",
    questions: [
      field("instagram"),
      field("linkedin"),
      field("github"),
      field("other_link"),
    ],
  },
  {
    id: "files",
    nav: "files",
    title: "Files",
    blurb: "A resume helps. A link to something live helps more.",
    questions: [field("resume"), field("extra_file")],
  },
];

export const INTERN_SET: QuestionSet = {
  key: "intern",
  storageKey: "axiom_apply_intern",
  heading: "axiom application",
  dates: "rolling — first batch reviewed within 14 days",
  note: "We read every application. We select on what you have shipped, not on GPA, school, or how the resume looks. Every applicant hears back either way.",
  gate: { nameId: "name", emailId: "email" },
  sections: INTERN_SECTIONS,
};

/* ------------------------------------------------------------------ */
/* startup — new, not wire-frozen                                      */
/* ------------------------------------------------------------------ */

const STAGE_OPTIONS: Option[] = [
  { value: "Idea", label: "Idea" },
  { value: "Pre-seed", label: "Pre-seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A+", label: "Series A+" },
  { value: "Bootstrapped", label: "Bootstrapped" },
  { value: "Other", label: "Other" },
];

const TEAM_SIZE_OPTIONS: Option[] = [
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "50+", label: "50+" },
];

const FIELD_OPTIONS: Option[] = [
  { value: "AI", label: "AI" },
  { value: "Computer Science", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Growth", label: "Growth" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
  { value: "Research", label: "Research" },
];

const STARTUP_SECTIONS: Section[] = [
  {
    id: "the-company",
    nav: "the company",
    title: "The company",
    blurb: "Who you are, in the shortest version that is still true.",
    questions: [
      {
        id: "company",
        label: "Startup name",
        type: "short_text",
        required: true,
      },
      {
        id: "website",
        label: "Website",
        type: "url",
        required: true,
        placeholder: "https://",
      },
      {
        id: "one_liner",
        label: "What are you building?",
        type: "textarea",
        required: true,
        maxLength: 220,
        placeholder: "One sentence. The one you would say out loud.",
      },
      {
        id: "stage",
        label: "Stage",
        type: "select",
        required: true,
        options: STAGE_OPTIONS,
      },
      {
        id: "team_size",
        label: "Team size",
        type: "select",
        required: true,
        options: TEAM_SIZE_OPTIONS,
      },
      {
        id: "location",
        label: "Where are you based?",
        type: "short_text",
        required: true,
        placeholder: "City, or Remote",
      },
    ],
  },
  {
    id: "who-you-are",
    nav: "who you are",
    title: "Who you are",
    blurb: "The person we will be emailing.",
    questions: [
      {
        id: "contact_name",
        label: "Your name",
        type: "short_text",
        required: true,
        autocomplete: "name",
      },
      {
        id: "contact_role",
        label: "Your role",
        type: "short_text",
        required: true,
        placeholder: "Founder, CTO, head of growth…",
      },
      {
        id: "contact_email",
        label: "Email",
        type: "short_text",
        inputType: "email",
        required: true,
        autocomplete: "email",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        type: "url",
        required: true,
        placeholder: "profile URL",
      },
      {
        id: "socials",
        label: "Social media",
        type: "short_text",
        placeholder: "X, Instagram, TikTok — whatever you actually post on",
      },
    ],
  },
  {
    id: "the-work",
    nav: "the work",
    title: "The work",
    blurb:
      "The founders who get the most out of this hand an intern one narrow, real, shippable thing in week one.",
    questions: [
      {
        id: "fields_needed",
        label: "What do you need help with?",
        type: "multi_checkbox",
        required: true,
        options: FIELD_OPTIONS,
      },
      {
        id: "role_need",
        label: "What are you looking for specifically?",
        type: "textarea",
        required: true,
        placeholder:
          "e.g. someone to rebuild our onboarding email flow and own it end to end",
      },
      {
        id: "week_one",
        label: "What would they ship in week one?",
        type: "textarea",
        required: true,
        helpText:
          "“Help out with growth” goes badly for everyone. Be specific.",
      },
      {
        id: "hours",
        label: "Hours per week",
        type: "select",
        required: true,
        options: [
          { value: "<5", label: "Under 5" },
          { value: "5-10", label: "5–10" },
          { value: "10-20", label: "10–20" },
          { value: "20+", label: "20+" },
        ],
      },
      {
        id: "location_mode",
        label: "Remote or in person?",
        type: "select",
        required: true,
        options: [
          { value: "Remote", label: "Remote" },
          { value: "Hybrid", label: "Hybrid" },
          { value: "In person", label: "In person" },
        ],
      },
      {
        id: "paid",
        label: "Is the role paid?",
        type: "yes_no",
        required: true,
        helpText:
          "Unpaid is allowed, and it changes how we structure the role — it has to be real learning, not free labour.",
      },
      {
        id: "comp",
        label: "What does it pay?",
        type: "short_text",
        required: true,
        placeholder: "hourly, stipend, or equity",
        conditional: { dependsOn: "paid", showWhen: "yes" },
      },
      {
        id: "start_window",
        label: "When would they start?",
        type: "short_text",
        required: true,
        placeholder: "e.g. within a month, or September",
      },
    ],
  },
  {
    id: "working-with-minors",
    nav: "minors",
    title: "Working with minors",
    blurb:
      "Most of the network is in high school or early college. A parent or guardian signs the agreement.",
    questions: [
      {
        id: "minors_ok",
        label: "Are you able to work with interns under 18?",
        type: "yes_no",
        required: true,
      },
      {
        id: "mentor",
        label: "Who on your team would they report to?",
        type: "short_text",
        required: true,
        placeholder: "name and role",
      },
      {
        id: "anything_else",
        label: "Anything else we should know?",
        type: "textarea",
        placeholder: "Reply-level detail is fine. A person reads this.",
      },
    ],
  },
];

export const STARTUP_SET: QuestionSet = {
  key: "startup",
  storageKey: "axiom_apply_startup",
  heading: "startup application",
  dates: "reviewed by hand — usually within a few days",
  note: "Matthew reads every startup application before it goes live. Once you are approved you can browse intern profiles and request people by hand.",
  gate: { nameId: "contact_name", emailId: "contact_email" },
  sections: STARTUP_SECTIONS,
};

export const QUESTION_SETS: Record<QuestionSet["key"], QuestionSet> = {
  intern: INTERN_SET,
  startup: STARTUP_SET,
};

/* ------------------------------------------------------------------ */
/* helpers shared by the engine                                        */
/* ------------------------------------------------------------------ */

export type Answers = Record<string, string>;

export function isVisible(question: Question, answers: Answers): boolean {
  if (!question.conditional) return true;
  return answers[question.conditional.dependsOn] === question.conditional.showWhen;
}

/** Required ids in one section, skipping questions hidden by a conditional. */
export function requiredIds(section: Section, answers: Answers): string[] {
  return section.questions
    .filter((q) => q.required && isVisible(q, answers) && q.type !== "file")
    .map((q) => q.id);
}

export function isSectionComplete(section: Section, answers: Answers): boolean {
  return requiredIds(section, answers).every((id) => answers[id]?.trim());
}
