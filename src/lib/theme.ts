export type ColorTheme = "sage" | "green" | "blue";

export function getSavedColorTheme(): ColorTheme {
  const saved = localStorage.getItem("colorTheme");
  if (saved === "green" || saved === "blue") return saved;
  return "sage";
}

export function getSavedDarkMode(): boolean {
  return localStorage.getItem("darkMode") === "dark";
}

export function applyTheme(theme: ColorTheme, isDark: boolean) {
  const html = document.documentElement;
  html.classList.remove("theme-green", "theme-blue", "dark");
  if (theme === "green") html.classList.add("theme-green");
  if (theme === "blue") html.classList.add("theme-blue");
  if (isDark) html.classList.add("dark");

  localStorage.setItem("colorTheme", theme);
  localStorage.setItem("darkMode", isDark ? "dark" : "light");
}