import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { parseArgs } from 'node:util'
import { chromium, expect as playwrightExpect } from '@playwright/test'
import type { BrowserContext, Page } from '@playwright/test'
import {
  BACKGROUND_SESSION_ID,
  KNOWLEDGE_DOCUMENT_TITLE,
  KNOWLEDGE_FILE_PATH,
  PENDING_SESSION_ID,
  PERMISSION_SESSION_ID,
  SELECTED_SESSION_ID,
  fixtureBaseUrl,
  fixtureComputers,
  fixtureSessions,
  setupWorkspaceFixture,
} from './workspace-fixtures'
import type { WorkspaceFixture } from './workspace-fixtures'
import { screenshotsAreClose } from './screenshot-stability'

// Run with TSX_DISABLE_CACHE=1 pnpm exec node --import tsx e2e/capture-workspace.ts
// --base-url http://127.0.0.1:4395 --output-dir <media>/before --phase before
const { values } = parseArgs({
  options: {
    'base-url': { type: 'string' },
    'output-dir': { type: 'string' },
    phase: { type: 'string' },
    help: { type: 'boolean' },
  },
})

if (values.help) {
  console.log(
    'Capture synthetic Agentic Remote browser frames.\n' +
      'Required: --base-url <loopback frontend origin> --output-dir <directory> ' +
      '--phase before|after\n' +
      'Never use production ports 4317/4318. All API and WebSocket traffic is mocked.\n' +
      'Run with TSX_DISABLE_CACHE=1 pnpm exec node --import tsx e2e/capture-workspace.ts',
  )
  process.exit(0)
}
if (
  !values['base-url'] ||
  !values['output-dir'] ||
  !['before', 'after'].includes(values.phase ?? '')
) {
  throw new Error('Required: --base-url, --output-dir, and --phase before|after')
}

const baseUrl = fixtureBaseUrl(values['base-url']).origin
const phase = values.phase as 'before' | 'after'
const outputDir = resolve(values['output-dir'])
const runtimeDir = resolve('e2e', `.workspace-capture-${process.pid}`)
if ([outputDir, runtimeDir].some((path) => /^\/(?:var\/)?tmp(?:\/|$)/.test(path))) {
  throw new Error('Capture files must stay outside system temporary directories.')
}

const frames: string[] = []
const audit: Array<{ viewport: string; requests: string[]; sockets: string[] }> = []
const expect = playwrightExpect.configure({ timeout: 15_000 })

async function assertLayout(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      })),
    )
    .toEqual({ width: page.viewportSize()!.width, viewport: page.viewportSize()!.width })
  await expect(page.locator('.error-banner:visible')).toHaveCount(0)
}

async function capture(page: Page, fixture: WorkspaceFixture, name: string) {
  fixture.assertHealthy()
  await page.evaluate(() => document.fonts.ready)
  await assertLayout(page)
  await page.mouse.move(0, 0)
  const path = join(outputDir, `${name}.png`)
  let previous: Buffer | undefined
  let stable: Buffer | undefined
  // The first compositor paint can still be settling after the DOM is ready.
  for (let attempt = 0; attempt < 6; attempt++) {
    const frame = await page.screenshot({ animations: 'disabled', caret: 'hide' })
    if (previous && (previous.equals(frame) || await page.evaluate(screenshotsAreClose, {
      previous: previous.toString('base64'), current: frame.toString('base64'),
    }))) {
      stable = frame
      break
    }
    previous = frame
    await page.evaluate(() => new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    ))
  }
  if (!stable) throw new Error(`The ${name} frame did not settle.`)
  await writeFile(path, stable)
  fixture.assertHealthy()
  frames.push(path)
  console.log(`Captured ${path}`)
}

function sessionButton(page: Page, id: string) {
  const session = fixtureSessions.find((entry) => entry.id === id)!
  const sessions = page.getByRole('navigation', { name: 'Sessions', exact: true })
  if (phase === 'after') {
    const title = session.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return sessions.getByRole('button', { name: new RegExp(`^${title}, `) })
  }
  return sessions
    .getByRole('button')
    .filter({ has: page.getByText(session.title, { exact: true }) })
}

