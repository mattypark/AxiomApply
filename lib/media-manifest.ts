/**
 * The three slots in "inside the work".
 *
 * Everything here is a placeholder until real footage exists — LinkedIn
 * recordings, call clips, whatever actually shows what an intern's week looks
 * like. Swapping one in is an edit to this file plus a file in /public/welcome;
 * the section's layout, sizing and captions never move.
 *
 * `kind` decides the element: "image" renders next/image, "video" renders a
 * muted autoplaying loop with `poster` as its first frame. A video with no
 * poster will pop in on load, so poster is required for that kind.
 */

export type MediaSlot =
  | {
      kind: "image";
      src: string;
      alt: string;
      /** Shown under the card. Keep it to a few words. */
      caption: string;
    }
  | {
      kind: "video";
      src: string;
      poster: string;
      alt: string;
      caption: string;
    };

export const workMedia: readonly MediaSlot[] = [
  {
    kind: "image",
    src: "/welcome/shot-2.svg",
    alt: "Placeholder — a working session at a startup",
    caption: "The standup you are actually in",
  },
  {
    kind: "image",
    src: "/welcome/shot-4.svg",
    alt: "Placeholder — an intern presenting work",
    caption: "Shipping something with your name on it",
  },
  {
    kind: "image",
    src: "/welcome/shot-7.svg",
    alt: "Placeholder — a call with a founder",
    caption: "A founder who knows your name",
  },
] as const;
