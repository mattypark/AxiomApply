/**
 * FROZEN APPLY-FORM CONTRACT
 * --------------------------
 * Ported verbatim from the Astro build (src/pages/index.astro, STEPS array)
 * at snapshot commit aa9d700. The Google Apps Script webhook + Sheet expect
 * exactly these field names and option strings.
 *
 * DO NOT:
 *  - rename any `name`
 *  - change any option string (they land verbatim in the Sheet)
 *  - add a `track` field (the Sheet has the column, the form never sends it)
 *  - remove `fields_interest` / `startup_picks` (sent today even though the
 *    Apps Script drops them — they are part of the wire payload)
 *
 * Files are sent as `<name>_name`, `<name>_type`, `<name>_base64`
 * (base64 without the data-URL prefix), 8MB max per file.
 * Transport: browser fetch POST, mode "no-cors", URLSearchParams body.
 */

export type ApplyFieldType = "text" | "email" | "tel" | "select" | "textarea" | "file";

export type ApplyField = {
  label: string;
  name: string;
  type: ApplyFieldType;
  required?: boolean;
  autocomplete?: string;
  placeholder?: string;
  options?: readonly string[];
  accept?: string;
  hint?: string;
};

export type ApplyStep = {
  title: string;
  sub?: string;
  fields: readonly ApplyField[];
};

export const MAX_FILE = 8 * 1024 * 1024;

export const APPLY_STEPS: readonly ApplyStep[] = [
  {
    title: "Let's start with you.",
    fields: [
      { label: "Full name", name: "name", type: "text", required: true, autocomplete: "name" },
      { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
      { label: "Phone", name: "phone", type: "tel", required: true, autocomplete: "tel" },
      { label: "School", name: "school", type: "text", required: true },
      {
        label: "Grade / Year",
        name: "grade",
        type: "select",
        required: true,
        options: [
          "9th grade",
          "10th grade",
          "11th grade",
          "12th grade",
          "College — Freshman",
          "College — Sophomore",
          "College — Junior",
          "College — Senior",
          "Other",
        ],
      },
    ],
  },
  {
    title: "Where do you want to fit?",
    fields: [
      {
        label: "Main interest",
        name: "interest",
        type: "select",
        required: true,
        options: ["AI", "Computer Science", "Marketing", "Finance", "Startups", "Other"],
      },
      { label: "City / Chapter", name: "chapter", type: "text", required: true, placeholder: "e.g. Bay Area, Online" },
      {
        label: "What internship are you looking for?",
        name: "startup_role",
        type: "textarea",
        required: true,
        placeholder: "e.g. AI engineer at an early-stage startup…",
      },
      {
        label: "Why that, and what's your background?",
        name: "background",
        type: "textarea",
        required: true,
        placeholder: "What draws you to it, what you've done so far…",
      },
      {
        label: "What fields are you interested in?",
        name: "fields_interest",
        type: "textarea",
        required: true,
        placeholder: "e.g. AI infra, consumer growth, fintech…",
      },
      {
        label: "Which startups specifically?",
        name: "startup_picks",
        type: "textarea",
        required: true,
        placeholder: "FinalDose, Stealth, Anvara, Tally, Quarter Life Crisis, Topit AI, TypeOS, Corgi",
      },
    ],
  },
  {
    title: "A little more.",
    sub: "Optional — but it helps.",
    fields: [
      {
        label: "What do you want to build, and why?",
        name: "letter",
        type: "textarea",
        placeholder: "A few sentences is plenty.",
      },
      { label: "Instagram", name: "instagram", type: "text", placeholder: "@handle" },
      { label: "LinkedIn", name: "linkedin", type: "text", placeholder: "profile URL" },
      { label: "GitHub", name: "github", type: "text", placeholder: "@username" },
      { label: "Other link", name: "other_link", type: "text", placeholder: "portfolio, X, TikTok…" },
      {
        label: "Resume / CV",
        name: "resume",
        type: "file",
        accept: ".pdf,.doc,.docx,application/pdf",
        hint: "PDF or DOC · max 8MB",
      },
      {
        label: "Additional file",
        name: "extra_file",
        type: "file",
        accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,image/*,application/pdf",
        hint: "Image, PDF, anything · max 8MB",
      },
      {
        label: "Anything else you'd like to share?",
        name: "comments",
        type: "textarea",
        placeholder: "A note to the team — anything goes.",
      },
    ],
  },
] as const;

/** Same hint the Astro build shows under every textarea. */
export const TEXTAREA_HINT = "Statistics and numbers will boost your chance of getting in.";

/**
 * Webhook target. Same URL the Astro build shipped in its client JS —
 * public by nature. Env-configurable so it can be rotated from Vercel.
 */
export const WEBHOOK_URL =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK ??
  "https://script.google.com/macros/s/AKfycbwxvxSnqkHtXmDmZivo-AW4BllLdT5mWQrQYoV2v1J47hojuEvpf5GPzIGlppkO1K0c/exec";