function documentHeading(page: Page, title = KNOWLEDGE_DOCUMENT_TITLE) {
  return page
    .getByRole('complementary', { name: 'Session knowledge', exact: true })
    .getByRole('heading', { name: title, exact: true })
}

async function assertConversation(page: Page) {
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeInViewport()
  await expect(page.getByText('I suggest three small changes:', { exact: true })).toBeVisible()
}

async function openGuide(page: Page) {
  await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
  await expect(documentHeading(page)).toBeVisible()
}

async function showLastComputer(page: Page) {
  const travel = page
    .getByRole('navigation', { name: 'Sessions', exact: true })
    .getByText('Travel laptop', { exact: true })
  await travel.scrollIntoViewIfNeeded()
  await expect(travel).toBeInViewport()
}

async function desktop(page: Page, fixture: WorkspaceFixture) {
  await expect(documentHeading(page)).toBeVisible()
  await assertConversation(page)
  if (phase === 'after') {
    await expect(sessionButton(page, PERMISSION_SESSION_ID)).toBeInViewport({ ratio: 1 })
  }
  await capture(page, fixture, 'desktop-reading')

  await page.getByRole('button', { name: 'Expand knowledge panel', exact: true }).click()
  await expect(documentHeading(page)).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeHidden()
  await capture(page, fixture, 'desktop-expanded-reading')
  await page.getByRole('button', { name: 'Minimize knowledge panel', exact: true }).click()

  await page.getByRole('link', { name: 'release checklist', exact: true }).click()
  await expect(documentHeading(page, 'Release checklist')).toBeVisible()
  await capture(page, fixture, 'desktop-relative-link')
  await page.getByRole('treeitem', { name: 'agent-workspace.md', exact: true }).click()
  await expect(documentHeading(page)).toBeVisible()
  await page.getByRole('treeitem', { name: 'handbook', exact: true }).click()
  await expect(page.getByRole('treeitem', { name: 'agent-workspace.md', exact: true })).toHaveCount(0)
  await page.getByRole('treeitem', { name: 'handbook', exact: true }).click()
  await expect(page.getByRole('treeitem', { name: 'agent-workspace.md', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Close knowledge panel', exact: true }).click()
  await assertConversation(page)
  for (const computer of fixtureComputers) {
    await expect(
      page.getByRole('navigation', { name: 'Sessions', exact: true })
        .getByText(computer.name, { exact: true }),
    ).toBeVisible()
  }
  await capture(page, fixture, 'desktop-conversation')
  await showLastComputer(page)
  await capture(page, fixture, 'desktop-all-computers')

  if (phase === 'after') {
    const sessions = page.getByRole('navigation', { name: 'Sessions', exact: true })
    const actions = page.getByRole('button', { name: 'Session actions', exact: true })
    await actions.click()
    await expect(actions).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Rename session', exact: true })).toBeVisible()
    await capture(page, fixture, 'desktop-session-actions')
    await actions.click()
    await expect(actions).toHaveAttribute('aria-expanded', 'false')

    await sessions.getByRole('button', { name: 'Needs you', exact: true }).click()
    await expect(sessionButton(page, PENDING_SESSION_ID)).toBeVisible()
    await expect(sessionButton(page, PERMISSION_SESSION_ID)).toBeVisible()
    await expect(sessionButton(page, BACKGROUND_SESSION_ID)).toHaveCount(0)
    await capture(page, fixture, 'desktop-needs-you')
    await sessionButton(page, PENDING_SESSION_ID).click()
    await expect(page.getByRole('heading', {
      name: 'What should the workspace restore first?', exact: true,
    })).toBeInViewport()
    await capture(page, fixture, 'desktop-attention-question')
    await sessions.getByRole('button', { name: 'All', exact: true }).click()
    await sessionButton(page, SELECTED_SESSION_ID).click()

    await sessions.getByRole('button', { name: 'Working', exact: true }).click()
    await expect(sessionButton(page, BACKGROUND_SESSION_ID)).toBeVisible()
    await expect(sessionButton(page, PENDING_SESSION_ID)).toHaveCount(0)
    await capture(page, fixture, 'desktop-working')

    await sessions.getByRole('button', { name: 'All', exact: true }).click()
    const search = sessions.getByRole('searchbox', { name: 'Search sessions', exact: true })
    await search.fill('recovery')
    await expect(sessionButton(page, PENDING_SESSION_ID)).toBeVisible()
    await expect(sessionButton(page, SELECTED_SESSION_ID)).toHaveCount(0)
    await capture(page, fixture, 'desktop-search')
    await search.fill('')
  }

  await sessionButton(page, PENDING_SESSION_ID).click()
  await expect(page.getByRole('heading', {
    name: 'What should the workspace restore first?', exact: true,
  })).toBeVisible()
  await capture(page, fixture, 'desktop-pending-question')
  await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
  await expect(documentHeading(page, 'Release checklist')).toBeVisible()
  await capture(page, fixture, 'desktop-recovery-reading')
  await page.getByRole('button', { name: 'Close knowledge panel', exact: true }).click()
  await sessionButton(page, PERMISSION_SESSION_ID).click()
  await expect(page.getByRole('button', { name: 'Allow once', exact: true })).toBeVisible()
  await capture(page, fixture, 'desktop-permission')

  await sessionButton(page, BACKGROUND_SESSION_ID).click()
  await page.getByRole('button', {
    name: 'View background tasks for Check handbook links', exact: true,
  }).click()
  await expect(page.getByText('Check handbook references', { exact: true })).toBeVisible()
  await capture(page, fixture, 'desktop-background-task')
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()

  await sessionButton(page, SELECTED_SESSION_ID).click()
  await openGuide(page)
  if (phase === 'after') {
    const ask = page.getByRole('button', { name: 'Ask agent about file', exact: true })
    await expect(ask).toBeEnabled()
    await ask.click()
    await expect(page.getByRole('textbox', { name: 'Message', exact: true }))
      .toHaveValue(new RegExp(KNOWLEDGE_FILE_PATH.replace('.', '\\.')))
    expect(fixture.requests.some((request) => request.path.endsWith('/messages'))).toBe(false)
    await capture(page, fixture, 'desktop-file-question-draft')
  }
}

async function phone(page: Page, fixture: WorkspaceFixture) {
  await assertConversation(page)
  await capture(page, fixture, 'phone-conversation')
  if (phase === 'after') {
    const actions = page.getByRole('button', { name: 'Session actions', exact: true })
    await actions.click()
    await expect(page.getByRole('button', { name: 'Close session', exact: true })).toBeInViewport()
    await capture(page, fixture, 'phone-session-actions')
    await page.keyboard.press('Escape')
    await expect(actions).toBeFocused()
    await expect(actions).toHaveAttribute('aria-expanded', 'false')
  }
  await page.getByRole('button', { name: 'Open sessions', exact: true }).click()
  await expect(sessionButton(page, SELECTED_SESSION_ID)).toBeVisible()
  await capture(page, fixture, 'phone-sessions')
  if (phase === 'after') {
    const sessions = page.getByRole('navigation', { name: 'Sessions', exact: true })
    await sessions.getByRole('button', { name: 'Needs you', exact: true }).click()
    await capture(page, fixture, 'phone-needs-you')
    await sessionButton(page, PENDING_SESSION_ID).click()
    await expect(page.getByRole('heading', {
      name: 'What should the workspace restore first?', exact: true,
    })).toBeInViewport()
    await capture(page, fixture, 'phone-attention-question')
    await page.getByRole('button', { name: 'Open sessions', exact: true }).click()
    await sessions.getByRole('button', { name: 'All', exact: true }).click()
    await sessionButton(page, SELECTED_SESSION_ID).click()
    await page.getByRole('button', { name: 'Open sessions', exact: true }).click()
  }
  await showLastComputer(page)
  await capture(page, fixture, 'phone-all-computers')
  await sessionButton(page, SELECTED_SESSION_ID).scrollIntoViewIfNeeded()
  await page.locator('.sidebar').getByRole('button', { name: 'Close sessions', exact: true }).click()

  await openGuide(page)
  await expect(documentHeading(page)).toBeInViewport()
  await capture(page, fixture, 'phone-reading')
  await page.getByRole('button', { name: 'Show files', exact: true }).click()
  await expect(page.getByRole('treeitem', { name: 'agent-workspace.md', exact: true })).toBeVisible()
  await capture(page, fixture, 'phone-files-drawer')
  await page.getByRole('treeitem', { name: 'release-checklist.md', exact: true }).click()
  await expect(documentHeading(page, 'Release checklist')).toBeVisible()
  await capture(page, fixture, 'phone-release-checklist')
  if (phase === 'after') {
    await page.getByRole('link', { name: 'workspace field guide', exact: true }).click()
    await expect(documentHeading(page)).toBeVisible()
    const ask = page.getByRole('button', { name: 'Ask agent about file', exact: true })
    await expect(ask).toBeEnabled()
    await ask.click()
    await expect(page.getByRole('textbox', { name: 'Message', exact: true }))
      .toHaveValue(new RegExp(KNOWLEDGE_FILE_PATH.replace('.', '\\.')))
    expect(fixture.requests.some((request) => request.path.endsWith('/messages'))).toBe(false)
    await capture(page, fixture, 'phone-file-question-draft')
  } else {
    await page.getByRole('button', { name: 'Close knowledge panel', exact: true }).click()
  }
  await assertConversation(page)
  await capture(page, fixture, 'phone-return-to-conversation')
  if (phase === 'after') {
    for (const viewport of [{ width: 360, height: 780 }, { width: 390, height: 430 }]) {
      await page.setViewportSize(viewport)
      await assertLayout(page)
      for (const name of ['Open sessions', 'Session knowledge', 'New session', 'Session actions']) {
        const control = page.locator('.conversation-header').getByRole('button', { name, exact: true })
        await expect(control).toBeInViewport()
        const box = await control.boundingBox()
        expect(box?.width).toBeGreaterThanOrEqual(40)
        expect(box?.height).toBeGreaterThanOrEqual(40)
      }
      const composer = page.getByRole('textbox', { name: 'Message', exact: true })
      await expect(composer).toBeInViewport()
      await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeInViewport()
      expect(await composer.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)))
        .toBeGreaterThanOrEqual(16)
    }
    await capture(page, fixture, 'phone-short-viewport')
  }
}

await mkdir(outputDir, { recursive: true })
// Profiles and browser scratch files are owned by this invocation, never a real profile.
await mkdir(runtimeDir)
const originalTmpDir = process.env.TMPDIR
process.env.TMPDIR = runtimeDir
try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844 },
  ]) {
    let context: BrowserContext | undefined
    try {
      context = await chromium.launchPersistentContext(join(runtimeDir, viewport.name), {
        headless: true,
        args: ['--disable-gpu'],
        artifactsDir: join(runtimeDir, 'artifacts', viewport.name),
        acceptDownloads: false,
        serviceWorkers: 'block',
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        isMobile: viewport.name === 'phone',
        hasTouch: viewport.name === 'phone',
        locale: 'en-US',
        timezoneId: 'UTC',
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      })
      const page = context.pages()[0] ?? await context.newPage()
      page.setDefaultTimeout(15_000)
      const fixture = await setupWorkspaceFixture(page, {
        baseUrl,
        knowledgeMode: viewport.name === 'desktop' ? 'docked' : 'hidden',
      })
      try {
        await page.goto(fixture.url)
        await page.waitForLoadState('networkidle')
        fixture.assertHealthy()
        if (viewport.name === 'desktop') await desktop(page, fixture)
        else await phone(page, fixture)
      } catch (error) {
        console.error(JSON.stringify({
          viewport: viewport.name,
          failures: fixture.failures,
          requests: fixture.requests,
          sockets: fixture.sockets,
        }, null, 2))
        fixture.assertHealthy()
        throw error
      }
      fixture.assertHealthy()
      audit.push({
        viewport: viewport.name,
        requests: [...new Set(fixture.requests.map(({ method, path }) => `${method} ${path}`))],
        sockets: [...new Set(fixture.sockets)],
      })
    } finally {
      await context?.close()
    }
  }
  console.log(JSON.stringify({
    phase,
    fixtureNotice: 'All computers, sessions, messages, models, tasks, paths, and documents are fictional fixtures.',
    frames,
    audit,
    pageErrors: 0,
    unmockedRequests: 0,
  }, null, 2))
} finally {
  if (originalTmpDir === undefined) delete process.env.TMPDIR
  else process.env.TMPDIR = originalTmpDir
  await rm(runtimeDir, { recursive: true, force: true })
}
