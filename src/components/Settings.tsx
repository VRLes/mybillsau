"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TEXT_SIZES,
  applyTextSize,
  loadTextSize,
  saveTextSize,
  type TextSize,
} from "@/lib/textSize";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ColorThemeToggle } from "@/components/ColorThemeToggle";

const BUTTON =
  "text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-shadow border-2";

/**
 * The one place for set-up choices a Person rarely changes, kept at the
 * bottom of My Bills so it never gets in the way of their bills.
 */
export function Settings() {
  const [textSize, setTextSize] = useState<TextSize>("large");

  useEffect(() => {
    setTextSize(loadTextSize(localStorage));
  }, []);

  function chooseTextSize(size: TextSize) {
    setTextSize(size);
    saveTextSize(localStorage, size);
    applyTextSize(size);
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

      <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
        Text size
      </h3>
      <div role="group" aria-label="Text size" className="flex flex-wrap gap-3 mb-6">
        {TEXT_SIZES.map(({ id, label }) => {
          const chosen = id === textSize;
          return (
            <button
              key={id}
              onClick={() => chooseTextSize(id)}
              aria-pressed={chosen}
              className={`${BUTTON} ${
                chosen
                  ? "bg-[var(--accent-button-bg)] border-[var(--accent-button-bg)] text-white"
                  : "bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)]"
              }`}
            >
              {chosen && <span aria-hidden="true">✓ </span>}
              {label}
            </button>
          );
        })}
      </div>

      <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
        Colours
      </h3>
      <div className="flex flex-wrap gap-3 mb-6">
        <ThemeToggle />
        <ColorThemeToggle />
      </div>

      <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
        Home screen
      </h3>
      <Link
        href="/help#home-screen"
        className={`inline-block ${BUTTON} bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)]`}
      >
        How to save this app to your home screen
      </Link>
    </section>
  );
}
