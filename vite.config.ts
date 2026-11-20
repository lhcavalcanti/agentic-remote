import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test files that drive a real tmux server. Everything else belongs to `fast`,
// which must pass without tmux, Copilot or Claude installed (the hosted light
// check runs a quick subset of it), so a new file that needs tmux must be
// listed here.
//
// `canary` is the quick real-tmux send and readiness subset (about a minute).
const canaryTests = [
  'server/send-matrix.integration.test.ts',
  'server/terminal-queue-delivery.test.ts',
  'server/tmux-test-helpers.integration.test.ts',
]
// The rest of the real-tmux suite, which takes most of the full run.
const tmuxTests = [
  'server/active-sessions.test.ts',
  'server/cli-canary.test.ts',
  'server/terminal-form-viewport.test.ts',
  'server/terminal-session.test.ts',
  'server/terminal-startup-queue.test.ts',
  'server/tmux-errors.integration.test.ts',
]

// Non-tmux files left out of `pnpm test:quick`, the subset the advisory hosted
// check runs on every pull request head. That job is billed per started minute
// and must finish install, lint, type-check, build and these tests within 60
// seconds on a GitHub runner, which leaves roughly 10 seconds for tests
// (docs/deployment-promotion.md). Each file listed here took 0.1 seconds or
// more locally, counting environment setup and imports; that includes every
// jsdom file, whose environment alone costs about 0.6 seconds. A new file joins
// the quick subset by default: if it is that slow, add it here. Every file still
// runs in `pnpm test`, `pnpm test:fast` and the local promotion gate.
const slowTests = [
  'e2e/capture-screens.test.ts',
  'graphify/manage.test.ts',
  'server/agent-service-recovery.test.ts',
  'server/agent-service-side-question.test.ts',
  'server/agent-service.test.ts',
  'server/api-origin.test.ts',
  'server/app-build.test.ts',
  'server/app-icon-assets.test.ts',
  'server/background-task-stop.test.ts',
  'server/claude-agent-service.test.ts',
  'server/claude-recovery-admission.test.ts',
  'server/client-presence.test.ts',
  'server/computer-manager-metadata.test.ts',
  'server/conversation-recovery.test.ts',
  'server/delegated-transcription-service.test.ts',
  'server/doctor-cli.test.ts',
  'server/dreamer-app.test.ts',
  'server/dreamer-planner.test.ts',
  'server/dreamer-routes.test.ts',
  'server/dreamer-schedule.test.ts',
  'server/dreamer-service.test.ts',
  'server/dreamer-store.test.ts',
  'server/file-upload-routes.test.ts',
  'server/feature-flags.test.ts',
  'server/full-gate.test.ts',
  'server/history-projection.test.ts',
  'server/host-telemetry/processes.test.ts',
  'server/host-telemetry/sampler.test.ts',
  'server/host-telemetry/remote.test.ts',
  'server/host-telemetry/transport.test.ts',
  'server/hub-routes.test.ts',
  'server/launch-identity.test.ts',
  'server/logs-cli.test.ts',
  'server/manager-agent.test.ts',
  'server/manager-routes.test.ts',
  'server/manager-structured-memory-performance.test.ts',
  'server/manager-structured-memory-search.test.ts',
  'server/manager-structured-memory-store.test.ts',
  'server/manager-structured-memory-validation.test.ts',
  'server/manager-tools.test.ts',
  'server/multi-node.test.ts',
  'server/notification-scope.integration.test.ts',
  'server/notification-center.integration.test.ts',
  'server/notification-classifier.test.ts',
  'server/notification-store.test.ts',
  'server/promotion-monitor.test.ts',
  'server/promotion-setup-execution.test.ts',
  'server/push-notification-service.test.ts',
  'server/queued-dispatch.test.ts',
  'server/queued-provider-dispatch.test.ts',
  'server/recovery-resend-durability.test.ts',
  'server/recovery-seed-guards.test.ts',
  'server/refusal-metrics-routes.test.ts',
  'server/refusal-metrics.test.ts',
  'server/release-publication.test.ts',
  'server/remote-node-client.test.ts',
  'server/response-compression.test.ts',
  'server/schedule-launcher.test.ts',
  'server/schedule-worktrees.test.ts',
  'server/scheduler-routes.test.ts',
  'server/scheduler.test.ts',
  'server/session-admission-lifecycle.test.ts',
  'server/session-clear-transcript.test.ts',
  'server/session-enqueue-clear.test.ts',
  'server/session-knowledge-routes.test.ts',
  'server/session-knowledge-store.test.ts',
  'server/session-metadata-provenance.test.ts',
  'server/session-order-routes.test.ts',
  'server/session-patch-integration.test.ts',
  'server/session-patch-routes.test.ts',
  'server/session-patches.test.ts',
  'server/session-reply-durability.test.ts',
  'server/session-resource-clear.test.ts',
  'server/session-resource-providers.test.ts',
  'server/session-resource-routes.test.ts',
  'server/session-resource-transport.test.ts',
  'server/session-retention.test.ts',
  'server/session-store-durability.test.ts',
  'server/session-store-providers.test.ts',
  'server/session-store-serialization.test.ts',
  'server/session-store.test.ts',
  'server/settings-profile-routes.test.ts',
  'server/settings-profile-store.test.ts',
  'server/startup-phases.test.ts',
  'server/submission-error-http.test.ts',
  'server/terminal-send-uncertainty.test.ts',
  'server/tmux-errors.test.ts',
  'server/transcription-media-digests.test.ts',
  'server/transcription-routes.test.ts',
  'src/App.test.tsx',
  'src/DocumentViewControls.test.tsx',
  'src/HtmlPreview.test.tsx',
  'src/KnowledgeRootChoices.test.tsx',
  'src/KnowledgeRootSelector.test.tsx',
  'src/ManagerAssistant.test.tsx',
  'src/MarkdownCodeBlock.test.tsx',
  'src/ModelFamilyIcon.test.tsx',
  'src/MermaidDiagram.real.test.tsx',
  'src/MermaidDiagram.test.tsx',
  'src/OracleSettings.test.tsx',
  'src/OracleDreamer.test.tsx',
  'src/PreviewFeaturesSettings.test.tsx',
  'src/ReaderWorkspace.test.tsx',
  'src/RecentlyClosed.test.tsx',
  'src/SessionActions.test.tsx',
  'src/SessionNavigation.test.tsx',
  'src/SessionResources.test.tsx',
  'src/SessionRetentionSettings.test.tsx',
  'src/api.test.ts',
  'src/features/prompts/PromptCards.test.tsx',
  'src/markdown-document/pipeline.test.tsx',
  'src/markdown-document/renderer.test.ts',
  'src/markdown-document/use-markdown-document.test.tsx',
  'src/markdown-navigation.test.ts',
  'src/pwa.test.ts',
  'src/remark-safe-breaks.test.tsx',
  'src/settings/sections.test.ts',
  'src/settings-profile.test.ts',
  'src/shell.test.ts',
  'src/use-session-knowledge-root.test.tsx',
  'src/voice-recorder.test.ts',
  'server/app-provenance.test.ts',
  'server/host-telemetry/alerts.test.ts',
  'server/host-telemetry/session-pane-roots.test.ts',
  'server/hub-health.test.ts',
  'server/schedule-notification-service.test.ts',
  'server/schedule-notifications.integration.test.ts',
  'server/scheduler-proposals.test.ts',
  'server/session-provenance.test.ts',
  'server/skill-settings-routes.test.ts',
  'server/skill-settings.test.ts',
  'shared/schedule-recurrence.test.ts',
  'src/ScheduleProposalCards.test.tsx',
  'src/SessionOriginBadge.test.tsx',
  'src/composer/Composer.test.tsx',
  'src/composer/ComposerActions.test.tsx',
  'src/composer/RuntimeStatus.test.tsx',
  'src/composer/SendControl.test.tsx',
  'src/composer/SentMessages.test.tsx',
  'src/computers/ComputersDialog.test.tsx',
  'src/host-monitor/HostMonitorView.test.tsx',
  'src/notifications/NotificationPanel.test.tsx',
  'src/notifications/use-notifications.test.tsx',
  'src/rail/ShellNavigation.test.tsx',
  'src/scheduler/ScheduleForm.test.tsx',
  'src/scheduler/SchedulerView.test.tsx',
  'src/settings/HealthCard.test.tsx',
  'src/settings/SettingsNavigation.test.tsx',
  'src/settings/SkillsSettings.test.tsx',
]

