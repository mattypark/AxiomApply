/**
 * Schema-driven question sets.
 *
 * One engine (components/apply/ApplyEngine.tsx) renders all three applications:
 * the intern side, the startup side and the chapter side. Everything the engine
 * needs to draw a question lives here as data — labels, help text, options,
 * conditionals.
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
    /** Exact match. */
    showWhen?: string;
    /** Exact match against any one of several parent answers. */
    showWhenOneOf?: string[];
    /** For multi_checkbox parents, whose value is a comma-joined list. */
    showWhenIncludes?: string;
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
  key: "intern" | "startup" | "chapter";
  /** Storage namespace for autosave — the sets never share answers. */
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
      {
        // Not a contract field. InternApplication folds this into
        // startup_picks before posting, so the wire payload — and the Sheet
        // column — stay exactly as they are.
        id: "startup_picks_other",
        label: "Which one?",
        type: "short_text",
        maxLength: SHORT_ANSWER_LIMIT,
        placeholder: "Name the startup, or what kind of team you want",
        conditional: { dependsOn: "startup_picks", showWhenIncludes: "Other" },
      },
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

/* ------------------------------------------------------------------ */
/* chapter — new, not wire-frozen                                      */
/* ------------------------------------------------------------------ */

/**
 * Starting a chapter is not a third role — a chapter founder can also be an
 * intern or a startup. So this set asks nothing about placement; it asks
 * whether the person can actually run something at their school, and ends by
 * asking which of the other two they also want.
 */

