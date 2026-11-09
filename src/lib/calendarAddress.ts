/**
 * Whether the Calendar is open, and on which month, kept in the page address
 * as "?calendar=2026-12". The address survives going to Help and pressing
 * "Back to where I was", so the Person finds the Calendar as they left it.
 * Nothing is saved anywhere else: a fresh app open has no parameter, so the
 * Calendar starts closed.
 */

const PARAM = "calendar";
const YEAR_MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * The month the Calendar shows (its 1st), or null when the Calendar is closed.
 * A month that can't be read still opens the Calendar, on this month.
 */
export function calendarFromAddress(search: string, today: Date): Date | null {
  const value = new URLSearchParams(search).get(PARAM);
  if (value === null) return null;
  const match = YEAR_MONTH.exec(value);
  if (!match) return new Date(today.getFullYear(), today.getMonth(), 1);
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

/** The address with the Calendar open on `month`, or with it taken out when null. */
export function addressWithCalendar(
  pathname: string,
  search: string,
  month: Date | null,
): string {
  const params = new URLSearchParams(search);
  if (month) params.set(PARAM, yearMonth(month));
  else params.delete(PARAM);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function yearMonth(month: Date): string {
  const m = String(month.getMonth() + 1).padStart(2, "0");
  return `${month.getFullYear()}-${m}`;
}
