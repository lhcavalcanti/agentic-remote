import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { KNOWLEDGE_FILE_PATH, setupWorkspaceFixture } from './workspace-fixtures'

/** About `bytes` of varied Markdown, `## Section 1` onward, ending with `## {last}`. */
function longDocument(title: string, bytes: number, last: string, preface = '') {
  let source = `# ${title}\n\n${preface}`
  for (let index = 1; source.length < bytes; index += 1) {
    source += [
      `## Section ${index}`,
      '',
      `The build for **milestone ${index}** passed. ${'Reviewers read the diff and the gate ran on the exact head. '.repeat(3)}`,
      '',
      '- Owner: the release team',
      `- Plan: [plan ${index}](plans/plan-${index}.md)`,
      '',
      '```ts',
      `export const check${index} = (input: string) => input.includes('ready')`,
      '```',
      '',
      '| Check | Result |',
      '| --- | --- |',
      '| lint | passed |',
      '',
      '',
    ].join('\n')
  }
  return `${source}## ${last}\n\nThe end.\n`
}

const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

/** Serves `documents` as Knowledge files of the fixture's root. */
async function serveDocuments(page: Page, documents: Record<string, string>) {
  await page.route('**/api/knowledge/roots/*/file*', (route) => {
    const path = new URL(route.request().url()).searchParams.get('path') ?? ''
    if (path === 'handbook/images/flow.png') {
      return route.fulfill({ json: { name: 'flow.png', path, kind: 'image', mimeType: 'image/png', size: 68, base64: tinyPng } })
    }
    const content = documents[path]
    if (content === undefined) return route.fallback()
    return route.fulfill({ json: {
      name: path.split('/').at(-1), path, kind: 'markdown', mimeType: 'text/markdown', size: content.length, content,
    } })
  })
}

/**
 * When, on the page's clock, the element `id` was first seen. The page polls
 * for it itself: each evaluation Playwright makes on a huge page is a long
 * task of its own, which would be counted against the page.
 */
function appeared(page: Page, id: string): Promise<number> {
  return page.evaluate((target) => new Promise<number>((resolve) => {
    const check = () => {
      if (document.getElementById(target)) resolve(performance.now())
      else setTimeout(check, 50)
    }
    check()
  }), id)
}

/** When, on the page's clock, the last click happened: measured there, so a frozen page cannot hide it. */
function lastClick(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { lastClick: number }).lastClick)
}

interface LongFrame {
  start: number
  duration: number
  render: number
  scripts: string
}

/** Records the page's long animation frames and its last click, from before it loads. */
function watchFrames(page: Page) {
  return page.addInitScript(() => {
    const frames: LongFrame[] = []
    ;(window as unknown as { longFrames: typeof frames }).longFrames = frames
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[] as (PerformanceEntry & {
        renderStart: number
        scripts: { invoker: string; duration: number }[]
      })[]) {
        frames.push({
          start: entry.startTime,
          duration: entry.duration,
          render: entry.renderStart ? entry.startTime + entry.duration - entry.renderStart : 0,
          scripts: entry.scripts.map((script) => `${script.invoker} ${Math.round(script.duration)} ms`).join(', '),
        })
      }
    }).observe({ type: 'long-animation-frame', buffered: true })
    document.addEventListener('click', () => {
      ;(window as unknown as { lastClick: number }).lastClick = performance.now()
    }, true)
  })
}

/** The two longest frames between `since` and `until`, longest first. */
async function longestFrames(page: Page, since: number, until: number): Promise<[LongFrame, LongFrame]> {
  const none = { start: since, duration: 0, render: 0, scripts: '' }
  const frames = await page.evaluate(([from, to]) => (window as unknown as { longFrames: LongFrame[] }).longFrames
    .filter((frame) => frame.start >= from && frame.start < to)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 2), [since, until])
  return [frames[0] ?? none, frames[1] ?? none]
}

function describeFrames([longest, next]: [LongFrame, LongFrame], clicked: number): string {
  return `longest frames while drawing ${Math.round(longest.duration)} and ${Math.round(next.duration)} ms`
    + ` (the longest at ${Math.round(longest.start - clicked)} ms; rendering ${Math.round(longest.render)} ms; scripts: ${longest.scripts || 'none'})`
}

/**
 * Drawing on the page would freeze it for seconds. A host's passing hiccup can
 * stretch one frame, but a slower renderer stretches many.
 */
function expectNoFreeze([longest, next]: [LongFrame, LongFrame], bound = 250) {
  expect(longest.duration).toBeLessThan(2_000)
  expect(next.duration).toBeLessThan(bound)
}

