"use client";

import { useState } from "react";
import { Bill } from "@/types/bill";
import { useSaved } from "@/lib/savedValue";
import { loadBills, unpaidBills } from "@/lib/bills";

type Operator = "+" | "−" | "×" | "÷";

// Does the maths. Returns null if the sum can't be done (dividing by zero).
function calculate(a: number, b: number, op: Operator): number | null {
  if (op === "+") return a + b;
  if (op === "−") return a - b;
  if (op === "×") return a * b;
  if (b === 0) return null;
  return a / b;
}

// Tidies results like 0.1 + 0.2 so they show as 0.3, not 0.30000000000000004
function tidy(n: number): string {
  return parseFloat(n.toFixed(10)).toString();
}

// One calculator button. Kept in one place so every button looks the same.
function Key({
  label,
  onPress,
  style = "number",
  wide = false,
  ariaLabel,
}: {
  label: string;
  onPress: () => void;
  style?: "number" | "operator" | "equals" | "clear";
  wide?: boolean;
  ariaLabel?: string;
}) {
  const styles = {
    number:
      "bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)]",
    operator:
      "bg-[var(--bg-card)] border-2 border-[var(--accent-button-bg)] text-[var(--accent-text)]",
    equals:
      "bg-[var(--bg-card)] border-4 border-[var(--accent-button-bg)] text-[var(--accent-text)]",
    clear:
      "bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-default)] text-[var(--text-primary)]",
  };

  return (
    <button
      onClick={onPress}
      aria-label={ariaLabel ?? label}
      className={`h-16 rounded-xl text-2xl font-semibold shadow-md active:scale-95 transition-all ${
        styles[style]
      } ${wide ? "col-span-2" : ""}`}
    >
      {label}
    </button>
  );
}

