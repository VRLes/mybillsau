import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run as if in Sydney, so date tests catch the UTC-midnight bug on any machine
    env: { TZ: "Australia/Sydney" },
  },
});
