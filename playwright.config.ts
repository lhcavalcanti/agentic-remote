import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.ts',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4395',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'pnpm dev:web --host 127.0.0.1 --port 4395',
    url: 'http://127.0.0.1:4395',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
