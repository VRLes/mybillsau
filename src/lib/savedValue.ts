import { useMemo, useSyncExternalStore } from "react";

/**
 * The one way pages read what the Person has saved in browser storage (Bills,
 * Settings, the converter's country), without a hydration mismatch.
 *
 * The server has no browser storage, so it draws `fallback`, and React's first
 * draw in the browser (hydration) must match it. useSyncExternalStore then
 * swaps in the saved value straight after hydrating, before paint. When the
 * page is reached by tapping a link, the saved value is there from the start.
 * Text size, colour theme and dark mode are already on the page before then,
 * put on by earlySettings.ts (see Next's "Preventing flash before hydration").
 */

/** The part of browser storage the load and save functions need. */
export type SavedStorage = Pick<Storage, "getItem" | "setItem">;

/** Goes up every time something is saved through `savedStorage`. */
let version = 0;
const ON_SERVER = -1;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Browser storage that tells every useSaved on screen to read again after a
 * save. Use it in place of localStorage when saving on a page that stays put.
 */
export const savedStorage: SavedStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    version++;
    listeners.forEach((listener) => listener());
  },
};

/**
 * What `read` finds in browser storage, or `fallback` on the server and while
 * hydrating. `read` must be a function defined outside the component (such as
 * loadBills), so the value is only read again after a save.
 */
export function useSaved<T>(read: (storage: SavedStorage) => T, fallback: T): T {
  const seen = useSyncExternalStore(subscribe, () => version, () => ON_SERVER);
  const saved = useMemo(
    () => (seen === ON_SERVER ? null : { value: read(savedStorage) }),
    [seen, read],
  );
  return saved ? saved.value : fallback;
}

/** False on the server and while hydrating; true once saved values are read. */
export function useSavedReady(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
