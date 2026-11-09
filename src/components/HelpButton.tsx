"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { helpHref } from "@/lib/nav";

/**
 * The one Help button: same words, same top-right spot, on every page.
 * It opens the help topic for the page the Person is on.
 */
export function HelpButton() {
  const pathname = usePathname();

  return (
    <div className="print:hidden max-w-2xl w-full mx-auto px-4 pt-4 sm:px-8 flex justify-end">
      {/* relative z-10: the Calculator page pulls its heading up beside Help (-mt-16,
          matching this row's pt-4 + min-h-12), so keep Help on top and tappable.
          Change this row's height and the calculator heading needs changing too. */}
      <Link
        href={helpHref(pathname)}
        aria-current={pathname === "/help" ? "page" : undefined}
        className="relative z-10 inline-flex items-center gap-2 bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-semibold rounded-full px-5 py-2 min-h-12 shadow-md hover:shadow-lg transition-all"
      >
        <CircleHelp aria-hidden="true" className="size-6" />
        Help
      </Link>
    </div>
  );
}
