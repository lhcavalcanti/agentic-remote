import { expect, test } from '@playwright/test'
import {
  FakeVoiceController,
  installFakeBrowserVoice,
} from './fixtures/fake-voice'

test('Oracle Conversation handles permission, turns, interruption, reconnect, mobile, and dictation', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await installFakeBrowserVoice(page)
  const reset = await page.request.post('/__e2e/reset')
  expect(reset.ok()).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('main').getByRole('button', { name: /^Oracle/ }).click()
  const delegate = page.getByRole('button', { name: 'Delegate' })
  await delegate.tap()
  await expect(delegate).toHaveAttribute('aria-pressed', 'true')

  const voice = new FakeVoiceController(page)
  await voice.setPermission('denied')
  await page.getByRole('button', { name: 'Start conversation' }).click()
  await expect(page.getByRole('alert')).toContainText('Microphone permission was denied')
  await expect(page.getByRole('button', { name: 'Dictate to Oracle' })).toBeEnabled()

  await voice.setPermission('granted')
  const start = page.getByRole('button', { name: 'Start conversation' })
  await start.focus()
  await expect(start).toBeFocused()
  await start.tap()
  await expect(page.getByText('Listening', { exact: true })).toBeVisible()
  await expect(delegate).toBeEnabled()
  await expect(delegate).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText(
    'Conversation voice is Ask-only; typed messages use Delegate',
  )).toBeVisible()

  await voice.speak('What is running?', {
    partial: 'What is run',
    holdFinal: true,
  })
  await expect(page.getByText('What is run', { exact: true })).toBeVisible()
  await voice.releaseFinal()
  await expect(page.getByText('What is running?', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('')
  await expect.poll(() => voice.managerSends()).toEqual(['What is running?'])

  await voice.oracleDelta('Two sessions')
  await expect(page.getByText('Two sessions', { exact: true })).toBeVisible()
  await voice.oracleDelta('Two sessions are still running.')
  await expect(page.getByText('Two sessions are still running.', { exact: true })).toBeVisible()
  expect((await voice.snapshot()).synthesizedTexts).toEqual([])
  await voice.finishOracle('Two sessions are still running.')
  await expect.poll(async () => (await voice.snapshot()).synthesizedTexts).toEqual([
    'Two sessions are still running.',
  ])
  await expect.poll(async () => (await voice.snapshot()).audioStarts).toBeGreaterThan(0)
  await expect.poll(() => voice.playedText()).toEqual([
    'Two sessions are still running.',
  ])

  await voice.speak('Which one needs attention?', {
    partial: 'Which one needs',
  })
  await expect.poll(() => voice.managerSends()).toEqual([
    'What is running?',
    'Which one needs attention?',
  ])

  await page.evaluate(() => {
    window.__oracleVoiceE2E.playbackStartDelayMs = 1_500
  })
  await voice.oracleDelta('This synthesis is cancelled before playback. More')
  await expect.poll(async () => (await voice.snapshot()).synthesizedTexts).toContain(
    'This synthesis is cancelled before playback.',
  )
  expect(await voice.playedText()).not.toContain(
    'This synthesis is cancelled before playback.',
  )
  await expect(page.getByText('Speaking', { exact: true })).toBeVisible()

  const unrelatedTypedId = await voice.seedTyped('Unrelated typed work')
  const beforeBargeIn = await voice.snapshot()
  const cancellationTarget = beforeBargeIn.managerMessages.find(
    (message) => message.content === 'Which one needs attention?',
  )?.id
  expect(cancellationTarget).toBeTruthy()
  await voice.beginSpeech('Stop and summarize.', { holdFinal: true })
  await expect(page.getByText('Interrupted', { exact: true })).toBeVisible()
  await expect.poll(async () => (await voice.snapshot()).audioStops).toBeGreaterThan(
    beforeBargeIn.audioStops,
  )
  await voice.endSpeech()
  await voice.releaseFinal()
  await expect.poll(async () => (await voice.snapshot()).managerCancellations)
    .toEqual([cancellationTarget])
  const afterBargeIn = await voice.snapshot()
  expect(afterBargeIn.activeStreams).toBe(1)
  expect(afterBargeIn.streamStarts).toBe(beforeBargeIn.streamStarts)
  const unrelatedTyped = afterBargeIn.managerMessages.find((message) =>
    message.id === unrelatedTypedId)
  expect(unrelatedTyped).toMatchObject({ state: 'queued' })
  expect(unrelatedTyped?.source).toBeUndefined()
  await page.evaluate(() => {
    window.__oracleVoiceE2E.playbackStartDelayMs = 0
  })
  await voice.oracleDelta('Summary one is obsolete. More')
  await expect.poll(() => voice.playedText()).toContain('Summary one is obsolete.')
  expect(await voice.playedText()).not.toContain(
    'This synthesis is cancelled before playback.',
  )
  const staleGeneration = await voice.currentGeneration()

  for (const [index, transcript] of [
    'First interruption.',
    'Second interruption.',
    'Third interruption.',
  ].entries()) {
    await voice.speak(transcript)
    await voice.oracleDelta(`Fresh response ${index + 1}. More`)
    await expect.poll(() => voice.playedText()).toContain(`Fresh response ${index + 1}.`)
  }

  const beforeStale = await voice.snapshot()
  await voice.emitStaleGeneration(staleGeneration)
  const afterStale = await voice.snapshot()
  expect(afterStale.audioStarts).toBe(beforeStale.audioStarts)
  await expect.poll(() => voice.managerSends()).toEqual([
    'What is running?',
    'Which one needs attention?',
    'Stop and summarize.',
    'First interruption.',
    'Second interruption.',
    'Third interruption.',
  ])

  const beforeDrop = await voice.snapshot()
  await voice.dropNetwork()
  await expect(page.getByText('Reconnecting', { exact: true })).toBeVisible()
  await expect(page.getByText('Listening', { exact: true })).toBeVisible({
    timeout: 10_000,
  })
  const afterReconnect = await voice.snapshot()
  expect(afterReconnect.streamStarts).toBe(beforeDrop.streamStarts + 1)
  expect(afterReconnect.audioFrames).toBe(beforeDrop.audioFrames)
  expect(afterReconnect.managerSends).toEqual(beforeDrop.managerSends)

  await voice.beginSpeech('Keep only the bounded prefix.')
  await page.evaluate(async () => {
    await window.__oracleVoiceE2E.vad?.pushAudio(
      new Array(16_000 * 30 + 1).fill(0.25),
    )
  })
  await expect(page.locator('p[aria-live="polite"]')).toContainText(
    'submitted the first 30 seconds of speech',
  )
  await expect.poll(() => voice.managerSends()).toContain(
    'Keep only the bounded prefix.',
  )
  await voice.endSpeech()
  expect((await voice.managerSends()).filter(
    (text) => text === 'Keep only the bounded prefix.',
  )).toHaveLength(1)
  await voice.speak('Continue after the bounded segment.')
  await expect.poll(() => voice.managerSends()).toContain(
    'Continue after the bounded segment.',
  )

  const status = page.getByRole('group', { name: 'Conversation status' })
  await expect(status).toBeInViewport({ ratio: 1 })
  const bounds = await status.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  await expect(page.getByText(/Speech processing stays on your selected computer/)).toBeVisible()

  const stop = page.getByRole('button', { name: 'Stop conversation' })
  await stop.focus()
  await expect(stop).toBeFocused()
  await stop.tap()
  await expect(page.getByRole('button', { name: 'Dictate to Oracle' })).toBeEnabled()
  await page.getByRole('button', { name: 'Dictate to Oracle' }).tap()
  await expect(page.getByText(/Recording 0:00/)).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).tap()
})
