"use client";

import { useState, useEffect, useRef } from "react";
import { Bill } from "@/types/bill";
import {
  confirmAmount,
  DAY_DATE,
  deleteBill,
  formatLocalDate,
  loadBills,
  markPaid,
  markUnpaid,
  nextBillFrom,
  saveBills,
  summarise,
  todayLocal,
  undoMarkPaid,
  type MarkPaidUndo,
} from "@/lib/bills";
import { TodayAnswer } from "@/components/TodayAnswer";
import { BillGroups } from "@/components/BillGroups";
import { CalendarView } from "@/components/CalendarView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ColorThemeToggle } from "@/components/ColorThemeToggle";
import { HomeScreenPill } from "@/components/HomeScreenPill";
import { UndoMessage } from "@/components/UndoMessage";
import { DeleteQuestion } from "@/components/DeleteQuestion";
import Link from "next/link";

/** Brings one Bill into the middle of the screen. */
function scrollToBill(id: string) {
  document
    .getElementById(`bill-${id}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** How long "Marked as paid — Undo" stays up. Generous, so nobody has to rush. */
const UNDO_SECONDS = 8;

export default function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  // Becomes true once saved bills have been read, so we never save over them by mistake
  const [loaded, setLoaded] = useState(false);
  // The calendar stays out of the way until the Person asks for it
  const [showCalendar, setShowCalendar] = useState(false);
  // The Bill just saved on the Add a bill page, waiting to be scrolled to once drawn
  const justAdded = useRef<string>(undefined);
  // What Undo needs while "Marked as paid — Undo" is showing
  const [undo, setUndo] = useState<MarkPaidUndo | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The Bill the Person asked to delete, while "Delete the … bill?" is showing
  const [askingToDelete, setAskingToDelete] = useState<Bill | null>(null);

  // Don't leave a timer running after leaving the page
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  useEffect(() => {
    setBills(loadBills(localStorage));
    // Mark as loaded, even when nothing was saved, so a new visitor starts with an empty list
    setLoaded(true);
    // Coming back from Add a bill: show the Person where their new Bill went
    const added = new URLSearchParams(window.location.search).get("added");
    if (added) {
      setHighlightedIds(new Set([added]));
      justAdded.current = added;
      // Tidy the address so a refresh doesn't highlight it again
      window.history.replaceState(null, "", "/");
    }
  }, []);

  useEffect(() => {
    // Runs once the loaded Bills are on screen
    if (!loaded || !justAdded.current) return;
    scrollToBill(justAdded.current);
    justAdded.current = undefined;
    const timer = setTimeout(() => setHighlightedIds(new Set()), 2500);
    return () => clearTimeout(timer);
  }, [loaded]);

  useEffect(() => {
      // Only save after the first read, otherwise an empty list would wipe saved bills
    if (loaded) {
      saveBills(localStorage, bills);
    }
  }, [bills, loaded]);

  // Worked out on every draw, never remembered, so it can't go stale overnight
  const today = todayLocal();
  const summary = summarise(bills, today);
  // The next Repeating bill that the last Mark as Paid brought in, if any
  const nextDue = undo ? nextBillFrom(bills, undo) : undefined;

  function togglePaid(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    if (bill.paid) {
      setBills(markUnpaid(bills, id));
      return;
    }
    // One tap: paid straight away, with today's date, and a chance to undo
    const result = markPaid(bills, id, todayLocal());
    setBills(result.bills);
    if (!result.undo) return;
    setUndo(result.undo);
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_SECONDS * 1000);
  }

  function handleUndo() {
    if (undo) setBills((prev) => undoMarkPaid(prev, undo));
    clearTimeout(undoTimer.current);
    setUndo(null);
  }

  function handleConfirmAmount(id: string, amount: number) {
    setBills((prev) => confirmAmount(prev, id, amount));
  }

  function askToDelete(id: string) {
    setAskingToDelete(bills.find((b) => b.id === id) ?? null);
  }

  function handleDeleteYes() {
    const bill = askingToDelete;
    if (bill) setBills((prev) => deleteBill(prev, bill.id));
    setAskingToDelete(null);
  }

  function handleSelectDay(dayBills: Bill[]) {
    setHighlightedIds(new Set(dayBills.map((b) => b.id)));
    const firstId = dayBills[0]?.id;
    if (firstId) scrollToBill(firstId);

    setTimeout(() => setHighlightedIds(new Set()), 2500);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto w-full">
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
            Tap &ldquo;+ Add a bill&rdquo; to add your first bill.
          </p>
        </div>
      )}

      <Link
        href="/add"
        className="block w-full text-center bg-[var(--accent-button-bg)] text-white text-2xl font-semibold rounded-2xl py-5 mb-8 shadow-md hover:bg-[var(--accent-button-hover)] hover:shadow-lg transition-all"
      >
        + Add a bill
      </Link>

      <BillGroups
        summary={summary}
        paid={bills.filter((b) => b.paid)}
        today={today}
        highlightedIds={highlightedIds}
        onTogglePaid={togglePaid}
        onDelete={askToDelete}
        onConfirmAmount={handleConfirmAmount}
      />

      <div className="flex flex-wrap gap-3 mt-8 mb-6">
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


      <HomeScreenPill />

      <UndoMessage
        shown={undo !== null}
        next={nextDue && formatLocalDate(nextDue.dueDate, DAY_DATE)}
        onUndo={handleUndo}
      />

      <DeleteQuestion
        bill={askingToDelete}
        onYes={handleDeleteYes}
        onNo={() => setAskingToDelete(null)}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <ThemeToggle />
        <ColorThemeToggle />
      </div>
    </main>
  );
}
