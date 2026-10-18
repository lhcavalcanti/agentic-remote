import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/*.pw.ts', '**/oracle-conversation.test.ts'],
  fullyParallel: false,
  workers: 1,
  projects: [
    {
      name: 'chromium',
      testMatch: ['**/*.pw.ts', '**/oracle-conversation.test.ts'],
      use: { ...devices['Desktop Chrome'], hasTouch: true },
    },
    {
      name: 'firefox',
      testMatch: '**/oracle-conversation.test.ts',
      use: { ...devices['Desktop Firefox'], hasTouch: true },
    },
    {
      name: 'webkit',
      testMatch: '**/oracle-conversation.test.ts',
      use: { ...devices['Desktop Safari'], hasTouch: true },
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4395',
    hasTouch: true,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec tsc -b && AGENTIC_REMOTE_E2E_BUILD=1 pnpm exec vite build --outDir test-results/oracle-conversation-dist-e2e --emptyOutDir && AGENTIC_REMOTE_RELEASE_DIR=$PWD/test-results/oracle-conversation-dist-e2e AGENTIC_REMOTE_ALLOWED_ORIGINS=http://127.0.0.1:4395 pnpm tsx e2e/fixtures/fake-voice.ts --serve --port 4395',
    url: 'http://127.0.0.1:4395/health',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
