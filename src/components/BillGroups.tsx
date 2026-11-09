import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Bill } from "@/types/bill";
import {
  DAY_DATE,
  dueSoonUntil,
  formatLocalDate,
  type BillsSummary,
  HOW_OFTEN_WORDS,
  howOften,
  isEstimated,
  type LocalDate,
} from "@/lib/bills";
import { BillIcon } from "@/components/BillIcon";
import { AlertCircle, Clock } from "lucide-react";

/** A status said in words on the Bill card itself, not just in the heading. */
type CardStatus = "overdue" | "due-today" | null;

interface BillActions {
  highlightedIds: Set<string>;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
  onConfirmAmount: (id: string, amount: number) => void;
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
      <Group
        title="Overdue"
        bills={summary.overdue}
        status="overdue"
        {...actions}
      >
        Pay when you can, then tap Mark as Paid.
      </Group>
      <Group
        title="Due today"
        bills={summary.dueToday}
        status="due-today"
        {...actions}
      />
      <Group
        title="Due in the next 7 days"
        bills={summary.dueSoon}
        {...actions}
      >
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
  status = null,
  children,
  ...actions
}: BillActions & {
  title: string;
  bills: Bill[];
  status?: CardStatus;
  children?: ReactNode;
}) {
  if (bills.length === 0) return null;

  return (
    <section aria-label={title}>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
      {children && (
        <p
          className={`text-lg mt-1 ${
            status === "overdue"
              ? "font-semibold text-[var(--status-overdue-text)]"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {children}
        </p>
      )}
      <div className="space-y-4 mt-3">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} status={status} {...actions} />
        ))}
      </div>
    </section>
  );
}

function BillCard({
  bill,
  status,
  highlightedIds,
  onTogglePaid,
  onDelete,
  onConfirmAmount,
}: BillActions & { bill: Bill; status: CardStatus }) {
  const schedule = howOften(bill);
  const estimated = isEstimated(bill);
  const look =
    status === "overdue"
      ? "bg-[var(--status-overdue-bg)] border-[3px] border-[var(--status-overdue-border)]"
      : status === "due-today"
        ? "bg-[var(--bg-card)] border-[3px] border-[var(--accent-button-bg)]"
        : "bg-[var(--bg-card)] border-2 border-[var(--border-default)]";
  const dueDate = formatLocalDate(bill.dueDate, DAY_DATE);
  const ring = highlightedIds.has(bill.id)
    ? "ring-4 ring-[var(--accent-button-bg)]"
    : "";

  return (
    <div
      id={`bill-${bill.id}`}
      className={`${look} ${ring} rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5`}
    >
      {status === "overdue" && (
        <p className="flex items-center gap-2 mb-3 text-lg font-bold text-[var(--status-overdue-text)]">
          <AlertCircle aria-hidden="true" className="w-6 h-6 shrink-0" />
          Overdue since {dueDate}
        </p>
      )}
      {status === "due-today" && (
        <p className="flex items-center gap-2 mb-3 text-lg font-bold text-[var(--accent-text)]">
          <Clock aria-hidden="true" className="w-6 h-6 shrink-0" />
          Due today
        </p>
      )}
      <div className="flex items-center gap-4">
        <BillIcon category={bill.category} />
        <div className="flex-1 min-w-0">
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            {bill.name}
          </p>
          {status === null && (
            <p className="text-[var(--text-secondary)]">Due {dueDate}</p>
          )}
          {schedule !== "once" && (
            <p className="text-[var(--text-secondary)]">
              {HOW_OFTEN_WORDS[schedule]}
            </p>
          )}
          {estimated && (
            <EstimatedAmount bill={bill} onConfirmAmount={onConfirmAmount} />
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {estimated && <span className="text-lg font-semibold">about </span>}
            ${bill.amount.toFixed(2)}
          </p>
          <button
            onClick={() => onTogglePaid(bill.id)}
            className="text-[var(--accent-text)] font-semibold underline"
          >
            {bill.paid ? "Paid" : "Mark as Paid"}
          </button>
          {!bill.paid && (
            <Link
              href={`/edit?id=${encodeURIComponent(bill.id)}`}
              className="block mt-2 ml-auto text-[var(--accent-text)] font-semibold underline"
            >
              Edit
            </Link>
          )}
          <button
            onClick={() => onDelete(bill.id)}
            className="block mt-2 ml-auto text-[var(--text-primary)] underline"
          >
            Delete
          </button>
        </div>
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
          className="bg-[var(--accent-button-bg)] text-[var(--on-accent)] text-lg font-semibold rounded-xl px-5 py-3 min-h-12 disabled:opacity-50"
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
