"use client";

import { useRouter } from "next/navigation";

// Takes the person back to the page they came from, with their place kept.
// If they opened Help directly, it goes to the main page instead.
function BackButton() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={goBack}
      className="mt-5 w-full h-16 rounded-xl text-xl font-semibold shadow-md bg-[var(--bg-card)] border-4 border-[var(--accent-button-bg)] text-[var(--accent-text)]"
    >
      ← Back to where I was
    </button>
  );
}

// One help topic. The "target:" outline appears on the topic the person jumped to.
function Topic({
  id,
  title,
  steps,
}: {
  id: string;
  title: string;
  steps: string[];
}) {
  return (
    <section
      id={id}
      className="bg-[var(--bg-card)] rounded-2xl shadow-md p-6 mb-6 scroll-mt-4 target:ring-4 target:ring-[var(--accent-button-bg)]"
    >
      <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
        {title}
      </h2>
      <ol className="space-y-3 list-decimal pl-6">
        {steps.map((step) => (
          <li key={step} className="text-xl text-[var(--text-primary)]">
            {step}
          </li>
        ))}
      </ol>
      <BackButton />
    </section>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] p-4 sm:p-8 max-w-md mx-auto w-full">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-primary)]">
        Help
      </h1>

      <Topic
        id="calendar"
        title="The calendar"
        steps={[
          "Today's date has a green outline around it.",
          "A circle with an exclamation mark means a bill is overdue.",
          "A clock means a bill is due soon.",
          "A tick means a bill has been paid.",
          "Tap any day to jump down to the bills due on that day.",
        ]}
      />

      <Topic
        id="calculator"
        title="The calculator"
        steps={[
          "Tap the numbers, then tap + − × or ÷, then tap the next number.",
          "Tap = to see the answer.",
          "Tap Clear to start again, or Back to remove the last number you typed.",
          "To add up bills, scroll down and tick the bills you want.",
          "Tap Use this total to put the amount on the calculator screen.",
        ]}
      />

      <Topic
        id="converter"
        title="The converter"
        steps={[
          "Tap a topic, like Weight or Cooking.",
          "Tap the conversion you want, like Pounds to Kilograms.",
          "Type your number. The answer shows underneath.",
          "Tap Swap direction to convert the other way.",
          "For Cooking, tap Australia, UK or US, because spoons and cups are different sizes in each country.",
        ]}
      />

      <Topic
        id="history"
        title="Paid Bills"
        steps={[
          "The bills you paid most recently are at the top, with the day you marked each one paid.",
          "Bills paid before the app kept paid dates say Paid (date not recorded).",
          "For your tax agent, go down to For tax time. Tap This financial year or Last financial year to see your paid bills. A financial year runs from 1 July to 30 June.",
          "Or choose your own start and end dates.",
          "The total of the bills shown is at the top.",
          "To print or save a PDF for your tax agent, tap Print this list. For help, tap How do I print or save a PDF? just above it.",
        ]}
      />
    <Topic
        id="print"
        title="Printing or saving a PDF"
        steps={[
          "First choose the dates you want, so the list shows the right bills.",
          "Tap Print this list.",
          "On a computer, a print window opens. Choose your printer to print on paper, or choose Save as PDF to make a file.",
          "On a phone or tablet, a print or share window opens. Choose Print for paper, or look for the option to save as a PDF or save to Files.",
          "Only the bills, dates and total are printed. The buttons and menus are left off.",
        ]}
      />
     <Topic
        id="home-screen"
        title="Put this on my home screen"
        steps={[
          "Do this before you add your bills. On an iPhone, the home screen app keeps its own list, so bills added in Safari first may not appear there.",
          "iPhone or iPad: open this page in Safari. Tap the Share button (a square with an arrow pointing up). Scroll down and tap Add to Home Screen, then tap Add.",
          "Android phone or tablet: open this page in Chrome. Tap the three dots at the top right. Tap Add to Home screen or Install app, then confirm.",
        "Laptop or computer: open this page in Chrome or Edge. Look for a small install button at the right end of the address bar at the top, and click it. If you can't see one, click the three dots at the top right and look for Install. Then confirm. The app appears on your desktop or in your apps list.",
          "A green icon with a bill and a tick, called My Bills, appears on your home screen. Tap it any time to open the app.",
        ]}
      />
    </main>
  );
}