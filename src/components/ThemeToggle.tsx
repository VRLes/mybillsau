"use client";

import { useEffect, useState } from "react";
import { getSavedColorTheme, getSavedDarkMode, applyTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [hasToggled, setHasToggled] = useState(false);

  useEffect(() => {
    const theme = getSavedColorTheme();
    const dark = getSavedDarkMode();
    setIsDark(dark);
    applyTheme(theme, dark);
  }, []);

  function toggleTheme() {
    const theme = getSavedColorTheme();
    const next = !isDark;
    setIsDark(next);
    applyTheme(theme, next);

    if (!hasToggled) {
      setShowMessage(true);
      setHasToggled(true);
      setTimeout(() => setShowMessage(false), 4000);
    }
  }

  return (
    <div>
      <button
        onClick={toggleTheme}
        className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all"
      >
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </button>
      {showMessage && (
        <p className="mt-2 text-[var(--text-secondary)] text-base">
          {isDark
            ? "You're now in dark mode — tap the button again to switch back."
            : "You're back in light mode."}
        </p>
      )}
    </div>
  );
}