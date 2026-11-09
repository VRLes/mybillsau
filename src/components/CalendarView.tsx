"use client";

import { useMemo } from "react";
import { Bill } from "@/types/bill";
import { billStatus, billsDueOn, toLocalDate, todayLocal } from "@/lib/bills";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";

export function CalendarView({
  bills,
  month: currentMonth,
  onChangeMonth,
  onSelectDay,
}: {
  bills: Bill[];
  /** The month shown (any day in it). */
  month: Date;
  onChangeMonth: (month: Date) => void;
  onSelectDay: (dayBills: Bill[]) => void;
}) {

  const monthLabel = currentMonth.toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [currentMonth]);

  const today = todayLocal();

  function billsOnDay(date: Date) {
    return billsDueOn(bills, toLocalDate(date));
  }

  function isToday(date: Date) {
    return toLocalDate(date) === today;
  }

  function dayStatus(dayBills: Bill[]): "overdue" | "due" | "paid" {
    const statuses = dayBills.map((b) => billStatus(b, today));
    if (statuses.includes("overdue")) return "overdue";
    if (statuses.some((s) => s !== "paid")) return "due";
    return "paid";
  }

  function StatusIcon({ status }: { status: "overdue" | "due" | "paid" }) {
    if (status === "overdue")
      return <AlertCircle className="w-5 h-5 text-[var(--status-overdue-text)]" />;
    if (status === "due")
      return <Clock className="w-5 h-5 text-[var(--accent-text)]" />;
    return <Check className="w-5 h-5 text-[var(--calendar-paid-dot)]" />;
  }

  function changeMonth(offset: number) {
    onChangeMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  }

  return (
    <div
      id="calendar"
      className="scroll-mt-4 bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md px-0 py-4 sm:p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4 px-1 sm:px-0">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-[var(--calendar-hover-bg)]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6 text-[var(--accent-text)]" />
        </button>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          {monthLabel}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-[var(--calendar-hover-bg)]"
          aria-label="Next month"
        >
          <ChevronRight className="w-6 h-6 text-[var(--accent-text)]" />
        </button>
      </div>

      <div className="grid grid-cols-7 sm:gap-2 text-center text-lg text-[var(--text-secondary)] mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
        {days.map((date, i) => {
          if (!date) return <div key={i} />;
          const dayBills = billsOnDay(date);
          const clickable = dayBills.length > 0;
          const status = clickable ? dayStatus(dayBills) : null;

          return (
            <button
              key={i}
              type="button"
              onClick={() => clickable && onSelectDay(dayBills)}
              disabled={!clickable}
              aria-label={
                clickable
                  ? `${date.getDate()}: ${dayBills.map((b) => b.name).join(", ")}`
                  : `${date.getDate()}, no bills`
              }
              className={`min-h-[4.5rem] rounded-xl flex flex-col items-center justify-start pt-1 pb-1.5 ${
                isToday(date)
                  ? "border-4 border-[var(--calendar-today-border)]"
                  : status === "overdue"
                    ? "border-2 border-[var(--status-overdue-border)]"
                    : "border-2 border-[var(--border-default)]"
              } ${status === "overdue" ? "bg-[var(--status-overdue-bg)]" : ""} ${clickable ? "cursor-pointer hover:bg-[var(--calendar-hover-bg)]" : "cursor-default"}`}
            >
              <span className="text-2xl font-bold leading-tight text-[var(--text-primary)]">
                {date.getDate()}
              </span>
              {status && (
                <div className="mt-1">
                  <StatusIcon status={status} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 px-1 sm:px-0 text-lg text-[var(--text-secondary)]">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-5 h-5 text-[var(--status-overdue-text)]" /> Overdue
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-5 h-5 text-[var(--accent-text)]" /> Due
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-5 h-5 text-[var(--calendar-paid-dot)]" /> Paid
        </span>
      </div>
    </div>
  );
}
