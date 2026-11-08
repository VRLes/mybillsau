"use client";

import { useState, useEffect } from "react";
import { Bill } from "@/types/bill";
import {
  loadBills,
  saveBills,
  summarise,
  todayLocal,
} from "@/lib/bills";
import { AddBillForm } from "@/components/AddBillForm";
import { TodayAnswer } from "@/components/TodayAnswer";
import { BillGroups } from "@/components/BillGroups";
import { CalendarView } from "@/components/CalendarView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ColorThemeToggle } from "@/components/ColorThemeToggle";
import { HomeScreenPill } from "@/components/HomeScreenPill";
import Link from "next/link";
export default function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  // Becomes true once saved bills have been read, so we never save over them by mistake
  const [loaded, setLoaded] = useState(false);
  // The calendar stays out of the way until the Person asks for it
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setBills(loadBills(localStorage));
    // Mark as loaded, even when nothing was saved, so a new visitor starts with an empty list
    setLoaded(true);
  }, []);

  useEffect(() => {
      // Only save after the first read, otherwise an empty list would wipe saved bills
    if (loaded) {
      saveBills(localStorage, bills);
    }
  }, [bills, loaded]);

  // Worked out on every draw, never remembered, so it can't go stale overnight
  const today = todayLocal();
  const summary = summarise(bills, today);

  function handleAdd(bill: Bill) {
    setBills((prev) => [...prev, bill]);
  }

  function togglePaid(id: string) {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)),
    );
  }

  function deleteBill(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?",
    );
    if (confirmed) {
      setBills((prev) => prev.filter((b) => b.id !== id));
    }
  }

  function handleSelectDay(dayBills: Bill[]) {
    const ids = new Set(dayBills.map((b) => b.id));
    setHighlightedIds(ids);

    const firstId = dayBills[0]?.id;
    if (firstId) {
      const el = document.getElementById(`bill-${firstId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setTimeout(() => setHighlightedIds(new Set()), 2500);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto">
      <TodayAnswer summary={summary} today={today} />

      <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">
        My Bills
      </h1>

      {loaded && bills.length === 0 && (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 mb-4 text-center">
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            No bills yet
          </p>
          <p className="text-lg text-[var(--text-secondary)] mt-2">
            Use the form below to add your first bill.
          </p>
        </div>
      )}

      <BillGroups
        summary={summary}
        paid={bills.filter((b) => b.paid)}
        today={today}
        highlightedIds={highlightedIds}
        onTogglePaid={togglePaid}
        onDelete={deleteBill}
      />

      <div className="mt-8">
        <AddBillForm onAdd={handleAdd} />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowCalendar((shown) => !shown)}
          aria-expanded={showCalendar}
          className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all"
        >
          {showCalendar ? "Hide calendar" : "Show calendar"}
        </button>
        {showCalendar && (
          <Link
            href="/help#calendar"
            className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-full px-5 py-3 shadow-md hover:shadow-lg transition-all"
          >
            How does this work?
          </Link>
        )}
      </div>

      {showCalendar && (
        <CalendarView bills={bills} onSelectDay={handleSelectDay} />
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href="/history"
          className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all"
        >
          View paid bills history
        </Link>
        <Link
          href="/calculator"
          className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all"
        >
          Calculator
        </Link>
        <Link
          href="/converter"
          className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all"
        >
          Converter
        </Link>
      </div>

      <HomeScreenPill />

      <div className="flex flex-wrap gap-3 mb-6">
        <ThemeToggle />
        <ColorThemeToggle />
      </div>
    </main>
  );
}
