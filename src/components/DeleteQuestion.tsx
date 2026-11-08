"use client";

import { useEffect, useRef } from "react";
import type { Bill } from "@/types/bill";

/**
 * The calm question asked before a Bill is deleted, in place of the
 * browser's own pop-up. It names the Bill so the Person knows which one,
 * and "No, keep it" is the button ready to press, so a slip changes nothing.
 * Pressing Escape or tapping outside also counts as "No".
 */
export function DeleteQuestion({
  bill,
  onYes,
  onNo,
}: {
  /** The Bill being asked about, or null when no question is showing. */
  bill: Bill | null;
  onYes: () => void;
  onNo: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const keep = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (bill && !el.open) {
      // showModal keeps focus inside the question and dims the page behind it
      el.showModal();
      keep.current?.focus();
    } else if (!bill && el.open) {
      el.close();
    }
  }, [bill]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-question"
      // Escape closes the dialog: treat it the same as "No, keep it"
      onCancel={(e) => {
        e.preventDefault();
        onNo();
      }}
      // A tap on the dimmed area outside the box lands on the dialog itself
      onClick={(e) => {
        if (e.target === e.currentTarget) onNo();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-[var(--bg-card)] p-0 shadow-lg backdrop:bg-black/50"
    >
      {bill && (
        <div className="p-6">
          <p
            id="delete-question"
            className="text-2xl font-semibold text-[var(--text-primary)]"
          >
            Delete the {bill.name} bill?
          </p>
          <p className="mt-2 text-xl text-[var(--text-secondary)]">
            This can&apos;t be undone.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              ref={keep}
              onClick={onNo}
              className="w-full rounded-2xl bg-[var(--accent-button-bg)] py-4 text-2xl font-semibold text-white shadow-md hover:bg-[var(--accent-button-hover)]"
            >
              No, keep it
            </button>
            <button
              onClick={onYes}
              className="w-full rounded-2xl border-2 border-[var(--status-overdue-border)] bg-[var(--status-overdue-bg)] py-4 text-2xl font-semibold text-[var(--status-overdue-text)]"
            >
              Yes, delete it
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
