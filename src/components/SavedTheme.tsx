"use client";

import { useEffect } from "react";
import { applyTheme, getSavedColorTheme, getSavedDarkMode } from "@/lib/theme";

/**
 * Puts the Person's saved colour theme and dark mode back on, whichever page
 * the app is opened on. Before this, only My Bills did it, so opening
 * Paid Bills directly showed the default colours.
 */
export function SavedTheme() {
  useEffect(() => {
    applyTheme(getSavedColorTheme(), getSavedDarkMode());
  }, []);
  return null;
}
