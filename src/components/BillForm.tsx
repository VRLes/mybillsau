"use client";

import { useState } from "react";
import Link from "next/link";
import type { BillCategory, HowOften } from "@/types/bill";
import { HOW_OFTEN_WORDS, type NewBill } from "@/lib/bills";

const categories: { value: BillCategory; label: string }[] = [
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "phone", label: "Phone" },
  { value: "rent", label: "Rent" },
  { value: "insurance", label: "Insurance" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" },
];

const schedules: HowOften[] = ["once", "monthly", "quarterly", "yearly"];

/**
 * The Add a bill fields, also used to edit a Bill (start from `initial`).
 * Saving is left to the page, through the bills module.
 */
export function BillForm({
  onSave,
  initial,
  saveLabel = "Save bill",
}: {
  onSave: (details: NewBill) => void;
  initial?: NewBill;
  saveLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? initial.amount.toFixed(2) : "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [category, setCategory] = useState<BillCategory>(initial?.category ?? "other");
  const [howOften, setHowOften] = useState<HowOften>(initial?.howOften ?? "once");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const typed = parseFloat(amount);
    // Same rule as "Change if different": a real amount, never below $0
    if (!name || !dueDate || !Number.isFinite(typed) || typed < 0) return;

    onSave({ name, amount: typed, dueDate, category, howOften });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 mb-6 space-y-4"
    >
      <div>
        <label className="block text-base font-medium mb-1 text-[var(--text-primary)]">
          Bill name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electricity"
          className="w-full border-2 border-[var(--border-default)] focus:border-[var(--accent-button-bg)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-4 text-lg outline-none"
        />
      </div>

      <div>
        <label className="block text-base font-medium mb-1 text-[var(--text-primary)]">
          Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 120.50"
          className="w-full border-2 border-[var(--border-default)] focus:border-[var(--accent-button-bg)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-4 text-lg outline-none"
        />
      </div>

      <div>
        <label className="block text-base font-medium mb-1 text-[var(--text-primary)]">
          Due date
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border-2 border-[var(--border-default)] focus:border-[var(--accent-button-bg)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-4 text-lg outline-none"
        />
      </div>

      <div>
        <label className="block text-base font-medium mb-1 text-[var(--text-primary)]">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as BillCategory)}
          className="w-full border-2 border-[var(--border-default)] focus:border-[var(--accent-button-bg)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl p-4 text-lg outline-none"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Big tap-target choices rather than a dropdown, so every option is in view */}
      <fieldset>
        <legend className="block text-base font-medium mb-1 text-[var(--text-primary)]">
          How often
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {schedules.map((schedule) => (
            <label
              key={schedule}
              className={`flex items-center gap-3 border-2 rounded-xl p-4 text-lg cursor-pointer text-[var(--text-primary)] ${
                howOften === schedule
                  ? "border-[var(--accent-button-bg)] font-semibold"
                  : "border-[var(--border-default)]"
              }`}
            >
              <input
                type="radio"
                name="howOften"
                value={schedule}
                checked={howOften === schedule}
                onChange={() => setHowOften(schedule)}
                className="w-6 h-6 accent-[var(--accent-button-bg)]"
              />
              {HOW_OFTEN_WORDS[schedule]}
            </label>
          ))}
        </div>
        {howOften !== "once" && (
          <p className="text-base text-[var(--text-secondary)] mt-2">
            When you mark it paid, the next one appears by itself.
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="w-full bg-[var(--accent-button-bg)] text-white text-xl font-semibold rounded-xl py-4 shadow-md hover:bg-[var(--accent-button-hover)] hover:shadow-lg transition-all"
      >
        {saveLabel}
      </button>

      <Link
        href="/"
        className="block w-full text-center bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-xl font-medium rounded-xl py-4 shadow-md hover:shadow-lg transition-all"
      >
        Cancel, don&apos;t save
      </Link>
    </form>
  );
}
