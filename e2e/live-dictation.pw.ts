import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { captureOutputDirectory } from './fixture-frontend'
import { installFakeDictationCapture } from './fixtures/fake-dictation'
import { setupWorkspaceFixture } from './workspace-fixtures'

const desktop = { name: 'desktop', viewport: { width: 1440, height: 900 }, hasTouch: false }
const phone = { name: 'phone', viewport: { width: 390, height: 844 }, hasTouch: true }

/**
 * The synthetic workspace, except that live dictation goes to the E2E
 * server, whose fake engine hears a scripted sentence through the real
 * routes, host and word agreement. The microphone is a generated tone.
 */
async function open(page: Page, baseUrl: string, engine: 'ready' | 'stopped' = 'ready') {
  await installFakeDictationCapture(page)
  const fixture = await setupWorkspaceFixture(page, { baseUrl, knowledgeMode: 'hidden' })
  const context = page.context()
  await context.route((url) => url.pathname.startsWith('/api/dictation/'), (route) => route.continue())
  await context.routeWebSocket((url) => url.pathname === '/api/dictation', (socket) => {
    socket.connectToServer()
  })
  expect((await page.request.post('/__e2e/dictation/reset', { data: { state: engine } })).ok()).toBe(true)
  await page.goto(fixture.url)
  const composer = page.getByRole('textbox', { name: 'Message' })
  await expect(composer).toBeVisible()
  return { fixture, composer }
}

/** Saves a screenshot for review when AGENTIC_REMOTE_DICTATION_SHOTS names a folder. */
async function shot(page: Page, name: string) {
  const folder = process.env.AGENTIC_REMOTE_DICTATION_SHOTS?.trim()
  if (!folder) return
  await page.screenshot({ path: path.join(await captureOutputDirectory(folder), `${name}.png`) })
}

for (const device of [desktop, phone]) {
  test.describe(`live dictation on a ${device.name}`, () => {
    test.use({ hasTouch: device.hasTouch, viewport: device.viewport })

    test('shows the words while speaking and the final text after Stop', async ({ page }, testInfo) => {
      const { fixture, composer } = await open(page, testInfo.project.use.baseURL!)
      await composer.fill('Notes: ')
      await shot(page, `${device.name}-idle`)

      await page.getByRole('button', { name: 'Start microphone recording' }).click()
      await expect(page.getByText(/^Listening · 0:0\d$/)).toBeVisible()
      await expect(composer).toHaveValue(/^Notes: draft the release/, { timeout: 15_000 })
      const send = page.getByRole('button', { name: 'Send message' })
      await expect(send).toBeDisabled()
      await expect(send).toHaveAttribute('title', 'Finish dictation first')
      await shot(page, `${device.name}-listening`)

      await expect(composer).toHaveValue(/friday$/, { timeout: 15_000 })
      await page.getByRole('button', { name: 'Stop dictation' }).click()
      await expect(composer).toHaveValue('Notes: Draft the release notes for Friday.', { timeout: 15_000 })
      await expect(page.getByRole('button', { name: 'Start microphone recording' })).toBeVisible()
      await shot(page, `${device.name}-finalized`)
      fixture.assertHealthy()
    })
  })
}

test.describe('live dictation', () => {
  test.use({ hasTouch: false, viewport: desktop.viewport })

  test('Cancel takes the dictated words back out', async ({ page }, testInfo) => {
    const { fixture, composer } = await open(page, testInfo.project.use.baseURL!)
    await composer.fill('Keep this')
    await page.getByRole('button', { name: 'Start microphone recording' }).click()
    await expect(composer).toHaveValue(/^Keep this draft/, { timeout: 15_000 })
    await page.getByRole('button', { name: 'Cancel dictation' }).click()
    await expect(composer).toHaveValue('Keep this')
    await expect(page.getByRole('button', { name: 'Start microphone recording' })).toBeFocused()
    fixture.assertHealthy()
  })

  test('records and uploads when the transcription computer cannot dictate live', async ({ page }, testInfo) => {
    const { fixture, composer } = await open(page, testInfo.project.use.baseURL!, 'stopped')
    await page.getByRole('button', { name: 'Start microphone recording' }).click()
    await expect(page.locator('.recording-panel')).toContainText('Recording 0:0')
    await page.getByRole('button', { name: /Stop & transcribe/ }).click()
    await expect(composer).toHaveValue('Transcribed fixture note')
    fixture.assertHealthy()
  })

  test('fits its controls in a 320 px wide phone', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 640 })
    const { fixture, composer } = await open(page, testInfo.project.use.baseURL!)
    await page.getByRole('button', { name: 'Start microphone recording' }).click()
    await expect(composer).toHaveValue(/draft/, { timeout: 15_000 })
    for (const name of ['Stop dictation', 'Cancel dictation']) {
      const box = (await page.getByRole('button', { name }).boundingBox())!
      expect(box.width).toBeGreaterThanOrEqual(40)
      expect(box.height).toBeGreaterThanOrEqual(40)
    }
    const overflow = await page.locator('.composer-actions').evaluate((row) => row.scrollWidth - row.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    await shot(page, 'phone-320-listening')
    await page.getByRole('button', { name: 'Stop dictation' }).click()
    await expect(page.getByRole('button', { name: 'Start microphone recording' })).toBeVisible({ timeout: 15_000 })
    fixture.assertHealthy()
  })
})
