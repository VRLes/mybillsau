import { useState, type ReactNode } from "react";
import { Bill } from "@/types/bill";
import {
  DAY_DATE,
  dueSoonUntil,
  formatLocalDate,
  type BillsSummary,
  howOften,
  type LocalDate,
} from "@/lib/bills";
import { BillIcon } from "@/components/BillIcon";

interface BillActions {
  highlightedIds: Set<string>;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onConfirmAmount: (id: string, amount: number) => void;
}

const HOW_OFTEN_WORDS = {
  monthly: "Every month",
  quarterly: "Every 3 months",
  yearly: "Every year",
} as const;

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
  onConfirmAmount,
}: BillActions & { bill: Bill; overdue: boolean }) {
  const schedule = howOften(bill);
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
          {schedule !== "once" && ` · ${HOW_OFTEN_WORDS[schedule]}`}
        </p>
        {bill.estimated && !bill.paid && (
          <EstimatedAmount bill={bill} onConfirmAmount={onConfirmAmount} />
        )}
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-[var(--text-primary)]">
          {bill.estimated && !bill.paid && (
            <span className="text-lg font-semibold">about </span>
          )}
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

/**
 * "About $X — change if different" on a newly appeared Repeating bill. The
 * amount was copied from last time, so the Person can type the real one, or
 * keep it. Either way "about" goes away.
 */
function EstimatedAmount({
  bill,
  onConfirmAmount,
}: {
  bill: Bill;
  onConfirmAmount: (id: string, amount: number) => void;
}) {
  const [changing, setChanging] = useState(false);
  const [amount, setAmount] = useState(bill.amount.toFixed(2));
  const typed = parseFloat(amount);
  const amountOk = Number.isFinite(typed) && typed >= 0;

  if (!changing) {
    return (
      <p className="text-[var(--text-secondary)] mt-1">
        About ${bill.amount.toFixed(2)}, same as last time.{" "}
        <button
          onClick={() => setChanging(true)}
          className="text-[var(--accent-text)] font-semibold underline"
        >
          Change if different
        </button>
      </p>
    );
  }

  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (amountOk) onConfirmAmount(bill.id, typed);
      }}
    >
      <label className="block text-base font-medium text-[var(--text-primary)]">
        Amount this time ($)
        <input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
          className="mt-1 w-full border-2 border-[var(--border-default)] focus:border-[var(--accent-button-bg)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-3 text-lg outline-none"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!amountOk}
          className="bg-[var(--accent-button-bg)] text-white text-lg font-semibold rounded-xl px-5 py-3 min-h-12 disabled:opacity-50"
        >
          Save amount
        </button>
        <button
          type="button"
          onClick={() => onConfirmAmount(bill.id, bill.amount)}
          className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 min-h-12"
        >
          Keep ${bill.amount.toFixed(2)}
        </button>
      </div>
    </form>
  );
}
