/** How big the Person wants text across the whole app. */
export type TextSize = "normal" | "large" | "extra-large";

/** The part of browser storage this module needs (localStorage fits). */
export type TextSizeStorage = Pick<Storage, "getItem" | "setItem">;

const KEY = "textSize";

/** The Person's remembered Text size, or Large if they have never picked one. */
export function loadTextSize(storage: TextSizeStorage): TextSize {
  const saved = storage.getItem(KEY);
  if (saved === "normal" || saved === "extra-large") return saved;
  return "large";
}

/** Remembers the Person's Text size for next time. */
export function saveTextSize(storage: TextSizeStorage, size: TextSize): void {
  storage.setItem(KEY, size);
}

/** The three choices, smallest first, with the words the Person sees. */
export const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "large", label: "Large" },
  { id: "extra-large", label: "Extra large" },
];

/**
 * Puts a Text size on the page. Every size in the app is in rem, so changing
 * the root font size (see globals.css) grows text, buttons and spacing together.
 */
export function applyTextSize(size: TextSize): void {
  document.documentElement.dataset.textSize = size;
}
