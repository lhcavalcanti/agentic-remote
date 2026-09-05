import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { spawnSync } from 'node:child_process'
import ffmpeg from 'ffmpeg-static'
import { chromium, expect, webkit } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import {
  createWorkspaceFixtureState,
  fixtureBaseUrl,
  fixtureKnowledgeRoots,
  fixtureSessions,
  IDLE_SESSION_ID,
  KNOWLEDGE_DOCUMENT_TITLE,
  SECOND_KNOWLEDGE_ROOT_ID,
  SELECTED_SESSION_ID,
  setupWorkspaceFixture,
} from './workspace-fixtures'
import type { WorkspaceFixture, WorkspaceFixtureOptions } from './workspace-fixtures'

const { values } = parseArgs({ options: {
  'base-url': { type: 'string' },
  output: { type: 'string' },
  browser: { type: 'string', default: 'chromium' },
  'executable-path': { type: 'string' },
} })
if (!values['base-url'] || !values.output || !['chromium', 'webkit'].includes(values.browser || '')) {
  throw new Error('Use --base-url <isolated loopback origin> --output <folder> [--browser chromium|webkit].')
}
const baseUrl = fixtureBaseUrl(values['base-url']).origin
const output = resolve(values.output)
const scratch = resolve('e2e', `.workbench-review-${process.pid}`)
await mkdir(output, { recursive: true })
await mkdir(scratch)
const oldTmp = process.env.TMPDIR
process.env.TMPDIR = scratch
let browser: Browser | undefined
const geometry: object[] = []

async function pageFor(
  width: number,
  height: number,
  options: Omit<WorkspaceFixtureOptions, 'baseUrl'> = {},
) {
  if (!browser) throw new Error('The review browser has not started.')
  const context = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: 1,
    isMobile: width <= 960, hasTouch: width <= 960,
    serviceWorkers: 'block', reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'UTC',
  })
  const page = await context.newPage()
  page.setDefaultTimeout(12_000)
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl, preserveStorageOnReload: true, knowledgeMode: 'hidden', ...options,
  })
  await page.goto(fixture.url)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  fixture.assertHealthy()
  return { page, fixture, context }
}

async function screenshot(page: Page, fixture: WorkspaceFixture, name: string) {
  fixture.assertHealthy()
  await page.mouse.move(0, 0)
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width)
  await page.screenshot({ path: join(output, `${name}.png`), animations: 'disabled', caret: 'hide' })
}

