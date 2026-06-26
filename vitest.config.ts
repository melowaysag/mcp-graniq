import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@graniq/errors": path.resolve(__dirname, "../errors/src/index.ts"),
      "@graniq/types": path.resolve(__dirname, "../types/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/cli.ts", "src/**/*.test.ts"],
      thresholds: { lines: 85, statements: 85, functions: 85, branches: 75 },
    },
  },
});
