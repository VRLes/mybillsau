import Link from "next/link";
import { ArrowLeftRight, Calculator } from "lucide-react";

const TOOLS = [
  {
    href: "/calculator",
    name: "Calculator",
    hint: "Add up sums, or add up your unpaid bills",
    Icon: Calculator,
  },
  {
    href: "/converter",
    name: "Converter",
    hint: "Change weights, lengths, cooking measures and more",
    Icon: ArrowLeftRight,
  },
];

/** Handy tools: the extras that live outside bill tracking, behind one button. */
export default function HandyToolsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Handy tools
      </h1>

      <ul className="space-y-4">
        {TOOLS.map(({ href, name, hint, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-4 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl px-5 py-5 shadow-md hover:shadow-lg transition-all"
            >
              <span className="shrink-0 flex items-center justify-center size-14 rounded-xl bg-[var(--icon-bg)] text-[var(--icon-text)]">
                <Icon aria-hidden="true" className="size-8" />
              </span>
              <span className="flex-1">
                <span className="block text-2xl font-bold text-[var(--text-primary)]">
                  {name}
                </span>
                <span className="block text-lg text-[var(--text-secondary)]">
                  {hint}
                </span>
              </span>
              <span aria-hidden="true" className="text-4xl text-[var(--text-secondary)]">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