async function phoneSurface(page: Page, name: string) {
  const sidebar = page.locator('.sidebar.sidebar--open')
  if (await sidebar.count()) await expect(sidebar).toBeInViewport({ ratio: 1 })
  const measured = await page.evaluate(() => {
    const surface = document.querySelector('.sidebar.sidebar--open') ||
      document.querySelector('.knowledge-panel:not([hidden])') ||
      document.querySelector('.conversation:not([hidden])')
    if (!surface) throw new Error('No phone surface is visible.')
    const box = surface.getBoundingClientRect()
    const shell = document.querySelector('.app-shell')!.getBoundingClientRect()
    const reader = document.querySelector('.knowledge-panel:not([hidden]) .workspace-preview__content')
    return {
      shell: { x: shell.x, y: shell.y, width: shell.width, height: shell.height },
      surface: { x: box.x, y: box.y, width: box.width, height: box.height },
      visualHeight: window.visualViewport?.height || window.innerHeight,
      visualTop: window.visualViewport?.offsetTop || 0,
      readerHeight: reader?.getBoundingClientRect().height,
      pageWidth: document.documentElement.scrollWidth,
    }
  })
  expect(measured.pageWidth).toBe(page.viewportSize()!.width)
  expect(Math.abs(measured.shell.width - page.viewportSize()!.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(measured.surface.x - measured.shell.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(measured.surface.y - measured.shell.y)).toBeLessThanOrEqual(1)
  expect(Math.abs(measured.surface.width - measured.shell.width)).toBeLessThanOrEqual(1)
  expect(Math.abs(measured.surface.height - measured.shell.height)).toBeLessThanOrEqual(1)
  expect(measured.shell.y).toBeGreaterThanOrEqual(measured.visualTop)
  expect(measured.shell.y + measured.shell.height).toBeLessThanOrEqual(measured.visualTop + measured.visualHeight + 1)
  geometry.push({ name, viewport: page.viewportSize(), ...measured })
}

async function selectSession(page: Page, id: string) {
  const session = fixtureSessions.find((session) => session.id === id)
  if (!session) throw new Error('Unknown fixture session.')
  await page.getByRole('navigation', { name: 'Sessions', exact: true })
    .getByRole('button', { name: new RegExp(`^${session.title},`) }).click()
}

try {
  browser = await (values.browser === 'webkit' ? webkit : chromium).launch({
    headless: true,
    ...(values['executable-path'] ? { executablePath: values['executable-path'] } : {}),
  })
  for (const [width, height] of [[320, 568], [360, 740], [390, 844], [430, 932], [844, 390]]) {
    const { page, context, fixture } = await pageFor(width, height, { extraKnowledgeFiles: 36 })
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeInViewport()
    await phoneSurface(page, `conversation-${width}x${height}`)
    await page.getByRole('button', { name: 'Open sessions', exact: true }).click()
    await phoneSurface(page, `sessions-${width}x${height}`)
    if (width === 390) await screenshot(page, fixture, 'phone-sessions-graphite')
    await page.locator('.sidebar').getByRole('button', { name: 'Close sessions', exact: true }).click()
    await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
    await expect(page.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
    await phoneSurface(page, `reader-${width}x${height}`)
    if (width === 390) await screenshot(page, fixture, 'phone-reader-graphite')
    await page.getByRole('button', { name: 'Back to files', exact: true }).click()
    await phoneSurface(page, `files-${width}x${height}`)
    await expect(page.getByRole('navigation', { name: 'Sessions', exact: true })).toBeHidden()
    const tree = page.getByRole('navigation', { name: 'Knowledge', exact: true })
    expect(await tree.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(height / 2)
    if (width === 390) {
      await screenshot(page, fixture, 'phone-knowledge-tree-graphite')
      const item = page.getByRole('treeitem', { name: 'design-note-020.md', exact: true })
      await item.scrollIntoViewIfNeeded()
      const before = await tree.evaluate((element) => element.scrollTop)
      expect(before).toBeGreaterThan(0)
      await page.getByRole('button', { name: 'Back to sessions', exact: true }).click()
      await page.getByRole('button', { name: 'Knowledge files', exact: true }).click()
      await expect.poll(() => tree.evaluate((element) => element.scrollTop)).toBe(before)
      await item.click()
      await expect(page.getByRole('heading', { name: 'Design note 20', exact: true })).toBeVisible()
      await page.getByRole('button', { name: 'Back to files', exact: true }).click()
      await expect(item).toBeInViewport()
      await screenshot(page, fixture, 'phone-tree-scrolled')
    }
    fixture.assertHealthy()
    await context.close()
  }

  for (const appearance of ['light', 'graphite'] as const) {
    const { page, fixture, context } = await pageFor(1440, 900, { knowledgeMode: 'docked', appearance })
    await expect(page.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
    await screenshot(page, fixture, `workbench-${appearance}`)
    await page.getByRole('button', { name: 'Choose Knowledge root', exact: true }).click()
    await page.getByRole('radio', {
      name: 'Build playbooks on Build node: /home/demo/workspace-checks/docs', exact: true,
    }).check()
    await screenshot(page, fixture, `root-chooser-${appearance}`)
    await expect(page.getByRole('button', { name: 'Use for this session', exact: true })).toBeInViewport({ ratio: 1 })
    await context.close()
  }

  {
    const { page, fixture, context } = await pageFor(390, 844, {
      appearance: 'light', extraKnowledgeFiles: 36,
    })
    await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
    await expect(page.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
    await screenshot(page, fixture, 'phone-reader-light')
    await page.getByRole('button', { name: 'Back to files', exact: true }).click()
    await phoneSurface(page, 'files-light-390x844')
    await screenshot(page, fixture, 'phone-knowledge-tree-light')
    await page.getByRole('button', { name: 'Choose Knowledge root', exact: true }).click()
    const rootChooser = await page.getByRole('dialog', { name: 'Choose a session root', exact: true }).boundingBox()
    if (!rootChooser) throw new Error('The phone root chooser is missing.')
    expect(rootChooser.width).toBe(390)
    expect(rootChooser.height).toBe(844)
    expect(rootChooser.y).toBe(0)
    await screenshot(page, fixture, 'phone-root-chooser')
    await expect(page.getByRole('button', { name: 'Use for this session', exact: true })).toBeInViewport()
    await context.close()
  }

  {
    const state = createWorkspaceFixtureState()
    state.bindings.delete(`fixture-studio:${SELECTED_SESSION_ID}`)
    const { page, fixture, context } = await pageFor(390, 844, {
      state, knowledgePositions: {}, appearance: 'light',
    })
    await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Give this session a place to read', exact: true })).toBeVisible()
    expect(fixture.requests.some((request) => request.method === 'PUT')).toBe(false)
    await screenshot(page, fixture, 'phone-session-root-setup')
    await context.close()
  }

  {
    const state = createWorkspaceFixtureState()
    const { page, fixture, context } = await pageFor(1440, 900, { state, knowledgeMode: 'docked', appearance: 'light' })
    await expect(page.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
    await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Keep this draft on Studio.')
    const framePaths: string[] = []
    async function frame(caption: string) {
      await page.evaluate((text) => {
        let caption = document.querySelector<HTMLElement>('#review-flow-caption')
        if (!caption) {
          caption = document.createElement('div')
          caption.id = 'review-flow-caption'
          Object.assign(caption.style, {
            position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)',
            zIndex: '100', padding: '10px 15px', borderRadius: '8px',
            background: '#e5eee8', color: '#202730', border: '1px solid #39714b',
            font: '500 13px system-ui',
          })
          document.body.append(caption)
        }
        caption.textContent = text
      }, caption)
      const name = `root-flow-${String(framePaths.length).padStart(2, '0')}`
      await screenshot(page, fixture, name)
      framePaths.push(join(output, `${name}.png`))
    }
    await frame('1 / 5  Original session: Field notes and its draft')
    await selectSession(page, IDLE_SESSION_ID)
    await page.getByRole('button', { name: 'Choose Knowledge root', exact: true }).click()
    await page.getByRole('radio', { name: 'Build playbooks on Build node: /home/demo/workspace-checks/docs', exact: true }).check()
    await frame('2 / 5  Choose a root for the second session only')
    await page.getByRole('button', { name: 'Use for this session', exact: true }).click()
    await page.getByRole('treeitem', { name: 'handbook', exact: true }).click()
    await page.getByRole('treeitem', { name: 'agent-workspace.md', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Build verification guide', exact: true })).toBeVisible()
    await frame('3 / 5  Second session: different root, same relative path')
    await selectSession(page, SELECTED_SESSION_ID)
    await expect(page.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Keep this draft on Studio.')
    await frame('4 / 5  Return to the original document and draft')
    await page.reload()
    await expect(page.getByRole('heading', { name: KNOWLEDGE_DOCUMENT_TITLE, exact: true })).toBeVisible()
    await frame('5 / 5  Reload retains the session context')
    expect(state.bindings.get(`fixture-studio:${IDLE_SESSION_ID}`)?.rootId).toBe(SECOND_KNOWLEDGE_ROOT_ID)
    expect(state.bindings.get(`fixture-studio:${SELECTED_SESSION_ID}`)?.rootId).toBe(fixtureKnowledgeRoots[0].id)
    expect(fixture.requests.some((request) => request.path.endsWith('/messages'))).toBe(false)
    await context.close()
    const second = await pageFor(1440, 900, {
      state, selectedSessionId: IDLE_SESSION_ID, knowledgePositions: {}, knowledgeMode: 'docked', appearance: 'light',
    })
    await expect(second.page.locator('.knowledge-root-picker__identity strong')).toHaveText('Build playbooks')
    await expect(second.page.getByRole('heading', { name: 'Choose a document', exact: true })).toBeVisible()
    await screenshot(second.page, second.fixture, 'second-client-root')
    await second.context.close()
    if (!ffmpeg) throw new Error('The existing ffmpeg-static package has no executable.')
    const encoded = spawnSync(ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1/2',
      '-i', join(output, 'root-flow-%02d.png'),
      '-filter_complex', '[0:v]scale=1280:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse=dither=bayer',
      '-loop', '0', join(output, 'implemented-session-roots.gif'),
    ], { encoding: 'utf8' })
    if (encoded.error) throw encoded.error
    if (encoded.status !== 0) throw new Error(encoded.stderr)
  }

  {
    const { page, fixture, context } = await pageFor(390, 844)
    const composer = page.getByRole('textbox', { name: 'Message', exact: true })
    await composer.fill('Keep this draft above the keyboard.')
    await page.addStyleTag({ content: '.app-shell { --app-safe-area-top: 59px !important; }' })
    await page.evaluate(() => {
      const viewport = window.visualViewport
      if (!viewport) throw new Error('This browser does not expose VisualViewport.')
      Object.defineProperty(viewport, 'height', { configurable: true, value: 430 })
      Object.defineProperty(viewport, 'offsetTop', { configurable: true, value: 42 })
      viewport.dispatchEvent(new Event('resize'))
    })
    await expect(page.locator('.app-shell')).toHaveClass(/app-shell--keyboard-open/)
    await phoneSurface(page, 'simulated-keyboard-and-safe-top')
    const send = await page.getByRole('button', { name: 'Send message', exact: true }).boundingBox()
    if (!send) throw new Error('The send action is missing above the keyboard.')
    expect(send.y + send.height).toBeLessThanOrEqual(472)
    await expect(composer).toHaveValue('Keep this draft above the keyboard.')
    expect(await composer.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
    fixture.assertHealthy()
    await context.close()
  }

  await writeFile(join(output, 'review-evidence.json'), JSON.stringify({
    browser: values.browser,
    notice: 'Actual built UI with synthetic API fixtures. VisualViewport/keyboard/safe-top are simulated, not a physical-device certification.',
    geometry,
    behaviors: ['full phone surfaces', 'dense tree scrolling and return', 'root selection is session-scoped',
      'same relative path across different roots', 'draft/document restoration', 'reload', 'second client root',
      'no automatic prompt send', 'light and graphite', 'keyboard viewport containment'],
  }, null, 2) + '\n')
  console.log(`Captured the workbench review and ${geometry.length} viewport measurements.`)
} finally {
  await browser?.close()
  if (oldTmp === undefined) delete process.env.TMPDIR
  else process.env.TMPDIR = oldTmp
  await rm(scratch, { recursive: true, force: true })
}