// A renamed or deleted file would otherwise drop out of these lists silently.
for (const file of [...canaryTests, ...tmuxTests, ...slowTests]) {
  if (!existsSync(new URL(`./${file}`, import.meta.url))) {
    throw new Error(`vite.config.ts lists a missing test file: ${file}`)
  }
}

const oracleVoiceAssetNames = new Set([
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
  'silero_vad_v5.onnx',
  'vad.worklet.bundle.min.js',
])

const packageVersion = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { version: string }
const oracleVoiceThirdPartyNotices = readFileSync(
  new URL('./docs/licenses/oracle-voice-browser.txt', import.meta.url),
  'utf8',
) + '\n\n' + readFileSync(
  new URL(
    './docs/licenses/onnxruntime-1.24.2-third-party-notices.txt',
    import.meta.url,
  ),
  'utf8',
)

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const buildId = command === 'build' ? randomUUID() : packageVersion.version
  const oracleVoiceE2eBuild = process.env.AGENTIC_REMOTE_E2E_BUILD === '1'
  return {
    define: {
      __APP_VERSION__: JSON.stringify(packageVersion.version),
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    // Module workers (the Markdown document renderer) are built as modules.
    // micromark's entity decoder resolves to a `browser` build that decodes
    // through the DOM, which a worker does not have; take its plain build.
    worker: {
      format: 'es',
      plugins: () => [{
        name: 'worker-dom-free-entity-decoder',
        enforce: 'pre',
        async resolveId(source, importer, options) {
          if (source !== 'decode-named-character-reference') return null
          const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
          return resolved && { ...resolved, id: resolved.id.replace(/index\.dom\.js$/, 'index.js') }
        },
      }],
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
          this.emitFile({
            type: 'asset',
            fileName: 'oracle-voice-assets/THIRD_PARTY_NOTICES.txt',
            source: oracleVoiceThirdPartyNotices,
          })
        },
      },
    ],
    resolve: oracleVoiceE2eBuild
      ? {
          alias: [{
            find: /^@ricky0123\/vad-web$/,
            replacement: fileURLToPath(
              new URL('./e2e/fixtures/fake-vad.ts', import.meta.url),
            ),
          }],
        }
      : undefined,
    build: {
      assetsInlineLimit(filePath) {
        return oracleVoiceAssetNames.has(filePath.split(/[\\/]/).at(-1) ?? '')
          ? false
          : undefined
      },
      rollupOptions: {
        output: {
          assetFileNames(assetInfo) {
            const sourceName = assetInfo.names.find((name) =>
              oracleVoiceAssetNames.has(name.split('/').at(-1) ?? ''))
            const baseName = sourceName?.split('/').at(-1)
            return baseName
              ? `oracle-voice-assets/${baseName}`
              : 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
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
      // These two are Playwright specs, like `*.pw.ts`; the fixtures' own unit
      // tests under `e2e/` run here with the rest.
      exclude: [
        ...configDefaults.exclude,
        'e2e/oracle-conversation.test.ts',
        'e2e/oracle-conversation-real.test.ts',
      ],
      // React resolves to its production CJS build when NODE_ENV=production, and
      // that build omits `act`, so every component test fails. `pnpm start` and
      // the systemd unit both export NODE_ENV=production, so pin it here to keep
      // the test run independent of the ambient environment.
      env: { NODE_ENV: 'development', AGENTIC_REMOTE_STORE_FREEZE: '1' },
      // Stylesheets stay stubbed so components render as before, except an
      // explicit `?raw` read, which theme tests use to check the real tokens.
      css: { include: [/\.css\?raw$/] },
      // The suite is run one file at a time.
      //
      // Some of it reaches the machine itself rather than a fake: one file
      // creates tmux windows and Copilot processes while another enumerates
      // them. Run together they see each other's work and report it as the
      // code's, which is a failure nobody can reproduce alone.
      fileParallelism: false,
      maxWorkers: 1,
      testTimeout: 30_000,
      // The projects split the files without overlap, so `pnpm test` still
      // runs each file once. Each group finishes before the next starts.
      projects: [
        {
          extends: true,
          test: {
            name: 'fast',
            // `vitest --mode quick` (`pnpm test:quick`) also leaves out the slow files.
            exclude: [
              ...configDefaults.exclude,
              ...canaryTests,
              ...tmuxTests,
              ...(mode === 'quick' ? slowTests : []),
            ],
            sequence: { groupOrder: 0 },
          },
        },
        {
          extends: true,
          test: { name: 'canary', include: canaryTests, sequence: { groupOrder: 1 } },
        },
        {
          extends: true,
          test: { name: 'tmux', include: tmuxTests, sequence: { groupOrder: 2 } },
        },
      ],
    },
  }
})
