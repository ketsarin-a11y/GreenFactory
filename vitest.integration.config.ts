import { defineConfig } from "vitest/config";
import path from "node:path";

// Runs against a real MySQL database (greenfactory_test), migrated and seeded once.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    globalSetup: ["./tests/integration/global-setup.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 300_000,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
