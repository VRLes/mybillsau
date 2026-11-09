/**
 * Where the Person is in the app, worked out from the page address alone.
 * The bottom bar and the Help button both ask this module, so they can
 * never disagree about which page is which.
 */

export type Tab = "my-bills" | "paid-bills" | "handy-tools";

/** The three bottom bar buttons, in the order they appear. */
export const TABS: { id: Tab; label: string; href: string }[] = [
  { id: "my-bills", label: "My Bills", href: "/" },
  { id: "paid-bills", label: "Paid Bills", href: "/history" },
  { id: "handy-tools", label: "Handy tools", href: "/handy-tools" },
];

// Each page belongs to one tab (or none, like Help) and may have its own help topic
const PAGES: Record<string, { tab: Tab | null; helpTopic?: string }> = {
  "/": { tab: "my-bills" },
  "/add": { tab: "my-bills" },
  "/edit": { tab: "my-bills" },
  "/history": { tab: "paid-bills", helpTopic: "history" },
  "/handy-tools": { tab: "handy-tools" },
  "/calculator": { tab: "handy-tools", helpTopic: "calculator" },
  "/converter": { tab: "handy-tools", helpTopic: "converter" },
  "/help": { tab: null },
};

function page(pathname: string) {
  const tidy = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PAGES[tidy];
}

/** Which bottom bar button to light up, or null when none fits (Help). */
export function currentTab(pathname: string): Tab | null {
  return page(pathname)?.tab ?? null;
}

/** Where Help goes: this page's own topic when it has one, else the top of Help. */
export function helpHref(pathname: string): string {
  const topic = page(pathname)?.helpTopic;
  return topic ? `/help#${topic}` : "/help";
}
