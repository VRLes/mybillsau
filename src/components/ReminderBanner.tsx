"use client";

import type { ReactNode } from "react";
import { Bill } from "@/types/bill";
import { formatLocalDate, summarise, todayLocal } from "@/lib/bills";
import { AlertCircle, Clock } from "lucide-react";

const dayAndMonth = { day: "numeric", month: "long" } as const;

/** One reminder line: red for Overdue, amber for anything still to pay. */
function ReminderRow({
  overdue = false,
  children,
}: {
  overdue?: boolean;
  children: ReactNode;
}) {
  const Icon = overdue ? AlertCircle : Clock;
  const box = overdue
    ? "bg-red-50 border-red-200"
    : "bg-amber-50 border-amber-200";
  const text = overdue ? "text-red-700" : "text-amber-700";
  const icon = overdue ? "text-red-600" : "text-amber-600";

  return (
    <div className={`${box} border-2 rounded-2xl p-4 flex items-center gap-3`}>
      <Icon className={`w-6 h-6 ${icon} flex-shrink-0`} />
      <p className={`${text} text-lg`}>{children}</p>
    </div>
  );
}

export function ReminderBanner({ bills }: { bills: Bill[] }) {
  const { overdue, dueToday, dueSoon } = summarise(bills, todayLocal());

  if (overdue.length === 0 && dueToday.length === 0 && dueSoon.length === 0) {
    return (
      <div className="bg-[var(--banner-ok-bg)] border-2 border-[var(--banner-ok-border)] rounded-2xl p-4 mb-6 text-center">
        <p className="text-[var(--banner-ok-text)] font-semibold text-lg">
          All caught up — nothing due soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {overdue.map((bill) => (
        <ReminderRow key={bill.id} overdue>
          <span className="font-semibold">{bill.name}</span> was due{" "}
          {formatLocalDate(bill.dueDate, dayAndMonth)} — it&apos;s overdue.
        </ReminderRow>
      ))}

      {dueToday.map((bill) => (
        <ReminderRow key={bill.id}>
          <span className="font-semibold">{bill.name}</span> is due today.
        </ReminderRow>
      ))}

      {dueSoon.map((bill) => (
        <ReminderRow key={bill.id}>
          <span className="font-semibold">{bill.name}</span> is due{" "}
          {formatLocalDate(bill.dueDate, dayAndMonth)}.
        </ReminderRow>
      ))}
    </div>
  );
}
