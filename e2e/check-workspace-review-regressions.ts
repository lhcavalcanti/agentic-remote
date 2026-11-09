import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium, expect } from '@playwright/test'
import type { Browser, Locator, Page } from '@playwright/test'
import {
  createWorkspaceFixtureState, fixtureBaseUrl, fixtureKnowledgeFiles,
  fixtureKnowledgeRoots, KNOWLEDGE_FILE_PATH, KNOWLEDGE_ROOT_ID,
  PENDING_SESSION_ID, SELECTED_SESSION_ID, setupWorkspaceFixture,
} from './workspace-fixtures'
import type { WorkspaceFixture } from './workspace-fixtures'

const { values } = parseArgs({ options: {
  'base-url': { type: 'string' },
  output: { type: 'string' },
  accents: { type: 'string', default: 'agentic,ocean,violet,ember,rose,teal' },
} })
assert(values['base-url'] && values.output, 'Use --base-url <isolated frontend> --output <new directory>')
const baseUrl = fixtureBaseUrl(values['base-url']).origin
const output = relative(process.cwd(), resolve(values.output))
assert(output && !existsSync(output), 'Never overwrite existing browser evidence')
const accents = values.accents!.split(',')
assert(accents.every((accent) => ['agentic', 'ocean', 'violet', 'ember', 'rose', 'teal'].includes(accent)))
await mkdir(output)
const scratch = join(output, 'browser-runtime')
await mkdir(scratch)
const oldTmp = process.env.TMPDIR
process.env.TMPDIR = resolve(scratch)
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')

async function measure(locator: Locator, surface: string) {
  await expect(locator).toBeVisible()
  await locator.evaluate(async (element) => {
    await document.fonts.ready
    await Promise.all(element.getAnimations().map((animation) => animation.finished))
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  })
  const reading = await locator.evaluate((element) => {
    type RGBA = [number, number, number, number]
    const colors = {
      parse(color: string): RGBA {
        if (/\/\s*0(?:\.0+)?%?\s*\)$/.test(color)) return [0, 0, 0, 0]
        const srgb = color.match(/^color\(srgb\s+(.+)\)$/)
        if (srgb) {
          const [channels, alpha = '1'] = srgb[1].split('/')
          const rgb = channels.trim().split(/\s+/).map(Number)
          if (rgb.length === 3) return [rgb[0], rgb[1], rgb[2], Number(alpha)]
        }
        const rgb = color.match(/^rgba?\((.+)\)$/)
        if (rgb) {
          const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number)
          if (parts.length >= 3) return [parts[0] / 255, parts[1] / 255, parts[2] / 255, parts[3] ?? 1]
        }
        if (!CSS.supports('color', color)) throw new Error(`Unsupported computed color: ${color}`)
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 1
        const context = canvas.getContext('2d')!
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        const pixel = context.getImageData(0, 0, 1, 1).data
        return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, pixel[3] / 255]
      },
      over(front: RGBA, back: RGBA): RGBA {
        const alpha = front[3] + back[3] * (1 - front[3])
        return [
          (front[0] * front[3] + back[0] * back[3] * (1 - front[3])) / alpha,
          (front[1] * front[3] + back[1] * back[3] * (1 - front[3])) / alpha,
          (front[2] * front[3] + back[2] * back[3] * (1 - front[3])) / alpha,
          alpha,
        ]
      },
      // W3C G18: linearize sRGB without rounding the contrast threshold.
      luminance(color: RGBA) {
        const linear = color.slice(0, 3).map((value) =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
      },
    }
    const layers: Array<{ tag: string; color: string; rgba: RGBA }> = []
    let current: Element | null = element
    while (current) {
      const style = getComputedStyle(current)
      if (style.backgroundImage !== 'none' || Number(style.opacity) !== 1) {
        throw new Error('This contrast check requires solid/composited backgrounds without element opacity')
      }
      layers.push({ tag: current.tagName, color: style.backgroundColor, rgba: colors.parse(style.backgroundColor) })
      current = current.parentElement
    }
    let background: RGBA = [1, 1, 1, 1]
    for (const layer of [...layers].reverse()) background = colors.over(layer.rgba, background)
    const style = getComputedStyle(element)
    const foreground = colors.over(colors.parse(style.color), background)
    const first = colors.luminance(foreground), second = colors.luminance(background)
    return {
      foreground: style.color, effectiveForeground: foreground, effectiveBackground: background,
      ratio: (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05),
      fontSize: style.fontSize, fontWeight: style.fontWeight, colorScheme: style.colorScheme, layers,
    }
  })
  return { surface, ...reading }
}

