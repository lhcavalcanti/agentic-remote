import { expect, test, type Page } from '@playwright/test'
import {
  assertNoHorizontalOverflow,
  createUIScenes,
  uiContextOptions,
  uiSceneNames,
  uiViewports,
  type UISceneHandle,
  type UISceneName,
} from './ui-scenes'
import { SELECTED_SESSION_ID } from './workspace-fixtures'

test.use(uiContextOptions)

for (const viewport of uiViewports) {
  test.describe(viewport.name, () => {
    test.use({ viewport: viewport.viewport, isMobile: viewport.isMobile, hasTouch: viewport.hasTouch })
    for (const name of uiSceneNames) {
      test(`${name} stays visually locked`, async ({ page, baseURL }) => {
        const scene = createUIScenes(baseURL).find((scene) => scene.name === name)!
        const fixture = await scene.setup(page)
        try {
          await assertNoHorizontalOverflow(page)
          await expect(page).toHaveScreenshot(`${viewport.name}-${name}.png`, {
            // Rounded-corner compositing can vary by one RGB level in Chromium.
            animations: 'disabled', caret: 'hide', maxDiffPixels: 0, threshold: 0.01,
          })
        } finally {
          fixture.assertHealthy()
        }
      })
    }
  })
}

const sessionPath = `/api/computers/fixture-studio/sessions/${SELECTED_SESSION_ID}`
const message = (page: Page) => page.getByRole('textbox', { name: 'Message', exact: true })

