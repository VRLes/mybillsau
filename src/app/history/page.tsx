"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Bill } from "@/types/bill";
import {
  FULL_DATE,
  financialYear,
  formatLocalDate,
  loadBills,
  paidBillsBetween,
  paidWords,
  recentlyPaid,
  todayLocal,
} from "@/lib/bills";
import { BillIcon } from "@/components/BillIcon";

export default function HistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [activePreset, setActivePreset] = useState<
    "thisFY" | "lastFY" | "custom"
  >("thisFY");

  useEffect(() => {
    setBills(loadBills(localStorage));
  }, []);

  function applyPreset(preset: "thisFY" | "lastFY") {
    const offset = preset === "thisFY" ? 0 : -1;
    const { start, end } = financialYear(todayLocal(), offset);
    setRangeStart(start);
    setRangeEnd(end);
    setActivePreset(preset);
  }

  const paidBillsInRange = useMemo(() => {
    if (!rangeStart || !rangeEnd) return [];
    return paidBillsBetween(bills, rangeStart, rangeEnd);
  }, [bills, rangeStart, rangeEnd]);

  const recent = useMemo(() => recentlyPaid(bills), [bills]);

  const total = paidBillsInRange.reduce((sum, b) => sum + b.amount, 0);

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Paid Bills
      </h1>

      <section aria-labelledby="recent-heading" className="print:hidden mb-10">
        <h2
          id="recent-heading"
          className="text-2xl font-semibold mb-4 text-[var(--text-primary)]"
        >
          Recently paid
        </h2>
        {recent.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-lg py-4">
            No bills marked as paid yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {recent.map((bill) => (
              <li
                key={bill.id}
                className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 flex items-center gap-4"
              >
                <BillIcon category={bill.category} />
                <div className="flex-1">
                  <p className="text-xl font-semibold text-[var(--text-primary)]">
                    {bill.name}
                  </p>
                  <p className="text-lg text-[var(--text-secondary)]">
                    {paidWords(bill)}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  ${bill.amount.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
        For tax time
      </h2>

      <div className="print:hidden bg-[var(--bg-card)] rounded-2xl shadow-md p-6 mb-6 space-y-4">
        <p className="text-lg font-medium text-[var(--text-primary)]">
          Choose a date range
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => applyPreset("thisFY")}
            className={`text-lg font-medium rounded-xl px-5 py-3 border-2 transition-all ${
              activePreset === "thisFY"
                ? "bg-[var(--accent-button-bg)] text-white border-[var(--accent-button-bg)]"
                : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)]"
            }`}
          >
            This financial year
          </button>
          <button
            onClick={() => applyPreset("lastFY")}
            className={`text-lg font-medium rounded-xl px-5 py-3 border-2 transition-all ${
              activePreset === "lastFY"
                ? "bg-[var(--accent-button-bg)] text-white border-[var(--accent-button-bg)]"
                : "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)]"
            }`}
          >
            Last financial year
          </button>
        </div>

        <details
          className="pt-2"
          onToggle={(e) => {
            if ((e.target as HTMLDetailsElement).open)
              setActivePreset("custom");
          }}
        >
          <summary className="cursor-pointer text-base font-medium text-[var(--accent-text)]">
            Or choose a custom date range
          </summary>
          <div className="flex flex-wrap gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
                From
              </label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => {
                  setRangeStart(e.target.value);
                  setActivePreset("custom");
                }}
                className="border-2 border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-3 text-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
                To
              </label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => {
                  setRangeEnd(e.target.value);
                  setActivePreset("custom");
                }}
                className="border-2 border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-3 text-lg outline-none"
              />
            </div>
          </div>
        </details>
      </div>

      {rangeStart && rangeEnd && (
        <>
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm">
                {formatLocalDate(rangeStart, FULL_DATE)}
                {" – "}
                {formatLocalDate(rangeEnd, FULL_DATE)}
              </p>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                {paidBillsInRange.length} bill
                {paidBillsInRange.length !== 1 ? "s" : ""} paid
              </p>
            </div>
            <p className="text-3xl font-bold text-[var(--accent-text)]">
              ${total.toFixed(2)}
            </p>
          </div>

          {paidBillsInRange.length > 0 && (
            <div className="print:hidden mb-3">
              <Link
                href="/help#print"
                className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-full px-5 py-2 shadow-md hover:shadow-lg transition-all"
              >
                How do I print or save a PDF?
              </Link>
            </div>
          )}

          {paidBillsInRange.length > 0 && (
            <button
              onClick={() => window.print()}
              className="print:hidden w-full bg-[var(--accent-button-bg)] text-white text-xl font-semibold rounded-xl py-4 shadow-md hover:bg-[var(--accent-button-hover)] hover:shadow-lg transition-all mb-6"
            >
              Print this list
            </button>
          )}

          <div className="space-y-4">
            {paidBillsInRange.length === 0 ? (
              <p className="text-[var(--text-secondary)] text-lg text-center py-8">
                No paid bills found in this date range.
              </p>
            ) : (
              paidBillsInRange.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 flex items-center gap-4"
                >
                  <BillIcon category={bill.category} />
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-[var(--text-primary)]">
                      {bill.name}
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      {bill.paidDate
                        ? `Paid ${formatLocalDate(bill.paidDate, FULL_DATE)}`
                        : `Due ${formatLocalDate(bill.dueDate, FULL_DATE)} (paid date not recorded)`}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    ${bill.amount.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}
