import type { ReactNode } from "react";
import { Bill } from "@/types/bill";
import {
  DAY_DATE,
  dueSoonUntil,
  formatLocalDate,
  type BillsSummary,
  type LocalDate,
} from "@/lib/bills";
import { BillIcon } from "@/components/BillIcon";

interface BillActions {
  highlightedIds: Set<string>;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Bills grouped by how soon they need paying: Overdue, Due today,
 * Due in the next 7 days, Later, then Paid. Empty groups are left out.
 */
export function BillGroups({
  summary,
  paid,
  today,
  ...actions
}: BillActions & {
  summary: BillsSummary;
  paid: Bill[];
  today: LocalDate;
}) {
  return (
    <div className="space-y-8">
      <Group title="Overdue" bills={summary.overdue} overdue {...actions}>
        Pay when you can, then tap Mark as Paid.
      </Group>
      <Group title="Due today" bills={summary.dueToday} {...actions} />
      <Group title="Due in the next 7 days" bills={summary.dueSoon} {...actions}>
        Due by {formatLocalDate(dueSoonUntil(today), DAY_DATE)}
      </Group>
      <Group title="Later" bills={summary.later} {...actions} />
      <Group title="Paid" bills={paid} {...actions} />
    </div>
  );
}

function Group({
  title,
  bills,
  overdue = false,
  children,
  ...actions
}: BillActions & {
  title: string;
  bills: Bill[];
  overdue?: boolean;
  children?: ReactNode;
}) {
  if (bills.length === 0) return null;

  return (
    <section aria-label={title}>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
      {children && (
        <p
          className={`text-lg mt-1 ${
            overdue
              ? "font-semibold text-[var(--status-overdue-text)]"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {children}
        </p>
      )}
      <div className="space-y-4 mt-3">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} overdue={overdue} {...actions} />
        ))}
      </div>
    </section>
  );
}

function BillCard({
  bill,
  overdue,
  highlightedIds,
  onTogglePaid,
  onDelete,
}: BillActions & { bill: Bill; overdue: boolean }) {
  const look = overdue
    ? "bg-[var(--status-overdue-bg)] border-2 border-[var(--status-overdue-border)]"
    : "bg-[var(--bg-card)]";
  const ring = highlightedIds.has(bill.id)
    ? "ring-4 ring-[var(--accent-button-bg)]"
    : "";

  return (
    <div
      id={`bill-${bill.id}`}
      className={`${look} ${ring} rounded-2xl shadow-md hover:shadow-lg transition-all p-5 flex items-center gap-4`}
    >
      <BillIcon category={bill.category} />
      <div className="flex-1 min-w-0">
        <p className="text-xl font-semibold text-[var(--text-primary)]">
          {bill.name}
        </p>
        <p className="text-[var(--text-secondary)]">
          Due {formatLocalDate(bill.dueDate, DAY_DATE)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-[var(--text-primary)]">
          ${bill.amount.toFixed(2)}
        </p>
        <button
          onClick={() => onTogglePaid(bill.id)}
          className="text-[var(--accent-text)] font-semibold underline"
        >
          {bill.paid ? "Paid" : "Mark as Paid"}
        </button>
        <button
          onClick={() => onDelete(bill.id)}
          className="block mt-2 ml-auto text-sm text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
