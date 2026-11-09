"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Bill } from "@/types/bill";
import {
  billDetails,
  editBill,
  isEstimated,
  loadBills,
  saveBills,
  type NewBill,
} from "@/lib/bills";
import { BillForm } from "@/components/BillForm";

/** Edit a bill: the same calm page as Add a bill, filled in with the Bill. */
export default function EditBillPage() {
  const router = useRouter();
  // undefined while reading storage; null when there is no such unpaid Bill
  const [bill, setBill] = useState<Bill | null | undefined>(undefined);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    const found = loadBills(localStorage).find((b) => b.id === id && !b.paid);
    setBill(found ?? null);
  }, []);

  function handleSave(details: NewBill) {
    if (!bill) return;
    // Read fresh from storage, so nothing saved elsewhere is lost
    saveBills(localStorage, editBill(loadBills(localStorage), bill.id, details));
    // Back to My Bills, which lights up the Bill in its (maybe new) group
    router.push(`/?highlight=${encodeURIComponent(bill.id)}`);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Edit bill
      </h1>

      {bill === null && (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 space-y-4">
          <p className="text-xl text-[var(--text-primary)]">
            We couldn&apos;t find that bill. Nothing has changed.
          </p>
          <Link
            href="/"
            className="block w-full text-center bg-[var(--accent-button-bg)] text-white text-xl font-semibold rounded-xl py-4 shadow-md"
          >
            Back to My Bills
          </Link>
        </div>
      )}

      {bill && (
        <>
          {isEstimated(bill) && (
            <p className="text-lg text-[var(--text-secondary)] mb-4">
              The amount was copied from last time. Change it if this one is
              different. Saving confirms it.
            </p>
          )}
          <BillForm
            initial={billDetails(bill)}
            saveLabel="Save changes"
            onSave={handleSave}
          />
        </>
      )}
    </main>
  );
}
