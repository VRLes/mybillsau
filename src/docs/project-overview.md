# My Bills: project overview

Technical notes moved here from `CONTEXT.md` on 8 November 2026, so `CONTEXT.md` can stay a pure glossary.

## What This App Is

A simple, visual bill and subscription tracker designed for seniors. No login required. Data is saved locally in the browser (localStorage).

---

## Current Status

- MVP complete
- No npm vulnerabilities
- Monetisation potential being explored

---

## Target Users

- Seniors who want a simple way to track bills and subscriptions
- Designed for clarity and ease of use — large text, simple layout, no clutter

---

## Tech Stack

- **Framework:** Next.js + TypeScript
- **Styling:** Tailwind CSS + CSS custom properties (`var(--)`)
- **Data storage:** localStorage (no database, no backend)
- **Structure:** Uses `src/` folder (not `app/` directly — note for navigation)

---

## Folder Structure

src/
├── app/          — Pages (Home, Paid Bills)
├── components/   — UI components
├── data/         — Sample bills data
├── docs/         — Project docs
└── types/        — TypeScript types (Bill type)

---

## App Structure

| Route | Section | Notes |
|---|---|---|
| `/` | My Bills | Main dashboard — bill list, summary, calendar |
| `/add` | Add a bill | Its own page, opened from "+ Add a bill"; Save or Cancel both return to My Bills |
| `/history` | Paid Bills | Recently paid first (paid date, most recent first); financial-year lists and printing under "For tax time" |

---

## Key Components

| Component | Purpose |
|---|---|
| `BillIcon` | Category icon for each bill |
| `AddBillForm` | The fields on the Add a bill page (`/add`); saving goes through `addBill` in the bills module |
| `TodayAnswer` | Today's date and the answer to "Do I need to pay anything soon?" |
| `BillGroups` | Bills grouped Overdue / Due today / Due in the next 7 days / Later / Paid |
| `CalendarView` | Visual calendar of bill due dates |
| `ThemeToggle` | Dark/light mode switch |

---

## Key Features

- Today line and summary answer — "Today is <date>", then "Nothing to pay in the next 7 days" or "2 bills to pay — <next Bill>"
- Bill groups — Overdue (calm amber), Due today, Due in the next 7 days, Later, Paid
- Calendar hidden behind "Show calendar"
- Calendar view — click a day to highlight bills due that day
- Mark as Paid — saves the paid date, with Undo; the Bill moves to Paid Bills
- Delete bill — confirms before deleting
- Dark/light theme via ThemeToggle

---

## Design Tokens (never hardcode colours)

- `--bg-page` — page background
- `--bg-card` — card backgrounds
- `--text-primary` — main text
- `--text-secondary` — secondary text
- `--border-default` — borders
- `--accent-text` — accent colour for paid/totals
- `--accent-button-bg` — highlight ring colour

---

## Known Gaps

- [ ] Monetisation strategy not yet decided
- [ ] No backend — data lives in browser localStorage only
- [ ] Mobile responsiveness — check on small screens