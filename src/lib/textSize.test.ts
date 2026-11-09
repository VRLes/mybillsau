import { describe, expect, it } from "vitest";
import { loadTextSize, saveTextSize } from "./textSize";

/** A stand-in for localStorage, starting empty like a first visit. */
function freshStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

describe("Text size: a remembered choice across the whole app", () => {
  it("gives a first-time visitor Large text", () => {
    expect(loadTextSize(freshStorage())).toBe("large");
  });

  it("remembers the Person's choice after a reload", () => {
    const storage = freshStorage();
    saveTextSize(storage, "extra-large");
    expect(loadTextSize(storage)).toBe("extra-large");

    saveTextSize(storage, "normal");
    expect(loadTextSize(storage)).toBe("normal");
  });

  it("falls back to Large when what was saved is not a Text size", () => {
    const storage = freshStorage();
    storage.setItem("textSize", "huge");
    expect(loadTextSize(storage)).toBe("large");
  });
});