test('a large Knowledge document opens at once and draws without freezing the page', async ({ page }, testInfo) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  const plan = `# Plan 1\n\n${'The plan for the first milestone, step by step. '.repeat(400)}\n`
  await watchFrames(page)
  const fixture = await setupWorkspaceFixture(page, { baseUrl: testInfo.project.use.baseURL!, knowledgeMode: 'docked' })
  await serveDocuments(page, {
    [KNOWLEDGE_FILE_PATH]: '# Agent workspace\n\n[Open the checklist](release-checklist.md)\n',
    'handbook/release-checklist.md': longDocument('Release checklist', 2 * 1024 * 1024 - 8192, 'Final checks'),
    'handbook/plans/plan-1.md': plan,
  })
  try {
    await page.goto('/')
    const reader = page.locator('.workspace-preview__content.markdown-body')
    await reader.getByRole('link', { name: 'Open the checklist' }).click()
    const opened = await appeared(page, 'section-1')
    const drawn = await appeared(page, 'final-checks')
    const clicked = await lastClick(page)
    const frames = await longestFrames(page, clicked, drawn)
    console.log(`2 MB document: opening after ${Math.round(opened - clicked)} ms, whole after ${Math.round(drawn - clicked)} ms, ${describeFrames(frames, clicked)}`)
    expect(opened - clicked).toBeLessThan(2_000)
    expectNoFreeze(frames)

    await page.getByRole('button', { name: 'Document outline' }).click()
    await page.getByRole('navigation', { name: 'Document outline' }).getByRole('button', { name: 'Final checks' }).click()
    await expect(reader.getByRole('heading', { name: 'Final checks' })).toBeInViewport()

    // Leaving while the document is still being parsed does not hold up the next one.
    await page.goto('/')
    await reader.getByRole('link', { name: 'Open the checklist' }).click()
    await appeared(page, 'section-1')
    await reader.getByRole('link', { name: 'plan 1', exact: true }).click()
    const arrived = await appeared(page, 'plan-1')
    const leaving = await lastClick(page)
    console.log(`next document after leaving mid-parse: ${Math.round(arrived - leaving)} ms`)
    expect(arrived - leaving).toBeLessThan(2_000)
  } finally {
    fixture.assertHealthy()
  }
})

/** About `bytes` of Markdown made of `unit` repeated. */
function repeated(bytes: number, unit: (index: number) => string): string {
  let body = ''
  for (let index = 1; body.length < bytes; index += 1) body += unit(index)
  return body
}

// Chromium lays a table out whole each time rows are added to it, so the
// frames that fill a long one grow with it: about 0.3 seconds by 1 MB.
for (const [shape, bound, body] of [
  ['table', 1_000, () => `| Check | Result | Owner |\n| --- | --- | --- |\n${repeated(1024 * 1024, (index) => `| check ${index} | **passed** in ${index} ms | team ${index % 7} |\n`)}`],
  ['list', 250, () => repeated(1024 * 1024, (index) => `- Change ${index}: fixed [item ${index}](plans/plan-${index}.md) with *care*\n`)],
] as const) test(`a Knowledge document that is one long ${shape} opens at once and draws without freezing the page`, async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await watchFrames(page)
  const fixture = await setupWorkspaceFixture(page, { baseUrl: testInfo.project.use.baseURL!, knowledgeMode: 'docked' })
  await serveDocuments(page, {
    [KNOWLEDGE_FILE_PATH]: '# Agent workspace\n\n[Open the report](report.md)\n',
    'handbook/report.md': `# Report\n\n${body()}\n## Final checks\n\nThe end.\n`,
  })
  try {
    await page.goto('/')
    const reader = page.locator('.workspace-preview__content.markdown-body')
    await reader.getByRole('link', { name: 'Open the report' }).click()
    const opened = await appeared(page, 'report')
    const drawn = await appeared(page, 'final-checks')
    const clicked = await lastClick(page)
    const frames = await longestFrames(page, clicked, drawn)
    console.log(`1 MB ${shape}: opening after ${Math.round(opened - clicked)} ms, whole after ${Math.round(drawn - clicked)} ms, ${describeFrames(frames, clicked)}`)
    expect(opened - clicked).toBeLessThan(2_000)
    expectNoFreeze(frames, bound)
    await expect(reader.locator(shape === 'table' ? 'table' : 'ul')).toHaveCount(1)
  } finally {
    fixture.assertHealthy()
  }
})

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]) test(`documents still draw diagrams, code, tables, images, and section links on ${viewport.name}`, async ({ page }, testInfo) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  // Long enough to be drawn from its opening, with the diagram in that opening.
  const content = longDocument('Field guide', 96 * 1024, 'Late section', [
    '[Jump to the end](#late-section)',
    '',
    '![Flow chart](images/flow.png)',
    '',
    '```mermaid',
    'graph TD; Draft-->Review',
    '```',
    '',
    '| Step | Owner |',
    '| --- | --- |',
    '| Review | Ana |',
    '',
    '',
  ].join('\n'))
  const fixture = await setupWorkspaceFixture(page, {
    baseUrl: testInfo.project.use.baseURL!,
    knowledgeMode: viewport.name === 'phone' ? 'hidden' : 'docked',
  })
  await serveDocuments(page, { [KNOWLEDGE_FILE_PATH]: content })
  try {
    await page.goto('/')
    if (viewport.name === 'phone') await page.getByRole('button', { name: 'Session knowledge', exact: true }).click()
    const reader = page.locator('.workspace-preview__content.markdown-body')
    const diagram = reader.locator('.mermaid-diagram svg')
    await expect(diagram).toBeVisible({ timeout: 30_000 })
    await diagram.evaluate((svg) => svg.setAttribute('data-first-drawing', 'yes'))
    await expect(reader.locator('figure.document-code').first().getByRole('button', { name: 'Copy code' })).toBeVisible()
    await expect(reader.getByRole('cell', { name: 'Ana' })).toBeVisible()
    await expect(reader.getByRole('img', { name: 'Flow chart' })).toHaveAttribute('src', /^(blob|data):/)
    await reader.getByRole('link', { name: 'Jump to the end' }).click()
    await expect(reader.getByRole('heading', { name: 'Late section' })).toBeInViewport()
    // The whole document agreed with its opening, so the diagram was never drawn again.
    await expect(diagram).toHaveAttribute('data-first-drawing', 'yes')
  } finally {
    fixture.assertHealthy()
  }
})
