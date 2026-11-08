import { describe, expect, it } from "vitest";
import type { Bill } from "../types/bill";
import {
  addBill,
  billStatus,
  billsDueOn,
  deleteBill,
  dueSoonUntil,
  dueWords,
  financialYear,
  formatLocalDate,
  loadBills,
  markPaid,
  markUnpaid,
  paidBillsBetween,
  paidWords,
  recentlyPaid,
  saveBills,
  summarise,
  todayLocal,
  undoMarkPaid,
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

describe("Mark as Paid", () => {
  it("marks the Bill paid and records today's local date as its paid date", () => {
    // 8:30 am on 9 Nov in Sydney is still 8 Nov in UTC: the paid date must be the 9th
    const today = todayLocal(new Date("2026-11-09T08:30:00+11:00"));
    const { bills } = markPaid([bill({ id: "a" }), bill({ id: "b" })], "a", today);
    expect(bills).toEqual([
      bill({ id: "a", paid: true, paidDate: "2026-11-09" }),
      bill({ id: "b" }),
    ]);
  });

  it("Undo puts the Bill back exactly as it was: unpaid, with no paid date", () => {
    const before = [
      bill({ id: "a", name: "Rent", dueDate: "2026-11-01" }),
      bill({ id: "b", name: "Water" }),
    ];
    const marked = markPaid(before, "a", "2026-11-08");
    const undone = undoMarkPaid(marked.bills, marked.undo!);
    expect(undone).toEqual(before);
    expect(undone[0]).not.toHaveProperty("paidDate");
  });

  it("marking a paid Bill unpaid again clears its paid date", () => {
    const paid = bill({ id: "a", paid: true, paidDate: "2026-11-01" });
    const [unpaid] = markUnpaid([paid], "a");
    expect(unpaid).toEqual(bill({ id: "a" }));
    expect(unpaid).not.toHaveProperty("paidDate");
  });

  it("Undo leaves other changes made since alone", () => {
    const marked = markPaid([bill({ id: "a" })], "a", "2026-11-08");
    const added = [...marked.bills, bill({ id: "new", name: "Phone" })];
    expect(undoMarkPaid(added, marked.undo!)).toEqual([
      bill({ id: "a" }),
      bill({ id: "new", name: "Phone" }),
    ]);
  });
});

describe("Adding a Bill", () => {
  it("adds a new unpaid Bill with the details given, keeping the others", () => {
    const existing = [bill({ id: "a" })];
    const bills = addBill(
      existing,
      { name: "Water", amount: 85.2, dueDate: "2026-11-12", category: "water" },
      "new",
    );
    expect(bills).toEqual([
      bill({ id: "a" }),
      { id: "new", name: "Water", amount: 85.2, dueDate: "2026-11-12", paid: false, category: "water" },
    ]);
  });

  it("the new Bill lands in the right group", () => {
    const bills = addBill(
      [],
      { name: "Phone", amount: 40, dueDate: "2026-11-10", category: "phone" },
      "new",
    );
    expect(summarise(bills, "2026-11-08").dueSoon.map((b) => b.id)).toEqual(["new"]);
  });

  it("leaves the list it was given alone", () => {
    const existing = [bill({ id: "a" })];
    addBill(existing, { name: "Rent", amount: 400, dueDate: "2026-11-08", category: "rent" }, "new");
    expect(existing).toEqual([bill({ id: "a" })]);
  });
});

describe("Deleting a Bill", () => {
  it("removes exactly that Bill, keeping the others in order", () => {
    const bills = [bill({ id: "a" }), bill({ id: "b" }), bill({ id: "c" })];
    expect(deleteBill(bills, "b")).toEqual([bill({ id: "a" }), bill({ id: "c" })]);
  });

  it("changes nothing when no Bill has that id", () => {
    const bills = [bill({ id: "a" })];
    expect(deleteBill(bills, "missing")).toEqual([bill({ id: "a" })]);
  });

  it("leaves the list it was given alone", () => {
    const existing = [bill({ id: "a" }), bill({ id: "b" })];
    deleteBill(existing, "a");
    expect(existing).toEqual([bill({ id: "a" }), bill({ id: "b" })]);
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

  it("a Bill paid before paid dates were recorded loads with no paid date, and saving keeps it that way", () => {
    const storage = fakeStorage({
      bills:
        '[{"id":"1","name":"Internet","amount":79.99,"dueDate":"2026-10-10","paid":true,"category":"internet"}]',
    });
    const loaded = loadBills(storage);
    expect(loaded[0].paid).toBe(true);
    expect(loaded[0]).not.toHaveProperty("paidDate");
    saveBills(storage, loaded);
    expect(loadBills(storage)).toEqual(loaded);
  });

  it("a paid date survives saving and loading", () => {
    const storage = fakeStorage();
    saveBills(storage, markPaid([bill({ id: "a" })], "a", "2026-11-08").bills);
    expect(loadBills(storage)[0].paidDate).toBe("2026-11-08");
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

  it("matches on paid date when it is known, not due date", () => {
    const bills = [
      // Due in June, paid in July: belongs to the new financial year
      bill({ id: "a", name: "Paid late", dueDate: "2026-06-28", paid: true, paidDate: "2026-07-02" }),
      // Due in July, paid early in June: belongs to the old one
      bill({ id: "b", name: "Paid early", dueDate: "2026-07-03", paid: true, paidDate: "2026-06-30" }),
    ];
    expect(paidBillsBetween(bills, "2026-07-01", "2027-06-30").map((b) => b.name)).toEqual([
      "Paid late",
    ]);
    expect(paidBillsBetween(bills, "2025-07-01", "2026-06-30").map((b) => b.name)).toEqual([
      "Paid early",
    ]);
  });

  it("falls back to due date for older Bills with no paid date, and orders by the date used", () => {
    const bills = [
      bill({ id: "a", name: "Paid 10 Aug", dueDate: "2026-07-05", paid: true, paidDate: "2026-08-10" }),
      bill({ id: "b", name: "Due 1 Aug, no paid date", dueDate: "2026-08-01", paid: true }),
    ];
    expect(paidBillsBetween(bills, "2026-07-01", "2027-06-30").map((b) => b.name)).toEqual([
      "Due 1 Aug, no paid date",
      "Paid 10 Aug",
    ]);
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

describe("Paid Bills: recent first", () => {
  it("lists paid Bills most recent paid date first, with unknown paid dates last", () => {
    const bills = [
      bill({ id: "a", name: "No date, due Sept", dueDate: "2026-09-01", paid: true }),
      bill({ id: "b", name: "Paid 1 Nov", paid: true, paidDate: "2026-11-01" }),
      bill({ id: "c", name: "Unpaid", paid: false }),
      bill({ id: "d", name: "Paid 7 Nov", paid: true, paidDate: "2026-11-07" }),
      bill({ id: "e", name: "No date, due Oct", dueDate: "2026-10-01", paid: true }),
    ];
    expect(recentlyPaid(bills).map((b) => b.name)).toEqual([
      "Paid 7 Nov",
      "Paid 1 Nov",
      "No date, due Oct",
      "No date, due Sept",
    ]);
  });

  it("shows only the most recent few", () => {
    const bills = Array.from({ length: 15 }, (_, i) =>
      bill({ id: String(i), paid: true, paidDate: `2026-10-${String(i + 1).padStart(2, "0")}` }),
    );
    const recent = recentlyPaid(bills, 10);
    expect(recent).toHaveLength(10);
    expect(recent[0].paidDate).toBe("2026-10-15");
  });

  it("says when each Bill was paid, or that the date was not recorded", () => {
    expect(paidWords(bill({ paid: true, paidDate: "2026-11-08" }))).toBe(
      "Paid on Sunday 8 November",
    );
    expect(paidWords(bill({ paid: true }))).toBe("Paid (date not recorded)");
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
