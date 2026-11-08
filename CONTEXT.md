# My Bills

A simple bill tracker for older adults that answers one question first: "Do I need to pay anything soon?" It is built for people with memory loss, people new to technology, and people who feel anxious or stressed using it. Technical notes live in `src/docs/project-overview.md`.

## Language

### People

**Person**:
The older adult who uses the app day to day to keep track of their own bills. They may have memory loss, be new to technology, feel anxious using it, or have ADHD.
_Avoid_: User (too vague), senior, elderly user, customer

**Helper**:
A family member or carer who sets the app up for the Person (installs it, adds bills, picks a theme) and may check in later. The app must still work without one.
_Avoid_: Carer, admin, guardian

### Bills

**My Bills**:
The app's one name, used on the home screen icon, the browser tab and the main screen heading.
_Avoid_: Bill Toolkit, Seniors Bill Tracker

**Bill**:
A single amount the Person needs to pay by a due date, such as one electricity bill.
_Avoid_: Payment, invoice, subscription (subscription is a category, not a different thing)

**Repeating bill**:
A Bill that comes back on a regular schedule (every month, every 3 months or every year). Only one is ever open at a time: the next one appears when the current one is marked paid, never on its own.
_Avoid_: Recurring, subscription, standing bill

**Series**:
All the Bills one Repeating bill has brought in over time, the first one included. At most one Bill in a series is open (unpaid) at once.
_Avoid_: Chain, sequence, schedule

**Estimated amount**:
The amount on a newly appeared Repeating bill, copied from the last one and shown as "about $X" until the Person confirms or changes it.
_Avoid_: Default amount, guess, placeholder

**How often**:
The schedule of a Bill: Just once, Every month, Every 3 months or Every year.
_Avoid_: Frequency, interval, recurrence

**Due today**:
An unpaid Bill whose due date is today, by the Person's own local date. Never shown as Overdue.
_Avoid_: Overdue (on the due day itself)

**Due soon**:
An unpaid Bill whose due date falls in the next 7 days after today. Shown to the Person as "Due in the next 7 days" or "Due by <date>".
_Avoid_: Due this week (it suggests a calendar week, which is not what is counted)

**Overdue**:
An unpaid Bill whose due date was yesterday or earlier, by the Person's own local date.
_Avoid_: Late, missed, past due

**Paid**:
A Bill the Person has marked as paid in the app, with the date they marked it (the paid date). It does not mean the app checked any payment happened.
_Avoid_: Settled, cleared, done

**Paid Bills**:
The list of Bills already marked paid, each showing its paid date, most recent first. Financial-year lists and printing sit underneath, under "For tax time".
_Avoid_: History

### App areas

**Settings**:
The one place for set-up choices a Person rarely changes, such as text size, colour theme, dark mode and saving the app to the home screen. Usually handled by a Helper.
_Avoid_: Preferences, options, config

**Handy tools**:
The extras that live outside bill tracking: the Calculator and the Converter, grouped behind one button.
_Avoid_: Toolkit, utilities, extras
