import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    passWithNoTests: true,
    globalSetup: ["./vitest.global-setup.ts"],
    env: {
      DATABASE_URL: "file:./test.db",
      APP_BASE_URL: "http://localhost:3000",
    },
  },
});
