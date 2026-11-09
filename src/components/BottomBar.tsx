"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleCheckBig, House, Wrench, type LucideIcon } from "lucide-react";
import { TABS, currentTab, type Tab } from "@/lib/nav";

const ICONS: Record<Tab, LucideIcon> = {
  "my-bills": House,
  "paid-bills": CircleCheckBig,
  "handy-tools": Wrench,
};

/**
 * The bar that never moves: the Person's one reliable way home from anywhere.
 * Each button is an icon plus a word, and the current page's button is filled in.
 */
export function BottomBar() {
  const active = currentTab(usePathname());

  // Tells the page how tall the bar really is (its words wrap at bigger Text
  // sizes, and the phone's safe area is added), as --bottom-bar-height.
  // The Calculator uses it to fit its keypad above the bar.
  const bar = useRef<HTMLElement>(null);
  // A layout effect, so the first paint already has the right height
  useLayoutEffect(() => {
    const nav = bar.current;
    if (!nav) return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty("--bottom-bar-height", `${nav.offsetHeight}px`);
    publish();
    // And again whenever it changes, such as a new Text size or turning the phone
    const observer = new ResizeObserver(publish);
    observer.observe(nav, { box: "border-box" });
    return () => {
      observer.disconnect();
      root.style.removeProperty("--bottom-bar-height");
    };
  }, []);

  return (
    <nav
      ref={bar}
      aria-label="Main"
      className="print:hidden fixed inset-x-0 bottom-0 z-40 bg-[var(--bg-card)] border-t-2 border-[var(--border-default)] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="max-w-2xl mx-auto grid grid-cols-3 gap-2 px-2 py-2">
        {TABS.map((tab) => {
          const Icon = ICONS[tab.id];
          const isCurrent = tab.id === active;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-16 rounded-xl px-1 py-2 text-lg font-semibold leading-tight text-center ${
                  isCurrent
                    ? "bg-[var(--accent-button-bg)] text-[var(--on-accent)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--calendar-hover-bg)]"
                }`}
              >
                <Icon aria-hidden="true" className="size-7" strokeWidth={2.25} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
