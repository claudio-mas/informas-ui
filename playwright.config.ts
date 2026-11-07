import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/navegador",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: "./.test-work/playwright",
  use: { baseURL: "http://127.0.0.1:4310", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npx vite --config catalog/vite.config.ts --port 4310 --strictPort",
    url: "http://127.0.0.1:4310",
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
