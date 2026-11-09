"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  TEXT_SIZES,
  applyTextSize,
  loadTextSize,
  saveTextSize,
  type TextSize,
} from "@/lib/textSize";
import {
  COLOR_THEMES,
  applyTheme,
  deviceIsDark,
  loadColorTheme,
  loadDarkMode,
  saveColorTheme,
  saveDarkMode,
  type ColorTheme,
} from "@/lib/theme";

const BUTTON =
  "text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-shadow border-2";
const CHOSEN =
  "bg-[var(--accent-button-bg)] border-[var(--accent-button-bg)] text-[var(--on-accent)]";
const NOT_CHOSEN =
  "bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)]";

/**
 * A small sample of each Colour theme (its page, card and button colours in
 * light mode), so a Helper can see what they are choosing before tapping.
 */
const SAMPLES: Record<ColorTheme, [string, string, string]> = {
  "warm-cream": ["#f2ebdf", "#fffdf8", "#6b4116"],
  blue: ["#e8f0f5", "#fbfdfe", "#1a4e69"],
  "high-contrast": ["#ffffff", "#ffffff", "#000000"],
};

/**
 * The one place for set-up choices a Person rarely changes, kept at the
 * bottom of My Bills so it never gets in the way of their bills. Every choice
 * shows all its options at once, with the current one filled in and ticked.
 */
export function Settings() {
  const [textSize, setTextSize] = useState<TextSize>("large");
  const [theme, setTheme] = useState<ColorTheme>("warm-cream");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setTextSize(loadTextSize(localStorage));
    setTheme(loadColorTheme(localStorage));
    setDark(loadDarkMode(localStorage, deviceIsDark()));
  }, []);

  function chooseTextSize(size: TextSize) {
    setTextSize(size);
    saveTextSize(localStorage, size);
    applyTextSize(size);
  }

  function chooseTheme(next: ColorTheme) {
    setTheme(next);
    saveColorTheme(localStorage, next);
    applyTheme(next, dark);
  }

  function chooseDark(next: boolean) {
    setDark(next);
    saveDarkMode(localStorage, next);
    applyTheme(theme, next);
  }

  return (
    <section
      id="settings"
      aria-labelledby="settings-heading"
      className="mt-10 mb-6 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md p-5 sm:p-6"
    >
      <h2
        id="settings-heading"
        className="text-3xl font-bold mb-5 text-[var(--text-primary)]"
      >
        Settings
      </h2>

      <Choices title="Text size">
        {TEXT_SIZES.map(({ id, label }) => (
          <Choice key={id} chosen={id === textSize} onChoose={() => chooseTextSize(id)}>
            {label}
          </Choice>
        ))}
      </Choices>

      <Choices title="Colour theme">
        {COLOR_THEMES.map(({ id, label }) => (
          <Choice key={id} chosen={id === theme} onChoose={() => chooseTheme(id)}>
            <Sample colours={SAMPLES[id]} />
            {label}
          </Choice>
        ))}
      </Choices>

      <Choices title="Light or dark">
        <Choice chosen={!dark} onChoose={() => chooseDark(false)}>
          Light
        </Choice>
        <Choice chosen={dark} onChoose={() => chooseDark(true)}>
          Dark
        </Choice>
      </Choices>

      <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
        Home screen
      </h3>
      <Link
        href="/help#home-screen"
        className={`inline-block ${BUTTON} ${NOT_CHOSEN}`}
      >
        How to save this app to your home screen
      </Link>
    </section>
  );
}

function Choices({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
        {title}
      </h3>
      <div role="group" aria-label={title} className="flex flex-wrap gap-3 mb-6">
        {children}
      </div>
    </>
  );
}

function Choice({
  chosen,
  onChoose,
  children,
}: {
  chosen: boolean;
  onChoose: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      aria-pressed={chosen}
      className={`${BUTTON} ${chosen ? CHOSEN : NOT_CHOSEN} inline-flex items-center gap-2`}
    >
      {chosen && <span aria-hidden="true">✓</span>}
      {children}
    </button>
  );
}

/** Three small squares showing a Colour theme's page, card and button. */
function Sample({ colours }: { colours: [string, string, string] }) {
  return (
    <span aria-hidden="true" className="inline-flex rounded-md overflow-hidden border-2 border-current">
      {colours.map((colour, i) => (
        <span key={i} className="w-4 h-6" style={{ background: colour }} />
      ))}
    </span>
  );
}
