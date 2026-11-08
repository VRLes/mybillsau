/**
 * "Marked as paid — Undo", shown for a few seconds after Mark as Paid so a
 * Person who tapped the wrong Bill can fix it straight away. It sits near
 * the bottom of the screen, where it won't cover the Bill list headings.
 */
export function UndoMessage({
  shown,
  nextDueText,
  onUndo,
}: {
  shown: boolean;
  /** For a Repeating bill: when the next one that just appeared is due. */
  nextDueText?: string;
  onUndo: () => void;
}) {
  return (
    // Always in the page, so screen readers announce the message when it appears
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 px-4 flex justify-center pointer-events-none"
    >
      {shown && (
        <div className="pointer-events-auto max-w-2xl w-full bg-[var(--banner-ok-bg)] border-2 border-[var(--banner-ok-border)] rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
          <div className="text-[var(--banner-ok-text)]">
            <p className="text-xl font-semibold">Marked as paid</p>
            {nextDueText && <p className="text-lg">Next one due {nextDueText}</p>}
          </div>
          <button
            onClick={onUndo}
            className="bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-xl font-semibold rounded-xl px-6 py-3 min-h-12"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
