"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { addBill, loadBills, saveBills, type NewBill } from "@/lib/bills";
import { AddBillForm } from "@/components/AddBillForm";

/** Add a bill: its own calm page, so the main screen stays uncluttered. */
export default function AddBillPage() {
  const router = useRouter();

  function handleSave(details: NewBill) {
    const id = Date.now().toString();
    // Read fresh from storage, so nothing saved elsewhere is lost
    saveBills(localStorage, addBill(loadBills(localStorage), details, id));
    // Back to My Bills, which lights up the new Bill in its group
    router.push(`/?added=${encodeURIComponent(id)}`);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-block bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-primary)] text-lg font-medium rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-all mb-6"
      >
        ← Back to My Bills
      </Link>

      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Add a bill
      </h1>

      <AddBillForm onSave={handleSave} />
    </main>
  );
}
