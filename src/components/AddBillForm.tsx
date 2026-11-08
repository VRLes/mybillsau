"use client";

import { useState } from "react";
import Link from "next/link";
import type { BillCategory, HowOften } from "@/types/bill";
import type { NewBill } from "@/lib/bills";

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

const schedules: { value: HowOften; label: string }[] = [
  { value: "once", label: "Just once" },
  { value: "monthly", label: "Every month" },
  { value: "quarterly", label: "Every 3 months" },
  { value: "yearly", label: "Every year" },
];

/** The Add a bill fields. Saving is left to the page, through the bills module. */
export function AddBillForm({ onSave }: { onSave: (details: NewBill) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<BillCategory>("other");
  const [howOften, setHowOften] = useState<HowOften>("once");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;

    onSave({ name, amount: parseFloat(amount), dueDate, category, howOften });
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
          {schedules.map((s) => (
            <label
              key={s.value}
              className={`flex items-center gap-3 border-2 rounded-xl p-4 text-lg cursor-pointer text-[var(--text-primary)] ${
                howOften === s.value
                  ? "border-[var(--accent-button-bg)] font-semibold"
                  : "border-[var(--border-default)]"
              }`}
            >
              <input
                type="radio"
                name="howOften"
                value={s.value}
                checked={howOften === s.value}
                onChange={() => setHowOften(s.value)}
                className="w-6 h-6 accent-[var(--accent-button-bg)]"
              />
              {s.label}
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
        Save bill
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