type Measurement = Awaited<ReturnType<typeof measure>> & { appearance: string; accent: string }
const report = {
  sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceHashes: Object.fromEntries(['src/index.css', 'src/App.tsx', 'e2e/workspace-fixtures.ts']
    .map((file) => [file, hash(file)])),
  standard: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum',
  calculation: 'https://www.w3.org/WAI/WCAG22/Techniques/general/G18',
  colorConversion: 'Computed sRGB channels are kept unrounded; other CSS color spaces use the browser canvas sRGB 8-bit conversion.',
  threshold: 4.5,
  viewport: { width: 1440, height: 1000 },
  measurements: [] as Measurement[],
  screenshots: [] as Array<{ file: string; sha256: string }>,
  failures: [] as string[],
  creation: undefined as Record<string, unknown> | undefined,
  tabAccentSync: undefined as Record<string, unknown> | undefined,
  syntheticDataOnly: true,
}
const save = () => writeFile(join(output, 'evidence.json'), `${JSON.stringify(report, null, 2)}\n`)
async function screenshot(page: Page, name: string) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  })
  const file = `${name}.png`
  await page.screenshot({ path: join(output, file), animations: 'disabled', caret: 'hide' })
  report.screenshots.push({ file, sha256: hash(join(output, file)) })
  await save()
}

