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
  later: Bill[];
  /**
   * What the summary answer is built from: how many Bills to pay now or in
   * the next 7 days (Overdue, Due today, Due soon), and the one due soonest.
   */
  toPay: { count: number; next: Bill | undefined };
  /** Sum of every unpaid Bill, whenever it is due. */
  totalOwing: number;
}

/** Earliest due first; Bills due the same day keep their saved order. */
function byDueDate(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/** The answer to "Do I need to pay anything soon?" for a given today. */
export function summarise(bills: Bill[], today: LocalDate): BillsSummary {
  const withStatus = (status: BillStatus) =>
    byDueDate(bills.filter((b) => billStatus(b, today) === status));
  const overdue = withStatus("overdue");
  const dueToday = withStatus("due-today");
  const dueSoon = withStatus("due-soon");
  // Groups are already in date order, so joining them keeps the soonest first
  const toPay = [...overdue, ...dueToday, ...dueSoon];
  return {
    overdue,
    dueToday,
    dueSoon,
    later: withStatus("later"),
    toPay: { count: toPay.length, next: toPay[0] },
    totalOwing: unpaidBills(bills).reduce((sum, b) => sum + b.amount, 0),
  };
}

/** Weekday, day and month, e.g. "Sunday 8 November". */
export const DAY_DATE = {
  weekday: "long",
  day: "numeric",
  month: "long",
} as const satisfies Intl.DateTimeFormatOptions;

/**
 * When an unpaid Bill is due, in plain words: "due today", "due tomorrow",
 * "due Thursday 12 November", or "was due Tuesday 3 November" if Overdue.
 */
export function dueWords(bill: Bill, today: LocalDate): string {
  if (bill.dueDate === today) return "due today";
  if (bill.dueDate === addDays(today, 1)) return "due tomorrow";
  const date = formatLocalDate(bill.dueDate, DAY_DATE);
  return bill.dueDate < today ? `was due ${date}` : `due ${date}`;
}

/** The last day that still counts as Due soon, for "Due by <date>". */
export function dueSoonUntil(today: LocalDate): LocalDate {
  return addDays(today, DUE_SOON_DAYS);
}

/** Bills not yet marked paid, in their saved order. */
export function unpaidBills(bills: Bill[]): Bill[] {
  return bills.filter((b) => !b.paid);
}

/**
 * What Undo needs to put a Mark as Paid back: the Bill as it was just before.
 * Repeating bills (#10) will add the next Bill that appeared, so Undo can remove it.
 */
export interface MarkPaidUndo {
  before: Bill;
}

/** Marks one Bill paid, with today as its paid date. */
export function markPaid(
  bills: Bill[],
  id: string,
  today: LocalDate,
): { bills: Bill[]; undo: MarkPaidUndo | undefined } {
  const before = bills.find((b) => b.id === id);
  return {
    bills: bills.map((b) =>
      b.id === id ? { ...b, paid: true, paidDate: today } : b,
    ),
    undo: before && { before },
  };
}

/** Undoes a Mark as Paid, putting that Bill back exactly as it was. */
export function undoMarkPaid(bills: Bill[], undo: MarkPaidUndo): Bill[] {
  return bills.map((b) => (b.id === undo.before.id ? undo.before : b));
}

/** Marks a paid Bill unpaid again, forgetting its paid date. */
export function markUnpaid(bills: Bill[], id: string): Bill[] {
  return bills.map((b) => {
    if (b.id !== id) return b;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { paidDate, ...rest } = b;
    return { ...rest, paid: false };
  });
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

/**
 * The date a paid Bill counts under for tax time: its paid date, or its due
 * date for older Bills paid before paid dates were recorded.
 */
function taxDate(bill: Bill): LocalDate {
  return bill.paidDate ?? bill.dueDate;
}

/**
 * Paid Bills from `start` to `end` (both days included), earliest first.
 * Matches on paid date, falling back to due date when it was not recorded.
 */
export function paidBillsBetween(
  bills: Bill[],
  start: LocalDate,
  end: LocalDate,
): Bill[] {
  return bills
    .filter((b) => b.paid && taxDate(b) >= start && taxDate(b) <= end)
    .sort((a, b) => taxDate(a).localeCompare(taxDate(b)));
}

/** How many recently paid Bills Paid Bills opens with. */
export const RECENTLY_PAID_COUNT = 10;

/**
 * The answer to "did I pay it?": paid Bills, most recent paid date first.
 * Bills with no paid date come last, latest due first.
 */
export function recentlyPaid(
  bills: Bill[],
  count: number = RECENTLY_PAID_COUNT,
): Bill[] {
  const paid = bills.filter((b) => b.paid);
  const known = paid
    .filter((b) => b.paidDate)
    .sort((a, b) => b.paidDate!.localeCompare(a.paidDate!));
  const unknown = paid
    .filter((b) => !b.paidDate)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  return [...known, ...unknown].slice(0, count);
}

/** "Paid on Sunday 8 November", or "Paid (date not recorded)" for older Bills. */
export function paidWords(bill: Bill): string {
  return bill.paidDate
    ? `Paid on ${formatLocalDate(bill.paidDate, DAY_DATE)}`
    : "Paid (date not recorded)";
}
