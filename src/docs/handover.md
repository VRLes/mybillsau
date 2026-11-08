## Session: 25 October 2026

### What's finished

- **Three color themes added**: Warm Cream (was Sage & Cream — reworked to warm tan/terracotta tones so it's visually distinct from Green), Green, and Blue. Each has a full light + dark palette defined in `globals.css` as `.theme-green`, `.theme-blue` (default `:root`/`.dark` is Warm Cream)
- **Color theme button** (`ColorThemeToggle.tsx`) cycles through all three in order, labelled "Switch to [next theme] theme"
- **Dark/light mode simplified to ONE shared setting** across all themes (was per-theme at first, which looked like a bug — switching themes silently flipped dark/light back and forth). Now one button, one setting, applies everywhere. Logic lives in `lib/theme.ts`
- **"Tap or Click Here to Save This App" pill** added directly under the "My Bills" heading — bold amber box with a `›` arrow cue, links to the existing Help page's "Put this on my home screen" section (`/help#home-screen`)
  - Auto-hides permanently once the app is opened from the home screen icon the user saved (checks `display-mode: standalone` / `navigator.standalone`), stored in localStorage as `homeScreenSaved`
  - Wording iterated a few times: final version says it works on "phone, iPad, tablet or computer" and uses plain instruction wording rather than a passive description, so seniors recognise it's tappable
- Confirmed via local browser testing: all 3 themes × light/dark (6 combinations), pill behaviour, navigation between pages (History, Help) all keep the chosen theme/mode correctly
- Two commits pushed to Vercel this session

### Key decisions & reasoning

- Dropped per-theme dark/light memory in favour of one global setting — Les flagged it looked confusing/buggy for seniors, correctly identified as a real UX problem, not just a preference
- Reworked "Sage & Cream" → "Warm Cream" because it was too close to Green (both green-dominant) — now the three themes are genuinely visually distinct: warm neutral, cool green, cool blue
- Decided against adding a 4th theme — three is already a reasonable ceiling for the target audience (decision fatigue risk for users with memory loss)
- Home screen pill instruction wording changed from a statement ("Save this app to your phone") to a direct instruction ("Tap or Click Here...") plus an arrow, because the original didn't read as interactive

### What didn't work / had to be fixed

- First `ColorThemeToggle.tsx` file was saved with a typo as `ColorThemeToggle,tsx` (comma instead of period) — caused a module-not-found build error, fixed by renaming the file
- A Ctrl+H find/replace in `page.tsx` failed because the actual import line had an unexpected `.tsx` extension already in it (`from "@/components/ColorThemeToggle.tsx"`) — had to ask for the file contents to spot it
- Per-theme dark/light memory (original Blue theme build) looked like a bug when switching themes — reworked as above

### Not yet confirmed

- Real-phone/tablet check of the live site after deploy: theme switching, dark mode staying put, and — most importantly — the home screen pill actually disappearing after a real "Add to Home Screen" on iPhone/iPad
- Whether "device" wording in the pill subtext lands fine for seniors — Les reviewed and was happy, but worth watching for tester feedback
- Carried over from last session: Help page wording check, carer/family sharing feature, freemium paywall

### Next steps (in priority order)

1. Real-phone/tablet test: confirm themes, dark mode, and the home screen pill's auto-hide behaviour
2. Get tester feedback on whether the new pill is obviously tappable now
3. Carer / family sharing (planned paid-tier feature)
4. Freemium paywall / tier logic when ready to monetise

### Useful reference

- Local dev: `cd ~/projects/seniors-bill-tracker && npm run dev`
- Save and deploy (second terminal): `git add . && git commit -m "..." && git push`
- Files touched this session: `src/app/globals.css`, `src/lib/theme.ts`, `src/components/ThemeToggle.tsx`, `src/components/ColorThemeToggle.tsx`, `src/components/HomeScreenPill.tsx`, `src/app/page.tsx`




## Session: 14 October 2026 (afternoon)
### What's finished

- **Calculator % button** (`/calculator`): phone style. `200 + 10 %` gives 220, `200 × 10 %` gives 20. With + and −, % takes the percent of the first number. With × and ÷, it uses the plain percent (10 becomes 0.1). With no sum waiting, it divides the screen number by 100. Top row is now wide Clear, Back, %. New function `pressPercent` sits above `pressBack`. Confirmed working by Les
- **Converter, new Fuel topic**: Litres to Gallons, and Litres per 100 km to Miles per gallon. Hint text: "Litres, gallons, litres per 100 km, miles per gallon"
- **Converter, Cooking**: new "Litres to Gallons" for water and other liquids
- **Gallon size follows the Australia / UK / US picker**: Australia and UK use the Imperial gallon (4.546 litres), US uses the US gallon (3.785 litres). Same picker and same saved `measureRegion` as Cooking
- **Picker now shows on Cooking and Fuel**. Heading is "Whose gallons?" on Fuel and "Whose spoons and cups?" on Cooking
- **Note line under the answer** on all three gallon/fuel conversions, e.g. "In Australia, 1 gallon is the Imperial gallon (4.546 litres)." Added because Les spotted that Australia uses Imperial gallons and users might compare with US figures and think it's wrong
- **Removed the "Put this on my home screen" pill** from the bottom of the main page (a tester found it confusing). The home screen topic is now only reachable through the Help page. Les chose option A (no replacement link)
- Two commits pushed to Vercel (% button; Fuel plus pill removal)

### Key decisions & reasoning

- % is phone style because it suits discounts and GST
- Fuel economy is written out in full, not a simple multiply: a lower L/100km is better, a higher MPG is better. The same formula works in both directions
- Kept the country picker instead of renaming it to "Imperial / US gallon", because renaming would also change how Cooking spoons and cups are picked
- Les's tester feedback decided the pill removal. Option B (small plain link at the bottom of the main page: "Want this on your phone's home screen? See how") is the fallback if people can't find it

### What didn't work / had to be fixed

- First draft of the MPG formula (Step 3) was a mess and was replaced by a clean version before use. Worth a quick look at the `l100-mpg` block in `converter/page.tsx` to confirm it's the short one (one line each for forward and backward)
- Australia showing Imperial gallons looked like a bug to Les. It is correct, just unexplained, hence the note line
- The "Put this on my home screen" pill confused a tester

### Not yet confirmed

- Real-phone check of the live site after deploy: no % bug, Fuel topic with picker, home screen pill gone
- Help page may still describe the home screen button as being at the bottom of the main page. Check the wording and fix it. Also check whether the Converter and Calculator topics should mention Fuel, gallons and %
- Cooking hint on the topic list still says "Spoons, cups, millilitres" and doesn't mention gallons (minor)
- Carried over: iPhone home screen storage wording in Help; phone / tablet print and save as PDF wording; ReminderBanner dates (`src/components/ReminderBanner.tsx`); full mobile-friendliness check

### Next steps (in priority order)

1. Test on a real iPhone and tablet, then tidy the Help wording (including the home screen topic)
2. Ask the tester if they can find the home screen help now. If not, add the plain link (option B)
3. Carer / family sharing: read-only view or overdue notifications (planned paid-tier feature)
4. Freemium paywall / tier logic when ready to monetise

### Useful reference

- Local dev: `cd ~/projects/seniors-bill-tracker && npm run dev`
- Save and deploy (second terminal): `git add . && git commit -m "..." && git log --oneline -2 && git push`
- Files touched this session: `src/app/calculator/page.tsx`, `src/app/converter/page.tsx`, `src/app/page.tsx`




## Session: 14 October 2026

### What's finished

- **Calculator** (`/calculator`): plain calculator with large 4x5 keypad that fits a phone screen without scrolling. Small line above the number shows the sum in progress. Clear and Back buttons. Friendly message for divide by zero. Below the keypad, a tick list of unpaid bills with a "Ticked bills total" line and a "Use this total" button that puts the amount on the calculator screen
- **Converter** (`/converter`): three simple screens (pick a topic, pick a conversion, type a number), with a "Swap direction" button. Topics: Length, Weight, Temperature, Cooking, Speed, Area. Cooking has an Australia / UK / US picker (Australian tablespoon = 20 ml, cup = 250 ml), remembered in localStorage as `measureRegion`
- **Clean start**: new visitors now see an empty app with a "No bills yet" message instead of the three sample bills. Fixed a bug where deleting the last bill made it come back (a `loaded` flag now controls when bills are saved). The `sampleBills` import was removed from the main page
- **Friendlier dates**: bills show as "12 December 2026" on the main page and History page instead of "2026-12-12"
- **Help page** (`/help`): topics for calendar, calculator, converter, history, printing / saving a PDF, and putting the app on the home screen. Each topic has an id so a pill can jump straight to it, a thick outline on the topic you land on, and a "Back to where I was" button
- **"How does this work?" pills** on the main page (above the calendar), Calculator page, all three Converter screens, and History page. A separate "How do I print or save a PDF?" pill sits just above "Print this list". "Put this on my home screen" button sits at the bottom of the main page. Pills on History are hidden when printing
- **App icon and name**: `src/app/icon.tsx`, `src/app/apple-icon.tsx` and `src/app/manifest.ts`, drawn in code (cream bill with green tick on sage green `#4a7a2e`, cream `#f5f1e6`). App name is "Bill Toolkit", set in `layout.tsx`. Confirmed working by Les
- **Home screen install help** covers iPhone / iPad (Safari), Android phone / tablet (Chrome) and laptop / computer (Chrome or Edge)

### Key decisions & reasoning

- Calculator buttons are large, not extra large, so the whole keypad fits on one phone screen without scrolling
- Bill totals use a tick list rather than tap-to-add: ticks show what's included, and a wrong tick is easy to undo
- Pills only go where a new user might get stuck (calendar, calculator, converter, history, printing). The Help page is a safety net, not a manual
- Pill text uses plain words ("How does this work?"), not a "?" icon
- No currency converter, because it needs live exchange rates from an outside service (same reason as no bank connections)
- Region picker only appears on Cooking, because metres, kilograms and degrees are the same everywhere
- Updates reach users automatically on each push (Vercel). Exception: the icon and name under it are saved by the phone when the shortcut is added, so changing them later means removing and re-adding the shortcut. Bills live on each person's own device and are not touched by updates

### What didn't work / had to be fixed

- Help page's History topic first said "Print button", but the real button says "Print this list". Fixed to match
- The "2 of 2" Ctrl+H counter after a replace is normal, because the replacement text contains the Find text. Check with Ctrl+F (should be 1 of 1) before assuming it was added twice
- A date fix looked like it hadn't worked until the browser was refreshed
- The last commit also picked up `CONTEXT.md` (an app description file) and a 114-line tidy-up of `package-lock.json`. Both looked harmless
- Pill order is slightly inconsistent: on the Converter it sits above "Back to my bills", on the Calculator below it. Left as is

### Not yet confirmed

- **iPhone home screen app storage**: the Help text says bills added in Safari first may not appear in the home screen version (iPhones keep separate storage). Written from general knowledge, so test this on an iPhone and update the Help wording to match
- Phone / tablet print and "save as PDF" step in Help was also written from general knowledge. Check against what your phone shows
- Reminder banner dates: not seen yet. If it shows 2026-09-15 style dates, fix the same way as the bill cards (it's in `src/components/ReminderBanner.tsx`)
- Full mobile-friendliness check (phone and tablet, portrait and landscape)

### Next steps (in priority order)

1. Test on a real iPhone and tablet, then tidy the Help wording based on what you see
2. Carer / family sharing: invite a family member to view (read-only) or get notified of overdue bills (planned paid-tier feature)
3. Freemium paywall / tier logic when ready to monetise

### Useful reference

- Local dev: `cd ~/projects/seniors-bill-tracker && npm run dev` (the folder is lowercase `projects`, confirmed: full path `/home/les/projects/seniors-bill-tracker`)
- Save and deploy in one paste (second terminal): `git add . && git commit -m "..." && git log --oneline -2 && git push`
- New files this session: `src/app/calculator/page.tsx`, `converter/page.tsx`, `help/page.tsx`, `icon.tsx`, `apple-icon.tsx`, `manifest.ts`





# Seniors Bill Tracker — Handover

## Session: [today's date]

### What's finished

- Next.js + TypeScript + Tailwind app scaffolded at `~/Projects/seniors-bill-tracker`
- Live at: https://mybillsau.vercel.app (Vercel project "my-bills"; the old https://seniors-bill-tracker.vercel.app still works, and bills saved there stay there, because browser storage is per address)
- GitHub: https://github.com/VRLes/seniors-bill-tracker
- Core bill tracking: add / mark paid / delete bills, saved in browser (localStorage)
- Category icons (electricity, water, internet, phone, rent, insurance, subscription, other) via lucide-react — generic icons chosen over real company logos for simplicity
- Sage & cream visual theme (chosen over "deep ocean" and "terracotta sunset" options)
- Light/dark mode toggle — plain-worded button ("Switch to dark/light mode"), not icon-only, remembers choice, shows one-time explanation on first use. Dark mode uses a neutral charcoal background with sage as accent only (not sage-on-sage, for contrast reasons)
- Summary strip: due in the next 7 days / overdue / total owing (replaced in #4 by the Today line and summary answer)
- Reminder banner: plain-language cards for overdue and due-soon bills, friendly "all caught up" message when nothing's due
- Interactive month calendar: today highlighted, each day shows a status icon (not just colour) — circle+exclamation mark for overdue (softened from a warning triangle to avoid alarming users), clock for due soon, checkmark for paid. Tapping a day scrolls to and highlights the matching bill(s) below
- Paid Bills History page (`/history`): financial year presets (this FY / last FY, 1 July–30 June), optional custom date range, running total, print button (browser print, auto-hides buttons/nav when printing) — built for tax-agent handouts
- Colour is never used alone to convey meaning anywhere in the app (accessibility decision, prompted by colour-blindness consideration)

### Key decisions & reasoning

- Manual bill entry only — no bank/Plaid integration (cost, complexity, compliance)
- Primary audience: seniors, especially those with memory difficulties — not a general "subscription creep" app
- Freemium monetisation planned (not yet built): free tier ~10 bills, paid tier (~$3-5/mo) for unlimited bills, carer/family sharing, spending insights, export
- No settings/help page planned — the interface itself should be self-explanatory rather than relying on documentation nobody will read
- Paid Bills (`/history`) now opens on Recently paid, ordered by paid date (#9). For tax time, financial-year lists match on paid date, falling back to due date for older Bills with no paid date recorded

### What didn't work / had to be fixed

- Folder mix-up early on: `~/Projects` (capital P, had ibd-compass) vs `~/projects` (lowercase, had this project) — consolidated everything under `~/Projects`
- VS Code auto-created new folders/files one level too deep (inside `src/app` instead of `src`) — had to move via terminal
- A GitHub repo had been created on an earlier attempt but never received a push, causing "name already exists" confusion — fixed by linking to the existing repo instead of creating a new one
- Git commit was skipped once (files were staged but never committed) — always confirm with `git log --oneline` that a commit actually landed before assuming it did

### Next steps (in priority order, as agreed)

1. Mobile-friendliness check — not yet tested on phone/tablet despite this being a key use case
2. Carer/family sharing feature — invite a family member to view (read-only) or get notified of overdue bills; planned as a paid-tier feature
3. Eventually: freemium paywall/tier logic once ready to monetise

### Useful reference

- Local dev: `cd ~/projects/seniors-bill-tracker && npm run dev`
- Deploy: `git add . && git commit -m "..." && git push` (auto-deploys via Vercel)
- Manual deploy if ever needed: `npx vercel --prod`
