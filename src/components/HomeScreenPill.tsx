"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function HomeScreenPill() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Already saved on an earlier visit — stay hidden
    if (localStorage.getItem("homeScreenSaved") === "yes") {
      return;
    }

    // Opened right now from the home screen icon? Then it's saved — hide for good.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      localStorage.setItem("homeScreenSaved", "yes");
      return;
    }

    // Not saved yet — show the pill
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/help#home-screen"
      className="flex items-center justify-between gap-3 mb-6 rounded-2xl border-4 border-amber-500 bg-amber-50 px-5 py-4 shadow-md hover:shadow-lg transition-all"
    >
      <div>
        <p className="text-xl font-bold text-amber-800">
          📱 Tap or Click Here to Save This App
        </p>
        <p className="text-base text-amber-700 mt-1">
          Works on your phone, iPad, tablet or computer. It will disappear once it&apos;s saved.
        </p>
      </div>
      <span className="text-4xl text-amber-600 flex-shrink-0">›</span>
    </Link>
  );
}