// App.test.tsx covers reconciliation, receipt failures, serialized queue races,
// clipboard variants and history ownership. These locks add real-browser event
// and HTTP wiring rather than duplicating that component-level matrix.
test.describe('browser interaction contracts', () => {
  test.use({ viewport: uiViewports[0].viewport, isMobile: false, hasTouch: false })
  let fixture: UISceneHandle | undefined

  async function open(page: Page, baseURL: string | undefined, name: UISceneName) {
    fixture = await createUIScenes(baseURL).find((scene) => scene.name === name)!.setup(page)
    return fixture
  }

  test.afterEach(async ({ page }) => {
    fixture?.assertHealthy()
    await assertNoHorizontalOverflow(page)
    fixture = undefined
  })

  test('sends, queues while busy, edits in place, reorders with the keyboard, and stops', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'conversation')
    const session = handle.state.sessions.find((entry) => entry.id === SELECTED_SESSION_ID)!
    await message(page).fill('Review the fixture plan.')
    const sent = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    expect((await sent).postDataJSON()).toMatchObject({ content: 'Review the fixture plan.', replaceTerminalDraft: true })
    await expect(message(page)).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeVisible()
    expect(session.messages.at(-1)?.content).toBe('Review the fixture plan.')

    for (const content of ['Check the notes.', 'Then check the links.']) {
      await message(page).fill(content)
      const queued = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
      await page.getByRole('button', { name: 'Queue message', exact: true }).click()
      expect((await queued).postDataJSON()).toEqual({ content, enqueue: true })
      await expect(message(page)).toHaveValue('')
    }
    const ids = session.queuedPrompts!.map((prompt) => prompt.id)
    await page.getByRole('button', { name: 'Edit queued prompt 1', exact: true }).click()
    await expect(message(page)).toHaveValue('Check the notes.')
    await message(page).fill('Check the revised notes.')
    const edited = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === `${sessionPath}/queue/${ids[0]}`)
    await page.getByRole('button', { name: 'Save to queue', exact: true }).click()
    expect((await edited).postDataJSON()).toEqual({ content: 'Check the revised notes.' })
    await expect(message(page)).toHaveValue('')
    expect(session.queuedPrompts!.map((prompt) => prompt.id)).toEqual(ids)

    const reorder = page.waitForRequest((request) => request.method() === 'PUT' && new URL(request.url()).pathname === `${sessionPath}/queue`)
    const handleButton = page.getByRole('button', { name: 'Reorder queued prompt 1', exact: true })
    await handleButton.focus()
    await page.keyboard.press('Space')
    await expect(handleButton).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('region', { name: 'Queued prompts' }).getByRole('status'))
      .toContainText(`over droppable area queued:${ids[1]}`)
    await page.keyboard.press('Space')
    expect((await reorder).postDataJSON()).toEqual({ order: [...ids].reverse() })
    await expect(page.locator('.queued-prompt > span:nth-child(2)')).toHaveText(['Then check the links.', 'Check the revised notes.'])
    expect(session.queuedPrompts!.map((prompt) => prompt.id)).toEqual([...ids].reverse())

    const stopped = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/cancel`)
    await page.getByRole('button', { name: 'Stop response', exact: true }).click()
    expect((await stopped).postDataJSON()).toEqual({})
    await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeHidden()
    expect(session.status).toBe('idle')
    expect(session.queuedPrompts).toHaveLength(2)
  })

  test('attaches a chosen file and a pasted image and sends their uploaded references', async ({ page, baseURL }) => {
    await open(page, baseURL, 'conversation')
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Attach file or audio recording', exact: true }).click()
    await (await chooser).setFiles({
      name: 'release-notes.md', mimeType: 'text/markdown', buffer: Buffer.from('# Fictional release notes\n'),
    })
    const attachments = page.getByRole('list', { name: 'Attachments', exact: true })
    await expect(attachments.getByRole('listitem', { name: 'release-notes.md attachment' })).toContainText('Attached')
    await message(page).evaluate((element) => {
      const clipboardData = new DataTransfer()
      clipboardData.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'clipboard.png', { type: 'image/png' }))
      clipboardData.setData('text/plain', 'This clipboard text must not be inserted.')
      element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
    })
    await expect(attachments.getByRole('listitem', { name: 'clipboard.png attachment' })).toContainText('Attached')
    await expect(message(page)).not.toHaveValue(/This clipboard text/)
    const sent = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === `${sessionPath}/messages`)
    await page.getByRole('button', { name: 'Send message', exact: true }).click()
    const input = (await sent).postDataJSON() as { content: string }
    expect(input.content).toContain('/home/demo/field-notes/.agentic-remote/uploads/release-notes.md')
    expect(input.content).toContain('/home/demo/field-notes/.agentic-remote/uploads/clipboard.png')
    await expect(attachments).toBeHidden()
  })

  test('records with a mocked microphone and transcribes into the live draft without sending', async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      const microphone = { calls: [] as MediaStreamConstraints[], stopped: 0 }
      Object.assign(window, { fixtureMicrophone: microphone })
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: { getUserMedia: async (constraints: MediaStreamConstraints) => {
          microphone.calls.push(constraints)
          return { getTracks: () => [{ stop: () => { microphone.stopped++ } }] }
        } },
      })
      class Recorder extends EventTarget {
        static isTypeSupported() { return true }
        state = 'inactive'
        mimeType = 'audio/webm'
        start() { this.state = 'recording' }
        stop() {
          this.state = 'inactive'
          this.dispatchEvent(new BlobEvent('dataavailable', { data: new Blob(['fixture audio'], { type: this.mimeType }) }))
          this.dispatchEvent(new Event('stop'))
        }
      }
      Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: Recorder })
    })
    const handle = await open(page, baseURL, 'conversation')
    await message(page).fill('Keep this draft.')
    await page.getByRole('button', { name: 'Start microphone recording', exact: true }).click()
    await expect(page.locator('.recording-panel')).toContainText('Recording 0:00')
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeHidden()
    const transcript = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/transcriptions')
    await page.getByRole('button', { name: 'Stop & transcribe', exact: true }).click()
    expect((await transcript).postDataBuffer()!.toString()).toContain('filename="recording.webm"')
    await expect(message(page)).toHaveValue('Keep this draft.\n\nTranscribed fixture note')
    await expect(page.getByRole('button', { name: 'Start microphone recording', exact: true })).toBeEnabled()
    expect(await page.evaluate(() => (window as unknown as { fixtureMicrophone: unknown }).fixtureMicrophone))
      .toEqual({ calls: [{ audio: true }], stopped: 1 })
    expect(handle.requests.some((request) => request.path === `${sessionPath}/messages`)).toBe(false)
  })

  test('ArrowUp recalls sent history but preserves an unsent draft and its durable storage', async ({ page, baseURL }) => {
    await open(page, baseURL, 'conversation')
    await message(page).focus()
    await page.keyboard.press('ArrowUp')
    await expect(message(page)).toHaveValue('Help me make this workspace easier to scan. Keep the conversation close while I read our field guide.')
    await page.keyboard.press('ArrowDown')
    await expect(message(page)).toHaveValue('')
    await message(page).fill('My unsent review notes')
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowUp')
    await expect(message(page)).toHaveValue('My unsent review notes')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('agentic-remote:composer-drafts')!)))
      .toMatchObject({ [`fixture-studio:${SELECTED_SESSION_ID}`]: 'My unsent review notes' })
  })

  test('submits the runtime selection and saves app settings through the hub profile', async ({ page, baseURL }) => {
    const handle = await open(page, baseURL, 'runtime-dialog')
    const dialog = page.getByRole('dialog', { name: 'Model and context', exact: true })
    await dialog.getByRole('combobox', { name: 'Reasoning effort', exact: true }).selectOption('high')
    await dialog.getByRole('combobox', { name: 'Agent mode', exact: true }).selectOption('interactive')
    const changed = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === `${sessionPath}/runtime`)
    await dialog.getByRole('button', { name: 'Apply runtime settings', exact: true }).click()
    expect((await changed).postDataJSON()).toEqual({
      model: 'fixture-model', reasoningEffort: 'high', contextTier: 'default', mode: 'interactive',
    })
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: 'Configure model, effort, and context', exact: true })).toContainText('effort high')
    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    const settings = page.getByRole('dialog', { name: 'App settings', exact: true })
    const saved = page.waitForRequest((request) => request.method() === 'PATCH' && new URL(request.url()).pathname === '/api/settings')
    await settings.getByRole('combobox', { name: 'How new sessions start', exact: true }).selectOption('sdk')
    expect((await saved).postDataJSON()).toMatchObject({
      changes: { newSessionBackend: { value: 'sdk', baseRevision: expect.any(Number) } },
    })
    await expect.poll(() => handle.state.settings.values.newSessionBackend).toBe('sdk')
    await settings.getByRole('button', { name: 'Close', exact: true }).click()
    await page.getByRole('button', { name: 'App settings', exact: true }).click()
    await expect(page.getByRole('combobox', { name: 'How new sessions start', exact: true })).toHaveValue('sdk')
  })
})
