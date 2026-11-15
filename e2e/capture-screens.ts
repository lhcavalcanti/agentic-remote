import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from '@playwright/test'
import { assertNoHorizontalOverflow, createUIScenes, uiContextOptions, uiSceneNames, uiViewports } from './ui-scenes'
import { fixtureBaseUrl } from './workspace-fixtures'
import { captureOutputDirectory, startFixtureFrontend } from './fixture-frontend'

const { values } = parseArgs({
  // pnpm forwards the conventional separator after the script name.
  args: process.argv.slice(2).filter((argument) => argument !== '--'),
  options: {
    'output-dir': { type: 'string' },
    'base-url': { type: 'string' },
    'no-build': { type: 'boolean', default: false },
    scene: { type: 'string', multiple: true },
    viewport: { type: 'string', multiple: true },
    help: { type: 'boolean' },
  },
})

if (values.help) {
  console.log('pnpm screens -- --output-dir <dir> [--scene <name> ...] [--viewport desktop|foldable|phone ...] [--base-url <loopback origin>] [--no-build]\n' +
    `Scenes: ${uiSceneNames.join(', ')}\n` +
    'Builds once and starts/stops a frontend-only server on an ephemeral loopback port.\n' +
    '--no-build reuses the worktree-local Playwright frontend build; --base-url uses an already-running frontend instead.\n' +
    'All domain traffic is mocked. Production ports 4317/4318 and system temporary output directories are refused.')
  process.exit(0)
}
if (!values['output-dir']) throw new Error('Required: --output-dir <directory>')
const externalUrl = values['base-url'] ? fixtureBaseUrl(values['base-url']).origin : undefined
for (const name of values.scene ?? []) {
  if (!uiSceneNames.some((scene) => scene === name)) throw new Error(`Unknown scene: ${name}`)
}
for (const name of values.viewport ?? []) {
  if (!uiViewports.some((viewport) => viewport.name === name)) throw new Error(`Unknown viewport: ${name}`)
}
const outputDir = await captureOutputDirectory(values['output-dir'])
await mkdir(outputDir, { recursive: true })
const frontend = externalUrl ? undefined : await startFixtureFrontend(values['no-build'])
try {
  const scenes = createUIScenes(externalUrl ?? frontend!.url)
  const browser = await chromium.launch()
  try {
    for (const viewport of uiViewports.filter((viewport) => !values.viewport?.length || values.viewport.includes(viewport.name))) {
      for (const scene of scenes.filter((scene) => !values.scene?.length || values.scene.includes(scene.name))) {
        const context = await browser.newContext({
          ...uiContextOptions,
          viewport: viewport.viewport,
          isMobile: viewport.isMobile,
          hasTouch: viewport.hasTouch,
        })
        try {
          const page = await context.newPage()
          const fixture = await scene.setup(page)
          try {
            await assertNoHorizontalOverflow(page)
            const path = join(outputDir, `${viewport.name}-${scene.name}.png`)
            let previous: Buffer | undefined
            let stable: Buffer | undefined
            for (let attempt = 0; attempt < 6; attempt++) {
              const frame = await page.screenshot({ animations: 'disabled', caret: 'hide' })
              if (previous?.equals(frame)) {
                stable = frame
                break
              }
              previous = frame
            }
            if (!stable) throw new Error(`${viewport.name}-${scene.name} did not settle.`)
            await writeFile(path, stable)
            console.log(path)
          } finally {
            fixture.assertHealthy()
          }
        } finally {
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
} finally {
  await frontend?.close()
}
