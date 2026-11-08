import { describe, expect, it } from "vitest";
import type { Bill } from "../types/bill";
import {
  billStatus,
  billsDueOn,
  dueSoonUntil,
  dueWords,
  financialYear,
  formatLocalDate,
  loadBills,
  paidBillsBetween,
  saveBills,
  summarise,
  todayLocal,
} from "./bills";

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "1",
    name: "Electricity",
    amount: 100,
    dueDate: "2026-11-08",
    paid: false,
    category: "electricity",
    ...overrides,
  };
}

describe("Due today", () => {
  it("a Bill due 8 Nov, checked at 11 am on 8 Nov in Sydney, is Due today, not Overdue", () => {
    const now = new Date("2026-11-08T11:00:00+11:00");
    expect(billStatus(bill({ dueDate: "2026-11-08" }), todayLocal(now))).toBe(
      "due-today",
    );
  });

  it("is still Due today at 6 am and at 11:59 pm on the due date", () => {
    const early = todayLocal(new Date("2026-11-08T06:00:00+11:00"));
    const late = todayLocal(new Date("2026-11-08T23:59:00+11:00"));
    expect(billStatus(bill(), early)).toBe("due-today");
    expect(billStatus(bill(), late)).toBe("due-today");
  });
});

describe("Daylight saving", () => {
  // In Sydney, clocks jumped from 2 am to 3 am on Sunday 4 October 2026
  it("the date is right just before and after the clocks change", () => {
    expect(todayLocal(new Date("2026-10-04T00:30:00+10:00"))).toBe("2026-10-04");
    expect(todayLocal(new Date("2026-10-04T03:30:00+11:00"))).toBe("2026-10-04");
  });

  it("Due soon is still 7 calendar days when the clocks change in between", () => {
    expect(billStatus(bill({ dueDate: "2026-10-08" }), "2026-10-01")).toBe("due-soon");
    expect(billStatus(bill({ dueDate: "2026-10-09" }), "2026-10-01")).toBe("later");
  });
});

describe("Due soon", () => {
  const today = "2026-11-08";

  it("covers days 1 to 7 after today", () => {
    expect(billStatus(bill({ dueDate: "2026-11-09" }), today)).toBe("due-soon");
    expect(billStatus(bill({ dueDate: "2026-11-15" }), today)).toBe("due-soon");
  });

  it("excludes day 8, which is Later", () => {
    expect(billStatus(bill({ dueDate: "2026-11-16" }), today)).toBe("later");
  });

  it("counts across the end of a month", () => {
    expect(billStatus(bill({ dueDate: "2026-12-07" }), "2026-11-30")).toBe(
      "due-soon",
    );
    expect(billStatus(bill({ dueDate: "2026-12-08" }), "2026-11-30")).toBe(
      "later",
    );
  });
});

describe("Paid", () => {
  it("a paid Bill is Paid whatever its due date", () => {
    expect(billStatus(bill({ paid: true, dueDate: "2026-01-01" }), "2026-11-08")).toBe("paid");
    expect(billStatus(bill({ paid: true, dueDate: "2026-11-10" }), "2026-11-08")).toBe("paid");
  });
});

describe("Overdue", () => {
  it("starts the morning after the due date", () => {
    const nextMorning = todayLocal(new Date("2026-11-09T00:01:00+11:00"));
    expect(billStatus(bill({ dueDate: "2026-11-08" }), nextMorning)).toBe(
      "overdue",
    );
  });

  it("covers Bills due weeks ago, across a month and year boundary", () => {
    expect(billStatus(bill({ dueDate: "2025-12-31" }), "2026-01-01")).toBe(
      "overdue",
    );
  });
});

