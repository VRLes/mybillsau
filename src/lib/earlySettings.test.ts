import { describe, expect, it } from "vitest";
import { EARLY_SETTINGS_SCRIPT } from "./earlySettings";
import { loadColorTheme, themeClasses } from "./theme";

/**
 * Runs the early script against a pretend page and storage, and gives back
 * the classes it put on <html>.
 */
function classesAfterEarlyScript(saved: Record<string, string>, deviceIsDark = false) {
  const classes = new Set<string>();
  const document = {
    documentElement: {
      classList: { add: (name: string) => void classes.add(name) },
      setAttribute: () => {},
    },
  };
  const localStorage = { getItem: (key: string) => saved[key] ?? null };
  const matchMedia = () => ({ matches: deviceIsDark });
  const window = { matchMedia };
  new Function("document", "localStorage", "window", "matchMedia", EARLY_SETTINGS_SCRIPT)(
    document,
    localStorage,
    window,
    matchMedia,
  );
  return [...classes];
}

describe("The early script puts on the same Colour theme as theme.ts", () => {
  const cases: [string, Record<string, string>][] = [
    ["a first visit", {}],
    ["saved Blue", { colorTheme: "blue" }],
    ["saved Warm Cream", { colorTheme: "warm-cream" }],
    ["the old Sage name", { colorTheme: "sage" }],
    ["the old Green", { colorTheme: "green" }],
    ["saved High contrast", { colorTheme: "high-contrast" }],
    ["a value it doesn't know", { colorTheme: "purple" }],
  ];

  it.each(cases)("for %s", (_name, saved) => {
    const storage = { getItem: (key: string) => saved[key] ?? null, setItem: () => {} };
    expect(classesAfterEarlyScript(saved)).toEqual(themeClasses(loadColorTheme(storage), false));
  });

  it("opens a first visit in Blue, dark when the device is dark", () => {
    expect(classesAfterEarlyScript({}, true)).toEqual(["theme-blue", "dark"]);
  });
});
