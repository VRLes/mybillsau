import { Check } from "lucide-react";
import {
  DAY_DATE,
  dueWords,
  formatLocalDate,
  type BillsSummary,
  type LocalDate,
} from "@/lib/bills";

/**
 * The top of My Bills: today's date, then one plain answer to
 * "Do I need to pay anything soon?".
 */
export function TodayAnswer({
  summary,
  today,
}: {
  summary: BillsSummary;
  today: LocalDate;
}) {
  const { count, next } = summary.toPay;

  return (
    <section aria-label="Today" className="mb-6">
      <p className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
        Today is {formatLocalDate(today, DAY_DATE)}
      </p>

      <div className="bg-[var(--banner-ok-bg)] border-2 border-[var(--banner-ok-border)] rounded-2xl p-5">
        {next ? (
          <p className="text-2xl font-semibold text-[var(--text-primary)]">
            {count} {count === 1 ? "bill" : "bills"} to pay —{" "}
            {next.name} ${next.amount.toFixed(2)} {dueWords(next, today)}
          </p>
        ) : (
          <p className="text-2xl font-semibold text-[var(--banner-ok-text)] flex items-center gap-3">
            <Check className="w-8 h-8 flex-shrink-0" aria-hidden />
            Nothing to pay in the next 7 days
          </p>
        )}
        <p className="text-lg text-[var(--text-secondary)] mt-2">
          Total still to pay: ${summary.totalOwing.toFixed(2)}
        </p>
      </div>
    </section>
  );
}
