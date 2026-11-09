import { describe, expect, it } from "vitest";
import {
  loadColorTheme,
  loadDarkMode,
  saveColorTheme,
  saveDarkMode,
  themeClasses,
} from "./theme";

/** A stand-in for localStorage, starting empty like a first visit. */
function storageWith(saved: Record<string, string> = {}) {
  const items = new Map(Object.entries(saved));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

describe("Colour theme: Warm Cream, Blue or High contrast", () => {
  it("gives a first-time visitor Warm Cream", () => {
    expect(loadColorTheme(storageWith())).toBe("warm-cream");
  });

  it("keeps a Person who chose Warm Cream before it was renamed", () => {
    expect(loadColorTheme(storageWith({ colorTheme: "sage" }))).toBe("warm-cream");
  });

  it("quietly moves a Person who had Green to Blue", () => {
    expect(loadColorTheme(storageWith({ colorTheme: "green" }))).toBe("blue");
  });

  it("remembers Blue and High contrast after a reload", () => {
    const storage = storageWith();
    saveColorTheme(storage, "high-contrast");
    expect(loadColorTheme(storage)).toBe("high-contrast");
    saveColorTheme(storage, "blue");
    expect(loadColorTheme(storage)).toBe("blue");
  });

  it("falls back to Warm Cream for anything it doesn't know", () => {
    expect(loadColorTheme(storageWith({ colorTheme: "purple" }))).toBe("warm-cream");
  });
});

describe("Dark mode: follows the device on a first visit, then the saved choice", () => {
  it("follows a device set to dark when nothing is saved", () => {
    expect(loadDarkMode(storageWith(), true)).toBe(true);
    expect(loadDarkMode(storageWith(), false)).toBe(false);
  });

  it("keeps the Person's saved choice whatever the device says", () => {
    expect(loadDarkMode(storageWith({ darkMode: "light" }), true)).toBe(false);
    expect(loadDarkMode(storageWith({ darkMode: "dark" }), false)).toBe(true);
  });

  it("remembers a choice made in Settings", () => {
    const storage = storageWith();
    saveDarkMode(storage, true);
    expect(loadDarkMode(storage, false)).toBe(true);
  });
});

describe("The classes put on the page", () => {
  it("adds nothing for Warm Cream in light mode", () => {
    expect(themeClasses("warm-cream", false)).toEqual([]);
  });

  it("adds the theme and dark together", () => {
    expect(themeClasses("high-contrast", true)).toEqual(["theme-high-contrast", "dark"]);
    expect(themeClasses("blue", false)).toEqual(["theme-blue"]);
  });
});
