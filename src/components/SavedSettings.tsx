"use client";

import { useLayoutEffect } from "react";
import { applyTheme, getSavedColorTheme, getSavedDarkMode } from "@/lib/theme";
import { applyTextSize, loadTextSize } from "@/lib/textSize";

/**
 * Puts the Person's saved Settings back on (Text size, colour theme and dark
 * mode), whichever page the app is opened on. The script in <head> already
 * did this before the first draw; this runs again before paint once React has
 * loaded, because in development React clears what that script set on <html>.
 */
export function SavedSettings() {
  useLayoutEffect(() => {
    applyTheme(getSavedColorTheme(), getSavedDarkMode());
    applyTextSize(loadTextSize(localStorage));
  }, []);
  return null;
}
