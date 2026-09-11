import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const packageVersion = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const buildId = command === 'build' ? randomUUID() : packageVersion.version
  return {
    define: {
      __APP_VERSION__: JSON.stringify(packageVersion.version),
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    plugins: [
      react(),
      {
        name: 'app-build-identity',
        apply: 'build',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'build-info.json',
            source: JSON.stringify({ version: packageVersion.version, buildId }),
          })
          // Persist the identity in the worker itself: browsers may refetch an
          // older registration URL after a deployment, rollback, or restart.
          this.emitFile({
            type: 'asset',
            fileName: 'sw.js',
            source: `self.AGENTIC_REMOTE_BUILD_ID = ${JSON.stringify(buildId)};\n${
              readFileSync(new URL('./public/sw.js', import.meta.url), 'utf8')
            }`,
          })
        },
      },
    ],
    server: {
      host: '127.0.0.1',
      port: 4317,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:4318',
          ws: true,
        },
      },
    },
    test: {
      // React resolves to its production CJS build when NODE_ENV=production, and
      // that build omits `act`, so every component test fails. `pnpm start` and
      // the systemd unit both export NODE_ENV=production, so pin it here to keep
      // the test run independent of the ambient environment.
      env: { NODE_ENV: 'development' },
      // The suite is run one file at a time.
      //
      // Some of it reaches the machine itself rather than a fake: one file
      // creates tmux windows and Copilot processes while another enumerates
      // them. Run together they see each other's work and report it as the
      // code's, which is a failure nobody can reproduce alone.
      fileParallelism: false,
    },
  }
})
