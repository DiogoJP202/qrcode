import { defineConfig, devices } from "@playwright/test";

const connectionString = process.env["QRPORTAL_E2E_CONNECTION"] ?? "Host=127.0.0.1;Port=5432;Database=qrportal_test;Username=qrportal;Password=qrportal_test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "dotnet run --project ../../backend/QrPortal.Api --configuration Release --no-build --no-launch-profile --urls http://127.0.0.1:5043",
      url: "http://127.0.0.1:5043/health/live",
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
      env: {
        ASPNETCORE_ENVIRONMENT: "E2E",
        AllowedHosts: "localhost;127.0.0.1",
        ConnectionStrings__DefaultConnection: connectionString,
        Frontend__Origin: "http://127.0.0.1:4200",
        Frontend__PublicBaseUrl: "http://127.0.0.1:4200",
        Storage__Provider: "Local",
        Storage__LocalRoot: "./data/e2e-uploads",
        Storage__PublicBaseUrl: "http://127.0.0.1:5043/files",
      },
    },
    {
      command: "pnpm exec ng serve --host 127.0.0.1 --port 4200",
      url: "http://127.0.0.1:4200",
      reuseExistingServer: !process.env["CI"],
      timeout: 120_000,
    },
  ],
});