const CHAPTER_SECTIONS: Section[] = [
  {
    id: "about-you",
    nav: "you",
    title: "Start with you",
    blurb: "The person who would be running it.",
    questions: [
      {
        id: "name",
        label: "Full name",
        type: "short_text",
        required: true,
        autocomplete: "name",
      },
      {
        id: "email",
        label: "Email",
        type: "short_text",
        inputType: "email",
        required: true,
        autocomplete: "email",
      },
      {
        id: "phone",
        label: "Phone",
        type: "short_text",
        inputType: "tel",
        autocomplete: "tel",
      },
      {
        id: "grade",
        label: "What year are you in?",
        type: "select",
        required: true,
        options: [
          { value: "9th", label: "9th grade" },
          { value: "10th", label: "10th grade" },
          { value: "11th", label: "11th grade" },
          { value: "12th", label: "12th grade" },
          { value: "College freshman", label: "College freshman" },
          { value: "College sophomore+", label: "College sophomore or above" },
          { value: "Gap year", label: "Gap year" },
        ],
      },
      {
        id: "city",
        label: "Where are you based?",
        type: "short_text",
        required: true,
        placeholder: "City, State",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        type: "url",
        placeholder: "profile URL",
      },
      {
        id: "other_link",
        label: "Anything else that shows your work",
        type: "url",
        helpText:
          "GitHub, a portfolio, a project, the account you actually post on.",
      },
    ],
  },
  {
    id: "your-school",
    nav: "your school",
    title: "Where the chapter would live",
    blurb:
      "Chapters run inside a real school, which means real constraints. We would rather know them now.",
    questions: [
      {
        id: "school",
        label: "School name",
        type: "short_text",
        required: true,
      },
      {
        id: "school_type",
        label: "What kind of school?",
        type: "select",
        required: true,
        options: [
          { value: "Public high school", label: "Public high school" },
          { value: "Private high school", label: "Private high school" },
          { value: "Charter", label: "Charter" },
          { value: "Boarding", label: "Boarding" },
          { value: "Homeschool co-op", label: "Homeschool co-op" },
          { value: "University", label: "University" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        id: "school_size",
        label: "Roughly how many students?",
        type: "select",
        required: true,
        options: [
          { value: "Under 200", label: "Under 200" },
          { value: "200-500", label: "200–500" },
          { value: "500-1000", label: "500–1,000" },
          { value: "1000-2000", label: "1,000–2,000" },
          { value: "2000+", label: "2,000+" },
        ],
      },
      {
        id: "club_process",
        label: "How do clubs get approved at your school?",
        type: "textarea",
        required: true,
        helpText:
          "If you do not know yet, say that. It is a real answer and we would rather have it than a guess.",
      },
      {
        id: "advisor_status",
        label: "Do you have a faculty advisor?",
        type: "select",
        required: true,
        options: [
          { value: "Yes, confirmed", label: "Yes, confirmed" },
          { value: "Someone in mind", label: "Someone in mind" },
          { value: "Not yet", label: "Not yet" },
        ],
      },
      {
        id: "advisor_name",
        label: "Who?",
        type: "short_text",
        required: true,
        placeholder: "name and what they teach",
        conditional: {
          dependsOn: "advisor_status",
          showWhenOneOf: ["Yes, confirmed", "Someone in mind"],
        },
      },
      {
        id: "existing_clubs",
        label: "What similar clubs already exist there?",
        type: "textarea",
        required: true,
        helpText:
          "CS club, DECA, entrepreneurship, robotics. “None” is a fine answer — it changes what the chapter has to be.",
      },
    ],
  },
  {
    id: "why-you",
    nav: "why you",
    title: "Why you, specifically",
    blurb:
      "Chapters are run by one person for a long time before anyone shows up. This section is most of the decision.",
    questions: [
      {
        id: "qualified",
        label: "What makes you the person to run this?",
        type: "textarea",
        required: true,
      },
      {
        id: "built",
        label: "What have you actually built, led, or shipped?",
        type: "textarea",
        required: true,
        helpText:
          "Members, revenue, users, views, event turnout — real figures beat adjectives every time.",
      },
      {
        id: "why_axiom",
        label: "Why an Axiom chapter and not something you start yourself?",
        type: "textarea",
        required: true,
      },
      {
        id: "hardest",
        label: "Tell us about something you started that did not work.",
        type: "textarea",
        required: true,
        helpText: "We care more about this answer than about the wins.",
      },
    ],
  },
  {
    id: "the-plan",
    nav: "the plan",
    title: "What actually happens when you start one",
    blurb:
      "Specific beats ambitious. A plan for ten people you can name is stronger than a plan for a hundred you cannot.",
    questions: [
      {
        id: "first_30",
        label: "Your first 30 days, concretely.",
        type: "textarea",
        required: true,
      },
      {
        id: "first_members",
        label: "How do you get the first 10 members?",
        type: "textarea",
        required: true,
      },
      {
        id: "cadence",
        label: "How often would the chapter meet?",
        type: "select",
        required: true,
        options: [
          { value: "Weekly", label: "Weekly" },
          { value: "Every other week", label: "Every other week" },
          { value: "Monthly", label: "Monthly" },
          { value: "Not sure yet", label: "Not sure yet" },
        ],
      },
      {
        id: "member_value",
        label:
          "What does a member have after 3 months that they did not before?",
        type: "textarea",
        required: true,
      },
      {
        id: "startups_local",
        label: "Any startups, founders, or mentors near you?",
        type: "textarea",
        helpText:
          "Name them. One local founder you have actually met counts for more than a list of famous ones.",
      },
      {
        id: "biggest_risk",
        label: "What is most likely to kill this chapter?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    id: "commitment",
    nav: "commitment",
    title: "The part people skip",
    blurb: "Most chapters die from time, not from ideas.",
    questions: [
      {
        id: "hours",
        label: "Hours per week you can commit",
        type: "select",
        required: true,
        options: [
          { value: "1-3", label: "1–3" },
          { value: "3-5", label: "3–5" },
          { value: "5-10", label: "5–10" },
          { value: "10+", label: "10+" },
        ],
      },
      {
        id: "how_long",
        label: "How long will you run it?",
        type: "select",
        required: true,
        options: [
          { value: "One semester", label: "One semester" },
          { value: "One year", label: "One year" },
          { value: "Until I graduate", label: "Until I graduate" },
          { value: "Beyond, I would hand it off", label: "Beyond — I would hand it off" },
        ],
      },
      {
        id: "cofounders",
        label: "Starting it with anyone?",
        type: "yes_no",
        required: true,
      },
      {
        id: "cofounder_names",
        label: "Who, and what do they do?",
        type: "textarea",
        required: true,
        conditional: { dependsOn: "cofounders", showWhen: "yes" },
      },
      {
        id: "monthly_call",
        label: "Can you make a 30-minute call with Axiom once a month?",
        type: "yes_no",
        required: true,
      },
      {
        id: "also_interested",
        label: "Do you also want to be an intern, or bring your startup in?",
        type: "multi_checkbox",
        options: [
          { value: "Intern placement", label: "Intern placement" },
          { value: "I run a startup", label: "I run a startup" },
          { value: "Just the chapter for now", label: "Just the chapter for now" },
        ],
        helpText:
          "Running a chapter does not replace either one — you can do both, and this is what unlocks the next step on your dashboard.",
      },
      {
        id: "anything_else",
        label: "Anything else?",
        type: "textarea",
        placeholder: "Reply-level detail is fine. A person reads this.",
      },
    ],
  },
];

export const CHAPTER_SET: QuestionSet = {
  key: "chapter",
  storageKey: "axiom_apply_chapter",
  heading: "chapter application",
  dates: "reviewed by hand — usually within a week",
  note: "Chapters are approved one at a time, by a person, because a chapter that fails is worse than a school with none. Starting one does not stop you applying as an intern or bringing a startup in.",
  gate: { nameId: "name", emailId: "email" },
  sections: CHAPTER_SECTIONS,
};

export const QUESTION_SETS: Record<QuestionSet["key"], QuestionSet> = {
  intern: INTERN_SET,
  startup: STARTUP_SET,
  chapter: CHAPTER_SET,
};

/* ------------------------------------------------------------------ */
/* helpers shared by the engine                                        */
/* ------------------------------------------------------------------ */

export type Answers = Record<string, string>;

export function isVisible(question: Question, answers: Answers): boolean {
  const rule = question.conditional;
  if (!rule) return true;

  const value = answers[rule.dependsOn] ?? "";

  if (rule.showWhenOneOf) {
    return rule.showWhenOneOf.includes(value);
  }

  if (rule.showWhenIncludes) {
    // multi_checkbox stores a comma-joined list, so membership is the test.
    return value
      .split(",")
      .map((entry) => entry.trim())
      .includes(rule.showWhenIncludes);
  }

  return value === rule.showWhen;
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
