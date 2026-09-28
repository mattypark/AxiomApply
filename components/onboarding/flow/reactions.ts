import { startups } from "@/lib/site-data";
import { splitValues, type Answers } from "@/components/onboarding/flow/useApplication";

/**
 * The line that answers back after a question.
 *
 * A form that never responds feels like a form. These make the next screen
 * open on something that heard you — but every one is either derived from
 * real data (the roster in lib/site-data.ts) or a plain statement about how
 * Axiom works. None of them invents a number.
 *
 * Returning null means "say nothing", which is the right answer for most
 * questions. A reaction on every screen would stop being read by the third.
 */

/** Which roster sectors count as a match for each interest option. */
const INTEREST_SECTORS: Record<string, string[]> = {
  AI: ["ai"],
  "Computer Science": ["ai", "hardware", "productivity"],
  Marketing: ["brand", "go-to-market", "sponsorships", "social", "marketplace"],
  Finance: ["marketplace"],
  Startups: [""],
};

function rosterMatching(keywords: string[]) {
  return startups.filter((startup) =>
    keywords.some((keyword) => startup.meta.toLowerCase().includes(keyword)),
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function reactionFor(id: string, answers: Answers): string | null {
  const value = (answers[id] ?? "").trim();
  if (!value) return null;

  switch (id) {
    case "github":
      return "A link to real work puts you ahead of most of the pile.";

    case "other_link":
      return "Noted — we open every link.";

    case "school":
      return "We have never turned anyone down for where they go to school.";

    case "grade":
      if (/9th|10th/.test(value)) return "Starting this early is the whole point.";
      if (/12th|College/.test(value)) return "Good timing — most roles open for the summer.";
      return null;

    case "interest": {
      const keywords = INTEREST_SECTORS[value];
      if (!keywords) return "We will read for it — the network grows toward what people ask for.";
      const matches = rosterMatching(keywords);
      if (!matches.length) return `Nobody in ${value.toLowerCase()} yet — asking is how that changes.`;
      return `${plural(matches.length, "startup", "startups")} in the network ${
        matches.length === 1 ? "works" : "work"
      } near ${value.toLowerCase()} right now.`;
    }

    case "chapter":
    case "city":
      return /online|remote/i.test(value)
        ? "Most of the network is remote, so online is a real answer."
        : `We will look for who is near ${value}.`;

    case "startup_picks": {
      const picks = splitValues(value).filter((pick) => pick !== "Other");
      if (!picks.length) return "Open to anything is a real answer.";
      return `${plural(picks.length, "pick", "picks")}. we match on these first.`;
    }

    case "letter":
      return "That is the part people remember you by.";

    case "stage":
      return value === "Idea"
        ? "An idea-stage team can still hand someone one real thing to ship."
        : null;

    case "paid":
      return value === "no"
        ? "Unpaid is allowed — we will help you shape it into real learning."
        : null;

    case "minors_ok":
      return value === "yes"
        ? "Most of the network is under 18, so that opens the whole pool."
        : "Noted — we will only send you people who are 18 or over.";

    case "advisor_status":
      return value === "Yes, confirmed" ? "Good — that is one less thing to sort out." : null;

    case "cofounders":
      return value === "yes" ? "Noted — we will want to meet them too." : null;

    default:
      return null;
  }
}
