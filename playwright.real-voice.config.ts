import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/oracle-conversation-real.test.ts'],
  fullyParallel: false,
  workers: 1,
  projects: [{
    name: 'chromium-real-voice',
    use: { ...devices['Desktop Chrome'], hasTouch: true },
  }],
  use: {
    baseURL: 'http://127.0.0.1:4396',
    hasTouch: true,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec tsc -b && AGENTIC_REMOTE_E2E_BUILD=1 pnpm exec vite build --outDir test-results/oracle-conversation-real-dist-e2e --emptyOutDir && AGENTIC_REMOTE_RELEASE_DIR=$PWD/test-results/oracle-conversation-real-dist-e2e AGENTIC_REMOTE_ALLOWED_ORIGINS=http://127.0.0.1:4396 pnpm tsx e2e/fixtures/real-voice.ts --serve --port 4396',
    url: 'http://127.0.0.1:4396/health',
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
