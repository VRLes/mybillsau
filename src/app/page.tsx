"use client";

import { useState, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
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
import { Settings } from "@/components/Settings";
import { UndoMessage } from "@/components/UndoMessage";
import { DeleteQuestion } from "@/components/DeleteQuestion";
import Link from "next/link";
import { savedStorage, useSaved, useSavedReady } from "@/lib/savedValue";
import { addressWithCalendar, calendarFromAddress } from "@/lib/calendarAddress";

/** Brings one Bill into the middle of the screen. */
function scrollToBill(id: string) {
  document
    .getElementById(`bill-${id}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** Before saved Bills are read: the server, and the first draw in the browser. */
const NO_BILLS: Bill[] = [];

/** Saves a change to the Bills, read fresh so nothing saved elsewhere is lost. */
function changeBills(change: (bills: Bill[]) => Bill[]) {
  saveBills(savedStorage, change(loadBills(savedStorage)));
}

/**
 * What the page address says: the Bill just saved on the Add or Edit bill page
 * ("?highlight="), so the Person can see where it went, and whether the
 * Calendar is open ("?calendar="). Read from the address itself (not
 * useSearchParams, which would stop the server drawing this page), and checked
 * again by React once Next has put the new address in place.
 */
const addressListeners = new Set<() => void>();
function subscribeToAddress(listener: () => void) {
  addressListeners.add(listener);
  return () => {
    addressListeners.delete(listener);
  };
}
function changeAddress(address: string) {
  window.history.replaceState(null, "", address);
  addressListeners.forEach((listener) => listener());
}
function billJustSaved(): string | null {
  return new URLSearchParams(window.location.search).get("highlight");
}
/** Takes "?highlight=" off the address, so a refresh doesn't light it up again. */
function tidyAddress() {
  const params = new URLSearchParams(window.location.search);
  params.delete("highlight");
  const query = params.toString();
  changeAddress(query ? `/?${query}` : "/");
}
/** The address's "?…" part, or "" on the server, where there is no address. */
function addressSearch(): string {
  return window.location.search;
}
/** Opens the Calendar on `month`, or closes it when null, by changing the address. */
function showCalendarOn(month: Date | null) {
  changeAddress(addressWithCalendar("/", window.location.search, month));
}
/** Brings the open Calendar into view. */
function scrollToCalendar() {
  document
    .getElementById("calendar")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** How long "Marked as paid — Undo" stays up. Generous, so nobody has to rush. */
const UNDO_SECONDS = 8;

export default function Home() {
  const bills = useSaved(loadBills, NO_BILLS);
  // Becomes true once saved bills have been read, so "No bills yet" never shows by mistake
  const loaded = useSavedReady();
  // Bills lit up from the calendar
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  // Coming back from Add or Edit bill: that Bill is lit up too
  const justSaved = useSyncExternalStore(subscribeToAddress, billJustSaved, () => null);
  const litIds = useMemo(
    () => (justSaved ? new Set([...highlightedIds, justSaved]) : highlightedIds),
    [highlightedIds, justSaved],
  );
  // The calendar stays out of the way until the Person asks for it. Open or
  // closed, and the month shown, live in the address, so coming back from Help
  // finds it as it was.
  const search = useSyncExternalStore(subscribeToAddress, addressSearch, () => "");
  const calendarMonth = useMemo(() => calendarFromAddress(search, new Date()), [search]);
  const showCalendar = calendarMonth !== null;
  // Whether the page has done its first look at the address, once Bills are on screen
  const arrived = useRef(false);
  // What Undo needs while "Marked as paid — Undo" is showing
  const [undo, setUndo] = useState<MarkPaidUndo | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The Bill the Person asked to delete, while "Delete the … bill?" is showing
  const [askingToDelete, setAskingToDelete] = useState<Bill | null>(null);

  // Don't leave a timer running after leaving the page
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  useEffect(() => {
    // Runs once the loaded Bills are on screen: show the Person where that Bill went
    if (!loaded || !justSaved) return;
    scrollToBill(justSaved);
    const timer = setTimeout(tidyAddress, 2500);
    return () => clearTimeout(timer);
  }, [loaded, justSaved]);

  useEffect(() => {
    // Coming back to an open Calendar (from Help, say): bring it into view, once
    if (!loaded || arrived.current) return;
    if (!showCalendar || justSaved) {
      arrived.current = true;
      return;
    }
    // After the browser puts back the old scroll position, which would undo this
    const timer = setTimeout(() => {
      arrived.current = true;
      scrollToCalendar();
    }, 150);
    return () => clearTimeout(timer);
  }, [loaded, showCalendar, justSaved]);

  // Worked out on every draw, never remembered, so it can't go stale overnight
  const today = todayLocal();
  const summary = summarise(bills, today);
  // The next Repeating bill that the last Mark as Paid brought in, if any
  const nextBill = undo ? nextBillFrom(bills, undo) : undefined;

  function togglePaid(id: string) {
    const bill = bills.find((b) => b.id === id);
    if (!bill) return;
    if (bill.paid) {
      changeBills((now) => markUnpaid(now, id));
      return;
    }
    // One tap: paid straight away, with today's date, and a chance to undo
    const result = markPaid(bills, id, todayLocal());
    saveBills(savedStorage, result.bills);
    if (!result.undo) return;
    setUndo(result.undo);
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_SECONDS * 1000);
  }

  function handleUndo() {
    if (undo) changeBills((now) => undoMarkPaid(now, undo));
    clearTimeout(undoTimer.current);
    setUndo(null);
  }

  function handleConfirmAmount(id: string, amount: number) {
    changeBills((now) => confirmAmount(now, id, amount));
  }

  function askToDelete(id: string) {
    setAskingToDelete(bills.find((b) => b.id === id) ?? null);
  }

  function handleDeleteYes() {
    const bill = askingToDelete;
    if (bill) changeBills((now) => deleteBill(now, bill.id));
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
        <div className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md p-6 mb-4 text-center">
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
        className="block w-full text-center bg-[var(--accent-button-bg)] text-[var(--on-accent)] text-2xl font-semibold rounded-2xl py-5 mb-8 shadow-md hover:bg-[var(--accent-button-hover)] hover:shadow-lg transition-all"
      >
        + Add a bill
      </Link>

      <BillGroups
        summary={summary}
        paid={bills.filter((b) => b.paid)}
        today={today}
        highlightedIds={litIds}
        onTogglePaid={togglePaid}
        onDelete={askToDelete}
        onConfirmAmount={handleConfirmAmount}
      />

      <div className="flex flex-wrap gap-3 mt-8 mb-6">
        <button
          onClick={() => showCalendarOn(showCalendar ? null : new Date())}
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

      {calendarMonth && (
        <CalendarView
          bills={bills}
          month={calendarMonth}
          onChangeMonth={showCalendarOn}
          onSelectDay={handleSelectDay}
        />
      )}

      <UndoMessage
        shown={undo !== null}
        nextDueText={nextBill && formatLocalDate(nextBill.dueDate, DAY_DATE)}
        onUndo={handleUndo}
      />

      <DeleteQuestion
        bill={askingToDelete}
        onYes={handleDeleteYes}
        onNo={() => setAskingToDelete(null)}
      />

      <Settings />
    </main>
  );
}
