import type { Bill } from "../types/bill";

/**
 * A calendar date in the Person's own time zone, written "YYYY-MM-DD".
 * Bill rules compare these, never clock times, so a Bill can't slip a day
 * because of UTC midnight.
 */
export type LocalDate = string;

export type BillStatus = "paid" | "overdue" | "due-today" | "due-soon" | "later";

/** The calendar date a moment falls on, where the Person is. */
export function toLocalDate(moment: Date): LocalDate {
  const y = moment.getFullYear();
  const m = String(moment.getMonth() + 1).padStart(2, "0");
  const d = String(moment.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today's date where the Person is. */
export function todayLocal(now: Date = new Date()): LocalDate {
  return toLocalDate(now);
}

/** Year, month (1–12) and day of a calendar date. */
function dateParts(date: LocalDate): [year: number, month: number, day: number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

/** The usual way a full date is shown, e.g. "8 November 2026". */
export const FULL_DATE = {
  day: "numeric",
  month: "long",
  year: "numeric",
} as const satisfies Intl.DateTimeFormatOptions;

/** Shows a calendar date in Australian English, e.g. "8 November". */
export function formatLocalDate(
  date: LocalDate,
  options: Intl.DateTimeFormatOptions,
): string {
  const [y, m, d] = dateParts(date);
  // Local midnight on that date, so the shown day can't shift
  return new Date(y, m - 1, d).toLocaleDateString("en-AU", options);
}

/** The calendar date `days` after `date`. Daylight saving can't shift it. */
function addDays(date: LocalDate, days: number): LocalDate {
  const [y, m, d] = dateParts(date);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}

/** How many days after today still count as Due soon. */
const DUE_SOON_DAYS = 7;

export function billStatus(bill: Bill, today: LocalDate): BillStatus {
  if (bill.paid) return "paid";
  // "YYYY-MM-DD" strings sort in date order, so plain comparison is safe
  if (bill.dueDate < today) return "overdue";
  if (bill.dueDate === today) return "due-today";
  if (bill.dueDate <= addDays(today, DUE_SOON_DAYS)) return "due-soon";
  return "later";
}

export interface BillsSummary {
  overdue: Bill[];
  dueToday: Bill[];
  dueSoon: Bill[];
  /** Sum of every unpaid Bill, whenever it is due. */
  totalOwing: number;
}

/** The answer to "Do I need to pay anything soon?" for a given today. */
export function summarise(bills: Bill[], today: LocalDate): BillsSummary {
  const withStatus = (status: BillStatus) =>
    bills.filter((b) => billStatus(b, today) === status);
  return {
    overdue: withStatus("overdue"),
    dueToday: withStatus("due-today"),
    dueSoon: withStatus("due-soon"),
    totalOwing: unpaidBills(bills).reduce((sum, b) => sum + b.amount, 0),
  };
}

/** Bills not yet marked paid, in their saved order. */
export function unpaidBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => !b.paid);
}

/** The browser-storage key Bills have always been saved under. */
const STORAGE_KEY = "bills";

/** The part of browser storage the bills module needs (localStorage fits). */
export type BillStorage = Pick<Storage, "getItem" | "setItem">;

/** The only place that reads saved Bills. */
export function loadBills(storage: BillStorage): Bill[] {
  const saved = storage.getItem(STORAGE_KEY);
  return saved ? (JSON.parse(saved) as Bill[]) : [];
}

/** The only place that writes saved Bills. */
export function saveBills(storage: BillStorage, bills: Bill[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

/** Bills (paid or not) due on one calendar date, for the calendar. */
export function billsDueOn(bills: Bill[], date: LocalDate): Bill[] {
  return bills.filter((b) => b.dueDate === date);
}

/**
 * An Australian financial year (1 July to 30 June) as calendar dates.
 * `offset` 0 is the year `today` falls in, -1 the one before.
 */
export function financialYear(
  today: LocalDate,
  offset: number,
): { start: LocalDate; end: LocalDate } {
  const [year, month] = dateParts(today);
  const startYear = (month >= 7 ? year : year - 1) + offset;
  return { start: `${startYear}-07-01`, end: `${startYear + 1}-06-30` };
}

/** Paid Bills due from `start` to `end` (both days included), earliest first. */
export function paidBillsBetween(
  bills: Bill[],
  start: LocalDate,
  end: LocalDate,
): Bill[] {
  return bills
    .filter((b) => b.paid && b.dueDate >= start && b.dueDate <= end)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
