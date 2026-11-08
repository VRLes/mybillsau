"use client";

import { useState, useEffect } from "react";
import { Bill } from "@/types/bill";
import {
  FULL_DATE,
  formatLocalDate,
  loadBills,
  saveBills,
  summarise,
  todayLocal,
} from "@/lib/bills";
import { BillIcon } from "@/components/BillIcon";
import { AddBillForm } from "@/components/AddBillForm";
import { ReminderBanner } from "@/components/ReminderBanner";
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
  // and always matches the banner
  const summary = summarise(bills, todayLocal());

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
    <main className="min-h-screen bg-[var(--bg-page)] p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        My Bills
      </h1>

      <HomeScreenPill />

      <div className="flex flex-wrap gap-3 mb-6">
        <ThemeToggle />
        <ColorThemeToggle />
      </div>

      <Link
        href="/history"
        className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all mb-6"
      >
        View paid bills history
      </Link>

      <Link
        href="/calculator"
        className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all mb-6 sm:ml-3"
      >
        Calculator
      </Link>

      <Link
        href="/converter"
        className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all mb-6 sm:ml-3"
      >
        Converter
      </Link>

      <ReminderBanner bills={bills} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">
            {summary.dueToday.length + summary.dueSoon.length}
          </p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Due today or in the next 7 days
          </p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-5 text-center">
          <p className="text-3xl font-bold text-red-600">
            {summary.overdue.length}
          </p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Overdue</p>
        </div>
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-5 text-center">
          <p className="text-3xl font-bold text-[var(--accent-text)]">
            ${summary.totalOwing.toFixed(2)}
          </p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Total owing
          </p>
        </div>
      </div>

      <AddBillForm onAdd={handleAdd} />

      <div className="mb-3">
        <Link
          href="/help#calendar"
          className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-full px-5 py-2 shadow-md hover:shadow-lg transition-all"
        >
          How does this work?
        </Link>
      </div>

      <CalendarView bills={bills} onSelectDay={handleSelectDay} />

      

        {loaded && bills.length === 0 && (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 mb-4 text-center">
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            No bills yet
          </p>
          <p className="text-lg text-[var(--text-secondary)] mt-2">
            Use the form above to add your first bill.
          </p>
        </div>
      )}

      <div className="space-y-4"> 
        {bills.map((bill) => (
          <div
            key={bill.id}
            id={`bill-${bill.id}`}
            className={`bg-[var(--bg-card)] rounded-2xl shadow-md hover:shadow-lg transition-all p-6 flex items-center gap-4 ${
              highlightedIds.has(bill.id)
                ? "ring-4 ring-[var(--accent-button-bg)]"
                : ""
            }`}
          >
            <BillIcon category={bill.category} />
            <div className="flex-1">
              <p className="text-xl font-semibold text-[var(--text-primary)]">
                {bill.name}
              </p>
              <p className="text-[var(--text-secondary)]">
                Due: {formatLocalDate(bill.dueDate, FULL_DATE)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                ${bill.amount.toFixed(2)}
              </p>
              <button
                onClick={() => togglePaid(bill.id)}
                className={
                  bill.paid
                    ? "text-[var(--accent-text)] font-semibold underline"
                    : "text-amber-600 font-semibold underline"
                }
              >
                {bill.paid ? "Paid" : "Mark as Paid"}
              </button>
              <button
                onClick={() => deleteBill(bill.id)}
                className="block mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
