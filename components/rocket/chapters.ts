import type { ShapeName } from "@/components/rocket/model";
import { startups } from "@/lib/site-data";

/**
 * The story told beside the pinned 3D stage, one chapter per screen of
 * scroll. Copy is Matthew's, from the rocket prototype. `detail` is the small
 * line that rises in during the pause — every one is a plain fact about how
 * Axiom works, or counted from the real roster.
 */

export type Chapter = {
  id: string;
  /** Short label on the ring. */
  label: string;
  shape: ShapeName;
  title: [string, string];
  body: string;
  detail: string;
};

export const CHAPTERS: Chapter[] = [
  {
    id: "launch",
    label: "launch",
    shape: "rocket",
    title: ["you apply ", "once."],
    body: "one application replaces the endless cold emails. we carry it from there.",
    detail: "one application · every startup in the network",
  },
  {
    id: "pile",
    label: "the pile",
    shape: "cards",
    title: ["we read ", "every one."],
    body: "no filters and no keyword scans. a person reads it, and you are matched by hand.",
    detail: "read by a person · an answer within 14 days",
  },
  {
    id: "intro",
    label: "the intro",
    shape: "network",
    title: ["the intro is ", "ours to make."],
    body: "founders hear about you from us, before they ever see a resume.",
    detail: `${startups.length} startups in the network`,
  },
  {
    id: "work",
    label: "the work",
    shape: "helix",
    title: ["try the work. ", "then decide."],
    body: "real internships at real startups, so you find out what you love by doing it.",
    detail: "remote · part-time · real work",
  },
  {
    id: "promise",
    label: "the promise",
    shape: "torus",
    title: ["students first, ", "always."],
    body: "axiom pathways is a nonprofit. it costs students nothing — not now, not later.",
    detail: "free for everyone",
  },
  {
    id: "ready",
    label: "ready",
    shape: "rocket",
    title: ["ready to ", "launch?"],
    body: "keep scrolling. it will be waiting for you at the end of the page.",
    detail: "the landing pad is at the bottom",
  },
];