let browser: Browser | undefined
const originalDocument = structuredClone(fixtureKnowledgeFiles[KNOWLEDGE_FILE_PATH])
fixtureKnowledgeFiles[KNOWLEDGE_FILE_PATH] = {
  ...originalDocument,
  content: `# Synthetic inline-code reference\n\nKeep \`session.cwd\` on its owning computer.\n\n${originalDocument.content}`,
}
try {
  browser = await chromium.launch({ headless: true })
  for (const appearance of ['light', 'graphite'] as const) {
    for (const accent of accents) {
      const context = await browser.newContext({
        viewport: report.viewport, deviceScaleFactor: 1, serviceWorkers: 'block',
        reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'UTC',
      })
      const page = await context.newPage()
      page.setDefaultTimeout(12_000)
      const state = createWorkspaceFixtureState()
      const session = state.sessions.find((entry) => entry.id === PENDING_SESSION_ID)!
      session.messages.at(-1)!.content += '\n\nReview `session.cwd` before choosing.'
      session.pendingUserInput = {
        requestId: 'fixture-contrast-question', question: 'What should the workspace restore first?',
        choices: [], allowFreeform: false,
        form: { fields: [{
          name: 'restore', title: 'Restore first', type: 'string', required: true, default: 'conversation',
          options: [
            { value: 'conversation', label: 'Conversation first' },
            { value: 'document', label: 'Document first' },
            { value: 'both', label: 'Both together' },
          ],
        }] },
      }
      const key = `${session.computerId}:${session.id}`
      const fixture = await setupWorkspaceFixture(page, {
        baseUrl, state, appearance, selectedSessionId: session.id, knowledgeMode: 'docked',
        knowledgePositions: { [key]: { rootId: KNOWLEDGE_ROOT_ID, path: 'handbook', file: KNOWLEDGE_FILE_PATH } },
      })
      await context.addInitScript((theme) => {
        sessionStorage.setItem('agentic-remote:accent-theme', theme)
      }, accent)
      try {
        await page.goto(fixture.url)
        await expect(page.locator('.app-shell')).toHaveAttribute('data-accent-theme', accent)
        await expect(page.locator('.app-shell')).toHaveAttribute('data-appearance', appearance)
        const collect = async (locator: Locator, surface: string) => {
          const reading = { appearance, accent, ...await measure(locator, surface) }
          report.measurements.push(reading)
          if (reading.ratio < report.threshold) report.failures.push(`${appearance}/${accent}/${surface}: ${reading.ratio}`)
        }
        await collect(page.locator('.message__content p > code').first(), 'conversation-inline-code')
        await collect(page.locator('.markdown-body p > code').first(), 'reader-inline-code')

        await page.getByRole('button', { name: 'Choose Knowledge root', exact: true }).click()
        const chooser = page.getByRole('dialog', { name: 'Choose a session root', exact: true })
        const changedRoot = fixtureKnowledgeRoots[1]
        await chooser.getByRole('radio', {
          name: `${changedRoot.name} on ${changedRoot.computerName}: ${changedRoot.path}`, exact: true,
        }).check()
        fixture.emit({
          type: 'session.knowledge.updated', computerId: session.computerId, sessionId: session.id,
          binding: { ...state.bindings.get(key)!, rootId: changedRoot.id, root: changedRoot, revision: 2 },
        })
        await chooser.getByRole('button', { name: 'Use for this session', exact: true }).click()
        await expect(chooser.getByText(/saved root changed in another client/)).toBeVisible()
        await chooser.getByRole('button', { name: 'Cancel', exact: true }).click()
        await collect(page.locator('.error-banner span').first(), 'error-banner')

        const trigger = page.getByRole('button', { name: 'Restore first', exact: true })
        await collect(trigger, 'question-trigger')
        await trigger.click()
        const menu = page.getByRole('listbox', { name: 'Restore first options', exact: true })
        await collect(menu.getByRole('option', { name: 'Conversation first', exact: true }), 'question-selected-option')
        await collect(menu.getByRole('option', { name: 'Both together', exact: true }), 'question-unselected-option')
        await menu.getByRole('option', { name: 'Document first', exact: true }).hover()
        await collect(menu.getByRole('option', { name: 'Document first', exact: true }), 'question-highlighted-option')
        expect(await page.evaluate(() => sessionStorage.getItem('agentic-remote:accent-theme'))).toBe(accent)
        fixture.assertHealthy()
        await screenshot(page, `${appearance}-${accent}`)
      } catch (error) {
        report.failures.push(`${appearance}/${accent}: ${String(error)}`)
        await screenshot(page, `${appearance}-${accent}-failure`).catch(() => {})
      } finally {
        await context.close()
      }
    }
  }

  {
    const context = await browser.newContext({
      viewport: report.viewport, serviceWorkers: 'block', reducedMotion: 'reduce',
    })
    const first = await context.newPage()
    const state = createWorkspaceFixtureState()
    state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!.messages.at(-1)!.content += '\n\nReview `session.cwd`.'
    const fixture = await setupWorkspaceFixture(first, { baseUrl, state, appearance: 'light', knowledgeMode: 'hidden' })
    await context.addInitScript(() => {
      const theme = new URL(location.href).searchParams.get('proofAccent')
      if (theme) sessionStorage.setItem('agentic-remote:accent-theme', theme)
    })
    try {
      // Accent is synced: the first tab's earlier choice fills the hub's unset
      // accent, a second tab's earlier choice must not replace it, and a choice
      // made in one tab reaches the other live.
      const code = (page: Page) => page.locator('.message__content p > code').first()
      await first.goto(`${fixture.url}&proofAccent=ocean`)
      await expect(first.locator('.app-shell')).toHaveAttribute('data-accent-theme', 'ocean')
      const before = await measure(code(first), 'first-tab-inline-code')
      const second = await context.newPage()
      await second.goto(`${fixture.url}&proofAccent=violet`)
      await expect(second.locator('.app-shell')).toHaveAttribute('data-accent-theme', 'ocean')
      const other = await measure(code(second), 'second-tab-inline-code')
      const kept = await measure(code(first), 'first-tab-after-opening-second')
      await second.getByRole('button', { name: 'App settings', exact: true }).click()
      await second.getByRole('radiogroup', { name: 'Accent color', exact: true })
        .getByText('Violet', { exact: true }).click()
      await expect(second.getByRole('radio', { name: 'Violet accent', exact: true })).toBeChecked()
      await expect(first.locator('.app-shell')).toHaveAttribute('data-accent-theme', 'violet')
      const after = await measure(code(first), 'first-tab-after-second-chose')
      expect(other.foreground).toBe(before.foreground)
      expect(kept.foreground).toBe(before.foreground)
      expect(after.foreground).not.toBe(before.foreground)
      expect(Math.min(before.ratio, other.ratio, kept.ratio, after.ratio)).toBeGreaterThanOrEqual(report.threshold)
      fixture.assertHealthy()
      report.tabAccentSync = { passed: true, before, other, kept, after }
    } catch (error) {
      report.tabAccentSync = { passed: false, error: String(error) }
      report.failures.push(`tab accents: ${String(error)}`)
    } finally {
      await context.close()
    }
  }

  const context = await browser.newContext({
    viewport: report.viewport, serviceWorkers: 'block', reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  page.setDefaultTimeout(12_000)
  const state = createWorkspaceFixtureState()
  const session = state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
  const key = `${session.computerId}:${session.id}`
  const updates: Array<{ rootId: string; expectedRevision: number }> = []
  const statuses: number[] = []
  let fixture: WorkspaceFixture | undefined
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname.endsWith('/knowledge-root')) {
      updates.push(request.postDataJSON())
    }
  })
  page.on('response', (response) => {
    if (response.request().method() === 'PUT' && new URL(response.url()).pathname.endsWith('/knowledge-root')) {
      statuses.push(response.status())
    }
  })
  try {
    fixture = await setupWorkspaceFixture(page, { baseUrl, state, selectedSessionId: session.id })
    await page.goto(fixture.url)
    const selector = page.getByRole('button', { name: 'Choose Knowledge root', exact: true })
    await selector.click()
    const chooser = page.getByRole('dialog', { name: 'Choose a session root', exact: true })
    const directory = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/directories'))
    await chooser.getByRole('button', { name: /Browse another folder/ }).click()
    const listing = await directory
    const folder = page.getByRole('dialog', { name: 'Add knowledge root', exact: true })
    if (listing.status() !== 200) {
      await expect(folder.getByText(/Unmocked API request/)).toBeVisible()
      await screenshot(page, 'creation-directory-failure')
      throw new Error(`Browse another folder directory request returned ${listing.status()}`)
    }
    const parent = folder.getByRole('button', { name: 'Parent folder', exact: true })
    if (await parent.count()) await parent.click()
    await expect(folder.getByText('/home/demo', { exact: true })).toBeVisible()
    const changedRoot = fixtureKnowledgeRoots[1]
    fixture.emit({
      type: 'session.knowledge.updated', computerId: session.computerId, sessionId: session.id,
      binding: { ...state.bindings.get(key)!, rootId: changedRoot.id, root: changedRoot, revision: 2 },
    })
    const add = folder.getByRole('button', { name: 'Add this folder', exact: true })
    await add.click()
    await expect(folder.getByText(/saved root changed in another client/)).toBeVisible()
    expect(updates).toEqual([{ rootId: 'fixture-created-1', expectedRevision: 1 }])
    expect(statuses).toEqual([409])
    expect(state.bindings.get(key)).toMatchObject({ rootId: changedRoot.id, revision: 2 })
    await screenshot(page, 'creation-conflict')
    await add.click()
    await expect(folder).toHaveCount(0)
    await expect(selector).toContainText('demo')
    expect(updates.map((entry) => entry.expectedRevision)).toEqual([1, 2])
    expect(statuses).toEqual([409, 200])
    expect(state.bindings.get(key)).toMatchObject({ rootId: 'fixture-created-1', revision: 3 })
    expect(fixture.requests.filter((request) => request.method !== 'GET' && /\/(messages|commands)$/.test(request.path))).toEqual([])
    fixture.assertHealthy()
    await screenshot(page, 'creation-explicit-retry-success')
    report.creation = { passed: true, updates, statuses, finalBinding: state.bindings.get(key), requests: fixture.requests }
  } catch (error) {
    report.creation = { passed: false, updates, statuses, error: String(error), requests: fixture?.requests }
    report.failures.push(`creation: ${String(error)}`)
    await screenshot(page, 'creation-failure').catch(() => {})
  } finally {
    await context.close()
  }
} finally {
  fixtureKnowledgeFiles[KNOWLEDGE_FILE_PATH] = originalDocument
  await browser?.close()
  await rm(scratch, { recursive: true })
  if (oldTmp === undefined) delete process.env.TMPDIR
  else process.env.TMPDIR = oldTmp
  await save()
}
console.log(JSON.stringify({
  sourceSha: report.sourceSha, measurements: report.measurements.length,
  minimumByAppearance: Object.fromEntries(['light', 'graphite'].map((appearance) => [
    appearance, Math.min(...report.measurements.filter((entry) => entry.appearance === appearance).map((entry) => entry.ratio)),
  ])),
  failures: report.failures, creationPassed: report.creation?.passed, output,
}, null, 2))
assert.equal(report.failures.length, 0, `Review regressions failed; see ${join(output, 'evidence.json')}`)
