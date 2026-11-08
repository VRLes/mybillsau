"use client";

import { useRouter } from "next/navigation";
import { addBill, loadBills, saveBills, type NewBill } from "@/lib/bills";
import { BillForm } from "@/components/BillForm";

/** Add a bill: its own calm page, so the main screen stays uncluttered. */
export default function AddBillPage() {
  const router = useRouter();

  function handleSave(details: NewBill) {
    const id = Date.now().toString();
    // Read fresh from storage, so nothing saved elsewhere is lost
    saveBills(localStorage, addBill(loadBills(localStorage), details, id));
    // Back to My Bills, which lights up the new Bill in its group
    router.push(`/?highlight=${encodeURIComponent(id)}`);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-6 sm:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Add a bill
      </h1>

      <BillForm onSave={handleSave} />
    </main>
  );
}