describe("Summary", () => {
  const today = "2026-11-08";
  const names = (bills: Bill[]) => bills.map((b) => b.name);

  it("with no Bills: nothing to pay and $0 owing", () => {
    expect(summarise([], today)).toEqual({
      overdue: [],
      dueToday: [],
      dueSoon: [],
      later: [],
      toPay: { count: 0, next: undefined },
      totalOwing: 0,
    });
  });

  it("with one Bill due today", () => {
    const s = summarise([bill({ name: "Water", amount: 45.5 })], today);
    expect(names(s.dueToday)).toEqual(["Water"]);
    expect(s.overdue).toEqual([]);
    expect(s.dueSoon).toEqual([]);
    expect(s.totalOwing).toBe(45.5);
  });

  it("with several Bills: groups each one and totals only unpaid Bills", () => {
    const s = summarise(
      [
        bill({ id: "a", name: "Rent", amount: 400, dueDate: "2026-11-01" }),
        bill({ id: "b", name: "Water", amount: 45.5, dueDate: "2026-11-08" }),
        bill({ id: "c", name: "Phone", amount: 30, dueDate: "2026-11-12" }),
        bill({ id: "d", name: "Internet", amount: 79.99, dueDate: "2026-11-14" }),
        bill({ id: "e", name: "Insurance", amount: 200, dueDate: "2026-12-20" }),
        bill({ id: "f", name: "Gas", amount: 60, dueDate: "2026-11-10", paid: true }),
      ],
      today,
    );
    expect(names(s.overdue)).toEqual(["Rent"]);
    expect(names(s.dueToday)).toEqual(["Water"]);
    expect(names(s.dueSoon)).toEqual(["Phone", "Internet"]);
    expect(names(s.later)).toEqual(["Insurance"]);
    // 400 + 45.50 + 30 + 79.99 + 200 (Gas is paid)
    expect(s.totalOwing).toBeCloseTo(755.49, 2);
  });
});

describe("Summary answer: what to pay soon", () => {
  const today = "2026-11-08";
  const names = (bills: Bill[]) => bills.map((b) => b.name);

  it("counts nothing when every Bill is Later or Paid", () => {
    const s = summarise(
      [
        bill({ dueDate: "2026-11-16" }),
        bill({ id: "p", dueDate: "2026-11-09", paid: true }),
      ],
      today,
    );
    expect(s.toPay).toEqual({ count: 0, next: undefined });
  });

  it("counts Overdue, Due today and Due soon Bills, not Later ones", () => {
    const s = summarise(
      [
        bill({ id: "a", dueDate: "2026-11-01" }),
        bill({ id: "b", dueDate: "2026-11-08" }),
        bill({ id: "c", dueDate: "2026-11-15" }),
        bill({ id: "d", dueDate: "2026-11-16" }),
      ],
      today,
    );
    expect(s.toPay.count).toBe(3);
  });

  it("the next Bill is the one due soonest, even if saved last", () => {
    const s = summarise(
      [
        bill({ id: "a", name: "Phone", dueDate: "2026-11-12" }),
        bill({ id: "b", name: "Electricity", amount: 120, dueDate: "2026-11-10" }),
      ],
      today,
    );
    expect(s.toPay.count).toBe(2);
    expect(s.toPay.next?.name).toBe("Electricity");
  });

  it("an Overdue Bill comes before one Due today", () => {
    const s = summarise(
      [
        bill({ id: "a", name: "Water", dueDate: "2026-11-08" }),
        bill({ id: "b", name: "Rent", dueDate: "2026-11-03" }),
      ],
      today,
    );
    expect(s.toPay.next?.name).toBe("Rent");
  });

  it("each group lists Bills earliest due first", () => {
    const s = summarise(
      [
        bill({ id: "a", name: "Phone", dueDate: "2026-11-14" }),
        bill({ id: "b", name: "Gas", dueDate: "2026-11-09" }),
      ],
      today,
    );
    expect(names(s.dueSoon)).toEqual(["Gas", "Phone"]);
  });
});

describe("Saying when a Bill is due", () => {
  const today = "2026-11-08";

  it("says today and tomorrow in plain words", () => {
    expect(dueWords(bill({ dueDate: "2026-11-08" }), today)).toBe("due today");
    expect(dueWords(bill({ dueDate: "2026-11-09" }), today)).toBe("due tomorrow");
  });

  it("gives the weekday and date for later days, so a week away can't be mistaken for today", () => {
    expect(dueWords(bill({ dueDate: "2026-11-12" }), today)).toBe(
      "due Thursday 12 November",
    );
    expect(dueWords(bill({ dueDate: "2026-11-15" }), today)).toBe(
      "due Sunday 15 November",
    );
  });

  it("says 'was due' for an Overdue Bill", () => {
    expect(dueWords(bill({ dueDate: "2026-11-03" }), today)).toBe(
      "was due Tuesday 3 November",
    );
  });

  it("Due soon runs until 7 days after today", () => {
    expect(dueSoonUntil(today)).toBe("2026-11-15");
  });
});

