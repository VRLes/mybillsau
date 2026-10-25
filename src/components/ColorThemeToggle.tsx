"use client";

import { useEffect, useState } from "react";
import {
  ColorTheme,
  getSavedColorTheme,
  getSavedDarkMode,
  applyTheme,
} from "@/lib/theme";

const THEME_ORDER: ColorTheme[] = ["sage", "green", "blue"];
const THEME_LABELS: Record<ColorTheme, string> = {
  sage: "Warm Cream",
  green: "Green",
  blue: "Blue",
};

export function ColorThemeToggle() {
  const [theme, setTheme] = useState<ColorTheme>("sage");

  useEffect(() => {
    setTheme(getSavedColorTheme());
  }, []);

  function switchTheme() {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    const dark = getSavedDarkMode();
    setTheme(next);
    applyTheme(next, dark);
  }

  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];

  return (
    <button
      onClick={switchTheme}
      className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all"
    >
      Switch to {THEME_LABELS[nextTheme]} theme
    </button>
  );
}