"use client";

import { useState, useMemo } from "react";
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
  onSelectDay,
}: {
  bills: Bill[];
  onSelectDay: (dayBills: Bill[]) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
      return <AlertCircle className="w-3.5 h-3.5 text-[var(--status-overdue-border)]" />;
    if (status === "due")
      return <Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" />;
    return <Check className="w-3.5 h-3.5 text-[var(--calendar-paid-dot)]" />;
  }

  function changeMonth(offset: number) {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-[var(--calendar-hover-bg)]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6 text-[var(--accent-text)]" />
        </button>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
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

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-[var(--text-secondary)] mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
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
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 ${
                isToday(date)
                  ? "border-[var(--calendar-today-border)]"
                  : "border-[var(--border-default)]"
              } ${clickable ? "cursor-pointer hover:bg-[var(--calendar-hover-bg)]" : "cursor-default"}`}
            >
              <span className="text-sm text-[var(--text-primary)]">
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

      <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-secondary)]">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-[var(--status-overdue-border)]" /> Overdue
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[var(--accent-text)]" /> Due
        </span>
        <span className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-[var(--calendar-paid-dot)]" /> Paid
        </span>
      </div>
    </div>
  );
}
