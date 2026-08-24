import type { ReactNode } from "react";
import { CornerMenu } from "@/components/site/CornerMenu";

/**
 * The careers surface carries its own navigation.
 *
 * The welcome header is a scroll-reactive bar built for the long-scroll pitch;
 * these pages are read standing still, so the corner menu sits in the bottom
 * right instead and stays within reach the whole way down a role page.
 */
export default function CareersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CornerMenu />
    </>
  );
}