/** Before saved Bills are read: the server, and the first draw in the browser. */
const NO_BILLS: Bill[] = [];

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Operator | null>(null);
  const [startNew, setStartNew] = useState(false);
  const [note, setNote] = useState("");

  // Bills come from the same saved list the main page uses
  const bills = useSaved(loadBills, NO_BILLS);
  const [tickedIds, setTickedIds] = useState<Set<string>>(new Set());

  // Only bills not yet paid are shown, as those are the ones to add up
  const unpaid = unpaidBills(bills);

  const tickedTotal = unpaid
    .filter((b) => tickedIds.has(b.id))
    .reduce((sum, b) => sum + b.amount, 0);

  function toggleTick(id: string) {
    setTickedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Puts the ticked total onto the calculator screen, ready to use
  function useTickedTotal() {
    setDisplay(tidy(tickedTotal));
    setStored(null);
    setOp(null);
    setStartNew(true);
    setNote("");
  }

  function pressDigit(d: string) {
    setNote("");
    if (startNew) {
      setDisplay(d);
      setStartNew(false);
    } else if (display.length < 12) {
      setDisplay(display === "0" ? d : display + d);
    }
  }

  function pressDot() {
    setNote("");
    if (startNew) {
      setDisplay("0.");
      setStartNew(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }

  function pressOperator(next: Operator) {
    setNote("");
    const current = parseFloat(display);

    // If a sum is already waiting (e.g. 5 + 3 then +), finish it first
    if (stored !== null && op && !startNew) {
      const result = calculate(stored, current, op);
      if (result === null) {
        clearAll("You can't divide by zero");
        return;
      }
      setStored(result);
      setDisplay(tidy(result));
    } else {
      setStored(current);
    }
    setOp(next);
    setStartNew(true);
  }

  function pressEquals() {
    if (stored === null || !op) return;
    const result = calculate(stored, parseFloat(display), op);
    if (result === null) {
      clearAll("You can't divide by zero");
      return;
    }
    setDisplay(tidy(result));
    setStored(null);
    setOp(null);
    setStartNew(true);
  }

  // Percent button, phone style:
  // 200 + 10 % gives 220, 200 × 10 % gives 20.
  // + and − take the percent of the first number. × and ÷ use the plain percent.
  function pressPercent() {
    setNote("");
    const current = parseFloat(display);

    if (stored !== null && op) {
      // A sum is waiting but no second number typed yet, so do nothing
      if (startNew) return;

      const amount =
        op === "+" || op === "−" ? (stored * current) / 100 : current / 100;
      const result = calculate(stored, amount, op);
      if (result === null) {
        clearAll("You can't divide by zero");
        return;
      }
      setDisplay(tidy(result));
      setStored(null);
      setOp(null);
      setStartNew(true);
    } else {
      // No sum waiting, so just turn the number into a percent (50 becomes 0.5)
      setDisplay(tidy(current / 100));
      setStartNew(true);
    }
  }

  // Removes the last number typed, like a pencil rubber
  function pressBack() {
    if (startNew) return;
    if (display.length <= 1 || (display.length === 2 && display[0] === "-")) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }

  function clearAll(message = "") {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setStartNew(false);
    setNote(message);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-4 sm:p-8 max-w-md mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Calculator
      </h1>

      {/* The screen. The small line shows the sum in progress, so nothing has to be remembered */}

      
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md p-5 mb-4 text-right">
        <p className="text-[var(--text-secondary)] text-xl min-h-[1.75rem]">
          {stored !== null && op ? `${tidy(stored)} ${op}` : ""}
        </p>
        <p className="text-5xl font-bold text-[var(--text-primary)] break-all">
          {display}
        </p>
      </div>

      <p className="text-[var(--text-primary)] text-lg font-medium min-h-[1.75rem] mb-2">
        {note}
      </p>

      <div className="grid grid-cols-4 gap-3">
        <Key label="Clear" onPress={() => clearAll()} style="clear" wide />
        <Key label="Back" onPress={pressBack} style="clear" ariaLabel="Remove last number" />
        <Key label="%" onPress={pressPercent} style="operator" ariaLabel="percent" />

        <Key label="7" onPress={() => pressDigit("7")} />
        <Key label="8" onPress={() => pressDigit("8")} />
        <Key label="9" onPress={() => pressDigit("9")} />
        <Key label="÷" onPress={() => pressOperator("÷")} style="operator" ariaLabel="divide" />

        <Key label="4" onPress={() => pressDigit("4")} />
        <Key label="5" onPress={() => pressDigit("5")} />
        <Key label="6" onPress={() => pressDigit("6")} />
        <Key label="×" onPress={() => pressOperator("×")} style="operator" ariaLabel="times" />

        <Key label="1" onPress={() => pressDigit("1")} />
        <Key label="2" onPress={() => pressDigit("2")} />
        <Key label="3" onPress={() => pressDigit("3")} />
        <Key label="−" onPress={() => pressOperator("−")} style="operator" ariaLabel="minus" />

        <Key label="0" onPress={() => pressDigit("0")} />
        <Key label="." onPress={pressDot} ariaLabel="decimal point" />
        <Key label="=" onPress={pressEquals} style="equals" ariaLabel="equals" />
        <Key label="+" onPress={() => pressOperator("+")} style="operator" ariaLabel="plus" />
      </div>
    <div className="mt-8">
        <h2 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">
          Your unpaid bills
        </h2>
        <p className="text-[var(--text-secondary)] text-lg mb-4">
          Tick the bills you want to add up.
        </p>

        {unpaid.length === 0 ? (
          <p className="text-[var(--text-primary)] text-lg">
            You have no unpaid bills. You&apos;re all caught up!
          </p>
        ) : (
          <div className="space-y-3">
            {unpaid.map((bill) => (
              <label
                key={bill.id}
                className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md p-4 flex items-center gap-4 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tickedIds.has(bill.id)}
                  onChange={() => toggleTick(bill.id)}
                  className="h-8 w-8 shrink-0"
                />
                <span className="flex-1 text-xl font-semibold text-[var(--text-primary)]">
                  {bill.name}
                </span>
                <span className="text-xl font-bold text-[var(--text-primary)]">
                  ${bill.amount.toFixed(2)}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] rounded-2xl shadow-md p-5 mt-4">
          <p className="text-xl font-semibold text-[var(--text-primary)]">
            Ticked bills total: ${tickedTotal.toFixed(2)}
          </p>
          <button
            onClick={useTickedTotal}
            disabled={tickedIds.size === 0}
            className="mt-3 w-full h-16 rounded-xl text-xl font-semibold shadow-md bg-[var(--bg-card)] border-4 border-[var(--accent-button-bg)] text-[var(--accent-text)] disabled:opacity-40"
          >
            Use this total
          </button>
        </div>
      </div>
    </main>
  );
}