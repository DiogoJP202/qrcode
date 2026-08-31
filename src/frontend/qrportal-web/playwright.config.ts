import { defineConfig, devices } from "@playwright/test";

const connectionString = process.env["QRPORTAL_E2E_CONNECTION"] ?? "Host=127.0.0.1;Port=5432;Database=qrportal_test;Username=qrportal;Password=qrportal_test";
const apiUrl = "http://127.0.0.1:5143";
const webUrl = "http://127.0.0.1:4300";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env["CI"] ? 2 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: `dotnet run --project ../../backend/QrPortal.Api --configuration Release --no-build --no-launch-profile --urls ${apiUrl}`,
      url: `${apiUrl}/health/live`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ASPNETCORE_ENVIRONMENT: "E2E",
        AllowedHosts: "localhost;127.0.0.1",
        ConnectionStrings__DefaultConnection: connectionString,
        Frontend__Origin: webUrl,
        Frontend__PublicBaseUrl: webUrl,
        Storage__Provider: "Local",
        Storage__LocalRoot: "./data/e2e-uploads",
        Storage__PublicBaseUrl: `${apiUrl}/files`,
      },
    },
    {
      command: "pnpm exec ng serve --host 127.0.0.1 --port 4300 --proxy-config proxy.e2e.conf.json --live-reload=false --hmr=false --prebundle=false",
      url: webUrl,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { CI: "true" },
    },
  ],
});
