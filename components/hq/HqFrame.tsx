import type { ReactNode } from "react";
import Image from "next/image";

/**
 * HQ's frame: the welcome page's mark and wordmark, the `.ms` type system,
 * a plain white ground (tables read better on white). No links out and no
 * links in: nothing on the site points here.
 */
export function HqFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ms flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-4 px-4 sm:h-20 sm:px-[6.5%]">
        <span className="flex shrink-0 items-center gap-2">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-8 w-8 object-contain" />
          <span className="text-[22px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
          <span className="ml-1 rounded-full bg-ms-mist px-2.5 py-1 text-[12px] font-medium text-ms-body">HQ</span>
        </span>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
