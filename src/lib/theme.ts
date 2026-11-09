/** The Colour theme the Person picked in Settings. */
export type ColorTheme = "warm-cream" | "blue" | "high-contrast";

/** The part of browser storage this module needs (localStorage fits). */
export type ThemeStorage = Pick<Storage, "getItem" | "setItem">;

const THEME_KEY = "colorTheme";
const DARK_KEY = "darkMode";

/** The three choices, with the words the Person sees. */
export const COLOR_THEMES: { id: ColorTheme; label: string }[] = [
  { id: "blue", label: "Blue" },
  { id: "warm-cream", label: "Warm Cream" },
  { id: "high-contrast", label: "High contrast" },
];

/**
 * The Person's remembered Colour theme, or Blue, the one the app starts on.
 * "sage" is Warm Cream's old saved name. Green was removed, so anyone who had
 * it gets Blue like everything else it doesn't know.
 */
export function loadColorTheme(storage: ThemeStorage): ColorTheme {
  const saved = storage.getItem(THEME_KEY);
  if (saved === "warm-cream" || saved === "sage") return "warm-cream";
  if (saved === "high-contrast") return "high-contrast";
  return "blue";
}

export function saveColorTheme(storage: ThemeStorage, theme: ColorTheme): void {
  storage.setItem(THEME_KEY, theme);
}

/**
 * Whether Dark mode is on. Until the Person (or a Helper) picks Light or Dark
 * in Settings, it follows the device's own setting.
 */
export function loadDarkMode(storage: ThemeStorage, deviceIsDark: boolean): boolean {
  const saved = storage.getItem(DARK_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return deviceIsDark;
}

export function saveDarkMode(storage: ThemeStorage, isDark: boolean): void {
  storage.setItem(DARK_KEY, isDark ? "dark" : "light");
}

/** True when the device is set to dark mode. */
export function deviceIsDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

/** The classes on <html> that switch the colours in globals.css. */
export function themeClasses(theme: ColorTheme, isDark: boolean): string[] {
  const classes = theme === "warm-cream" ? [] : [`theme-${theme}`];
  return isDark ? [...classes, "dark"] : classes;
}

/** Puts a Colour theme and Dark mode on the page. Does not save them. */
export function applyTheme(theme: ColorTheme, isDark: boolean): void {
  const html = document.documentElement;
  html.classList.remove("theme-blue", "theme-high-contrast", "dark");
  html.classList.add(...themeClasses(theme, isDark));
}
