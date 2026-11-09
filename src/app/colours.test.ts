import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio, isHexColour, SHAPE_MIN, TEXT_MIN } from "../lib/contrast";

/**
 * Every Colour theme, light and dark, must stay easy to read for a Person
 * with low vision or colour blindness. This reads the real colours from
 * globals.css, so a future colour change that breaks the rules fails here.
 */

const css = readFileSync(join(__dirname, "globals.css"), "utf8");

/** The colour settings inside one CSS rule, such as `.theme-blue.dark`. */
function rule(selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) return {};
  return Object.fromEntries(
    [...match[2].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
}

/** The colours in force for a theme, layered the way the browser does it. */
function colours(theme: string, dark: boolean) {
  const layers = [":root"];
  if (dark) layers.push(".dark");
  if (theme) layers.push(theme);
  if (theme && dark) layers.push(`${theme}.dark`);
  return Object.assign({}, ...layers.map(rule)) as Record<string, string>;
}

const THEMES = [
  { name: "Warm Cream", selector: "" },
  { name: "Blue", selector: ".theme-blue" },
  { name: "High contrast", selector: ".theme-high-contrast" },
];

/** [what it is, foreground setting, background setting] */
const TEXT_PAIRS = [
  ["main text on a card", "text-primary", "bg-card"],
  ["main text on the page", "text-primary", "bg-page"],
  ["secondary text on a card", "text-secondary", "bg-card"],
  ["secondary text on the page", "text-secondary", "bg-page"],
  ["links on a card", "accent-text", "bg-card"],
  ["links on the page", "accent-text", "bg-page"],
  ["button label", "on-accent", "accent-button-bg"],
  ["button label on hover", "on-accent", "accent-button-hover"],
  ["all-clear banner text", "banner-ok-text", "banner-ok-bg"],
  ["Overdue text", "status-overdue-text", "status-overdue-bg"],
  ["main text on an Overdue card", "text-primary", "status-overdue-bg"],
  ["secondary text on an Overdue card", "text-secondary", "status-overdue-bg"],
  ["links on an Overdue card", "accent-text", "status-overdue-bg"],
] as const;

const SHAPE_PAIRS = [
  ["card outline against the card", "border-default", "bg-card"],
  ["card outline against the page", "border-default", "bg-page"],
  ["Overdue outline", "status-overdue-border", "status-overdue-bg"],
  ["Overdue icon on a card", "status-overdue-text", "bg-card"],
  ["bill icon", "icon-text", "icon-bg"],
  ["today on the calendar", "calendar-today-border", "bg-card"],
  ["paid tick on the calendar", "calendar-paid-dot", "bg-card"],
  ["all-clear banner outline", "banner-ok-border", "banner-ok-bg"],
  ["button against the page", "accent-button-bg", "bg-page"],
  ["button against a card", "accent-button-bg", "bg-card"],
  ["focus ring against the page", "focus-ring", "bg-page"],
  ["focus ring against a card", "focus-ring", "bg-card"],
] as const;

describe.each(THEMES)("$name colours", ({ selector }) => {
  describe.each([
    { mode: "light", dark: false },
    { mode: "dark", dark: true },
  ])("in $mode mode", ({ dark }) => {
    const c = colours(selector, dark);

    it("uses only valid 6-digit colours", () => {
      for (const [name, value] of Object.entries(c)) {
        expect(isHexColour(value), `--${name}: ${value}`).toBe(true);
      }
    });

    it.each(TEXT_PAIRS)(`%s reaches ${TEXT_MIN}:1`, (_, fg, bg) => {
      expect(contrastRatio(c[fg], c[bg])).toBeGreaterThanOrEqual(TEXT_MIN);
    });

    it.each(SHAPE_PAIRS)(`%s reaches ${SHAPE_MIN}:1`, (_, fg, bg) => {
      expect(contrastRatio(c[fg], c[bg])).toBeGreaterThanOrEqual(SHAPE_MIN);
    });
  });
});

describe("Colour themes on offer", () => {
  it("has no Green theme any more", () => {
    expect(css).not.toMatch(/\.theme-green/);
  });
});