describe("Loading and saving", () => {
  function fakeStorage(initial: Record<string, string> = {}) {
    const data = { ...initial };
    return {
      getItem: (key: string) => data[key] ?? null,
      setItem: (key: string, value: string) => {
        data[key] = value;
      },
    };
  }

  it("a new visitor with nothing saved starts with no Bills", () => {
    expect(loadBills(fakeStorage())).toEqual([]);
  });

  it("Bills saved before this change load unchanged", () => {
    const savedBeforeThisChange =
      '[{"id":"1730000000000","name":"Electricity","amount":120.5,"dueDate":"2026-11-15","paid":false,"category":"electricity"},' +
      '{"id":"1730000000001","name":"Internet","amount":79.99,"dueDate":"2026-10-10","paid":true,"category":"internet"}]';
    expect(loadBills(fakeStorage({ bills: savedBeforeThisChange }))).toEqual([
      {
        id: "1730000000000",
        name: "Electricity",
        amount: 120.5,
        dueDate: "2026-11-15",
        paid: false,
        category: "electricity",
      },
      {
        id: "1730000000001",
        name: "Internet",
        amount: 79.99,
        dueDate: "2026-10-10",
        paid: true,
        category: "internet",
      },
    ]);
  });

  it("saved Bills come back the same when loaded", () => {
    const storage = fakeStorage();
    const bills = [bill({ id: "x", name: "Rent", amount: 400 })];
    saveBills(storage, bills);
    expect(loadBills(storage)).toEqual(bills);
  });
});

describe("Calendar days", () => {
  it("finds the Bills due on a given date", () => {
    const bills = [
      bill({ id: "a", name: "Rent", dueDate: "2026-11-08" }),
      bill({ id: "b", name: "Water", dueDate: "2026-11-09" }),
      bill({ id: "c", name: "Phone", dueDate: "2026-11-08", paid: true }),
    ];
    expect(billsDueOn(bills, "2026-11-08").map((b) => b.name)).toEqual([
      "Rent",
      "Phone",
    ]);
  });
});

describe("For tax time", () => {
  it("this financial year runs 1 July to 30 June", () => {
    expect(financialYear("2026-11-08", 0)).toEqual({
      start: "2026-07-01",
      end: "2027-06-30",
    });
  });

  it("before July, this financial year began the previous July", () => {
    expect(financialYear("2026-03-01", 0)).toEqual({
      start: "2025-07-01",
      end: "2026-06-30",
    });
  });

  it("on 1 July a new financial year has begun", () => {
    expect(financialYear("2026-07-01", 0).start).toBe("2026-07-01");
  });

  it("last financial year is the one before", () => {
    expect(financialYear("2026-11-08", -1)).toEqual({
      start: "2025-07-01",
      end: "2026-06-30",
    });
  });

  it("lists paid Bills due in the range, including both end days, earliest first", () => {
    const bills = [
      bill({ id: "a", name: "Late June", dueDate: "2026-06-30", paid: true }),
      bill({ id: "b", name: "Last day", dueDate: "2027-06-30", paid: true }),
      bill({ id: "c", name: "First day", dueDate: "2026-07-01", paid: true }),
      bill({ id: "d", name: "Unpaid", dueDate: "2026-08-01", paid: false }),
      bill({ id: "e", name: "Next year", dueDate: "2027-07-01", paid: true }),
    ];
    const names = paidBillsBetween(bills, "2026-07-01", "2027-06-30").map(
      (b) => b.name,
    );
    expect(names).toEqual(["First day", "Last day"]);
  });
});

describe("Showing dates", () => {
  it("shows the calendar date itself, not the day before or after", () => {
    expect(formatLocalDate("2026-11-08", { day: "numeric", month: "long" })).toBe(
      "8 November",
    );
    expect(formatLocalDate("2026-07-01", { day: "numeric", month: "long", year: "numeric" })).toBe(
      "1 July 2026",
    );
  });
});
