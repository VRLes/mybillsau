/**
 * Colour contrast, as WCAG measures it: 1 (no difference) up to 21 (black on
 * white). Used by the colours test to keep every Colour theme easy to read.
 */

/** True for a 6-digit hex colour such as #1a2b3c. */
export function isHexColour(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** How far apart two colours are, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  if (!isHexColour(a) || !isHexColour(b)) {
    throw new Error(`Not a 6-digit hex colour: ${isHexColour(a) ? b : a}`);
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Text and its background: WCAG AAA. */
export const TEXT_MIN = 7;
/** Outlines, icons and focus rings against what is behind them. */
export const SHAPE_MIN = 3;
