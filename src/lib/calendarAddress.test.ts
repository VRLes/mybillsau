import { describe, expect, it } from "vitest";
import { calendarFromAddress, addressWithCalendar } from "./calendarAddress";

// 9 November 2026, the day these tests stand on
const TODAY = new Date(2026, 10, 9);

describe("calendarFromAddress: is the Calendar open, and on which month", () => {
  it("stays closed when the address says nothing about the calendar", () => {
    expect(calendarFromAddress("", TODAY)).toBeNull();
    expect(calendarFromAddress("?highlight=abc", TODAY)).toBeNull();
  });

  it("opens on the month the address names", () => {
    expect(calendarFromAddress("?calendar=2026-12", TODAY)).toEqual(new Date(2026, 11, 1));
    expect(calendarFromAddress("?calendar=2027-01", TODAY)).toEqual(new Date(2027, 0, 1));
  });

  it("opens on this month when the month named can't be read", () => {
    const thisMonth = new Date(2026, 10, 1);
    for (const bad of ["", "2026-13", "2026-00", "2026-1", "26-12", "December", "2026-12-01"]) {
      expect(calendarFromAddress(`?calendar=${bad}`, TODAY)).toEqual(thisMonth);
    }
  });

  it("reads the calendar alongside other things in the address", () => {
    expect(calendarFromAddress("?highlight=abc&calendar=2026-03", TODAY)).toEqual(
      new Date(2026, 2, 1),
    );
  });
});

describe("addressWithCalendar: the address to show for the Calendar", () => {
  it("names the year and month of the month shown", () => {
    expect(addressWithCalendar("/", "", new Date(2026, 11, 15))).toBe("/?calendar=2026-12");
    expect(addressWithCalendar("/", "", new Date(2027, 0, 1))).toBe("/?calendar=2027-01");
  });

  it("replaces the month already in the address", () => {
    expect(addressWithCalendar("/", "?calendar=2026-11", new Date(2026, 11, 1))).toBe(
      "/?calendar=2026-12",
    );
  });

  it("takes the calendar out of the address when it is hidden", () => {
    expect(addressWithCalendar("/", "?calendar=2026-11", null)).toBe("/");
  });

  it("leaves everything else in the address alone", () => {
    expect(addressWithCalendar("/", "?highlight=abc", new Date(2026, 11, 1))).toBe(
      "/?highlight=abc&calendar=2026-12",
    );
    expect(addressWithCalendar("/", "?highlight=abc&calendar=2026-11", null)).toBe(
      "/?highlight=abc",
    );
  });

  it("reads back as the same month", () => {
    const month = new Date(2028, 1, 1);
    const address = addressWithCalendar("/", "", month);
    expect(calendarFromAddress(address.slice(1), TODAY)).toEqual(month);
  });
});
