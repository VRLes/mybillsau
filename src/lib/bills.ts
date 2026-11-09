import type { Bill, HowOften } from "../types/bill";

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

/** How many months one period of a Repeating bill lasts. */
const MONTHS_PER_PERIOD: Record<Exclude<HowOften, "once">, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/**
 * The due date one period after `date`, for the next Bill in a series.
 * `dueDay` is the day of the month the series is due on (the first Bill's
 * day). A month too short for it uses its last day instead (31 Jan to 28 or
 * 29 Feb), and the series goes back to `dueDay` once the months allow.
 */
export function nextDueDate(
  date: LocalDate,
  howOften: Exclude<HowOften, "once">,
  dueDay: number = dateParts(date)[2],
): LocalDate {
  const [y, m] = dateParts(date);
  // Month numbers past 12 roll into the next year; day 0 is the month before's last day
  const monthIndex = m - 1 + MONTHS_PER_PERIOD[howOften];
  const lastDay = new Date(Date.UTC(y, monthIndex + 1, 0)).getUTCDate();
  const next = new Date(Date.UTC(y, monthIndex, Math.min(dueDay, lastDay)));
  return next.toISOString().slice(0, 10);
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

/** A Bill's How often. Bills saved before How often existed are Just once. */
export function howOften(bill: Bill): HowOften {
  return bill.howOften ?? "once";
}

/** How often, in the words the Person sees. */
export const HOW_OFTEN_WORDS: Record<HowOften, string> = {
  once: "Just once",
  monthly: "Every month",
  quarterly: "Every 3 months",
  yearly: "Every year",
};

/** What the Person fills in on the Add a bill or Edit bill page. */
export type NewBill = Pick<Bill, "name" | "amount" | "dueDate" | "category"> & {
  howOften?: HowOften;
};

/**
 * Adds a new, unpaid Bill to the end of the list. A Repeating bill starts a
 * series of its own; a Just once Bill is saved exactly as Bills always were.
 */
export function addBill(bills: Bill[], details: NewBill, id: string): Bill[] {
  const { howOften = "once", ...rest } = details;
  const bill: Bill =
    howOften === "once"
      ? { id, ...rest, paid: false }
      : {
          id,
          ...rest,
          paid: false,
          howOften,
          seriesId: id,
          dueDay: dateParts(rest.dueDate)[2],
        };
  return [...bills, bill];
}

/** Removes one Bill for good. Every other Bill stays as it was, in order. */
export function deleteBill(bills: Bill[], id: string): Bill[] {
  return bills.filter((b) => b.id !== id);
}

/** A copy of the Bill without some of its optional fields. */
function without(
  bill: Bill,
  ...fields: ("paidDate" | "estimated" | "howOften" | "seriesId" | "dueDay")[]
): Bill {
  const copy = { ...bill };
  for (const field of fields) delete copy[field];
  return copy;
}

/** A Bill's details as the Person sees them on the Add or Edit bill page. */
export function billDetails(bill: Bill): NewBill {
  const { name, amount, dueDate, category } = bill;
  return { name, amount, dueDate, category, howOften: howOften(bill) };
}

/**
 * A series id for a Bill starting to repeat: its own id, unless an old
 * series already uses that (it was the first Bill of a series it left), so
 * it can never rejoin a series that has an open Bill of its own (ADR 0001).
 */
function freshSeriesId(bills: Bill[], bill: Bill): string {
  const taken = new Set(
    bills.filter((b) => b.id !== bill.id).map((b) => b.seriesId),
  );
  let seriesId = bill.id;
  for (let n = 2; taken.has(seriesId); n++) seriesId = `${bill.id}-${n}`;
  return seriesId;
}

/**
 * The Person or a Helper fixes a Bill's details. Saving always confirms an
 * Estimated amount, changed or not. Turning a Just once Bill into a
 * Repeating bill starts a series of its own; turning it back to Just once
 * takes it out of its series. Every other Bill stays exactly as it was.
 */
export function editBill(bills: Bill[], id: string, details: NewBill): Bill[] {
  const { howOften: newHowOften = "once", ...fields } = details;
  return bills.map((b) => {
    if (b.id !== id) return b;
    const edited = {
      ...without(b, "estimated", "howOften", "seriesId", "dueDay"),
      ...fields,
    };
    if (newHowOften === "once") return edited;
    // A moved due date sets a new day of the month; an unchanged one keeps
    // the series day, so a clamped 28 Feb can still go back to the 31st
    const dueDay =
      b.dueDay !== undefined && fields.dueDate === b.dueDate
        ? b.dueDay
        : dateParts(fields.dueDate)[2];
    const seriesId = b.seriesId ?? freshSeriesId(bills, b);
    return { ...edited, howOften: newHowOften, seriesId, dueDay };
  });
}

/** Every Bill in the same repeating series as `bill` (none for Just once). */
function seriesOf(bills: Bill[], bill: Bill): Bill[] {
  return bill.seriesId === undefined
    ? []
    : bills.filter((b) => b.seriesId === bill.seriesId);
}

/**
 * What Undo needs to put a Mark as Paid back: the Bill as it was just before,
 * and the next Bill that appeared if it was a Repeating bill.
 */
export interface MarkPaidUndo {
  before: Bill;
  nextId?: string;
}

/**
 * The Bill that follows a Repeating bill: one period after the latest Bill in
 * its series (so no period is ever added twice), with the amount just paid
 * copied as an Estimated amount. Undefined for a Just once Bill.
 */
function nextBillAfter(bills: Bill[], bill: Bill): Bill | undefined {
  const schedule = howOften(bill);
  if (schedule === "once" || bill.seriesId === undefined) return undefined;
  const latest = seriesOf(bills, bill).reduce((a, b) =>
    b.dueDate > a.dueDate ? b : a,
  );
  const dueDate = nextDueDate(latest.dueDate, schedule, bill.dueDay);
  return {
    // Unique: no other Bill in the series is due this late
    id: `${bill.seriesId}-${dueDate}`,
    name: bill.name,
    amount: bill.amount,
    dueDate,
    paid: false,
    category: bill.category,
    howOften: schedule,
    seriesId: bill.seriesId,
    dueDay: bill.dueDay,
    estimated: true,
  };
}

/**
 * Marks one Bill paid, with today as its paid date. A Repeating bill brings
 * in its next Bill, unless one in the series is already open (ADR 0001).
 */
export function markPaid(
  bills: Bill[],
  id: string,
  today: LocalDate,
): { bills: Bill[]; undo: MarkPaidUndo | undefined } {
  const before = bills.find((b) => b.id === id);
  if (!before) return { bills, undo: undefined };
  const marked = bills.map((b) =>
    b.id === id ? { ...b, paid: true, paidDate: today } : b,
  );
  const seriesStillOpen = seriesOf(bills, before).some(
    (b) => b.id !== id && !b.paid,
  );
  const next = seriesStillOpen ? undefined : nextBillAfter(bills, before);
  if (!next) return { bills: marked, undo: { before } };
  return { bills: [...marked, next], undo: { before, nextId: next.id } };
}

/**
 * The next Bill a Mark as Paid brought in, so the Person can be told when
 * it is due ("Next one due …").
 */
export function nextBillFrom(
  bills: Bill[],
  undo: MarkPaidUndo,
): Bill | undefined {
  return undo.nextId ? bills.find((b) => b.id === undo.nextId) : undefined;
}

/**
 * Undoes a Mark as Paid, putting that Bill back exactly as it was and
 * removing the next Bill it brought in.
 */
export function undoMarkPaid(bills: Bill[], undo: MarkPaidUndo): Bill[] {
  return bills
    .filter((b) => b.id !== undo.nextId)
    .map((b) => (b.id === undo.before.id ? undo.before : b));
}

/**
 * Marks a paid Bill unpaid again, forgetting its paid date. For a Repeating
 * bill, any other open Bill in its series goes, so only one is ever open.
 */
export function markUnpaid(bills: Bill[], id: string): Bill[] {
  const bill = bills.find((b) => b.id === id);
  if (!bill) return bills;
  const otherOpen = new Set(
    seriesOf(bills, bill)
      .filter((b) => b.id !== id && !b.paid)
      .map((b) => b.id),
  );
  return bills
    .filter((b) => !otherOpen.has(b.id))
    .map((b) => (b.id === id ? { ...without(b, "paidDate"), paid: false } : b));
}

/** True while an unpaid Bill's amount is an Estimated amount ("about $X"). */
export function isEstimated(bill: Bill): boolean {
  return bill.estimated === true && !bill.paid;
}

/**
 * The Person confirms an Estimated amount, as it was or changed. Either way
 * it stops being "about $X".
 */
export function confirmAmount(bills: Bill[], id: string, amount: number): Bill[] {
  return bills.map((b) =>
    b.id === id ? { ...without(b, "estimated"), amount } : b,
  );
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
