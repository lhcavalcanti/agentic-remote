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
  await expect.poll(async () => (await voice.snapshot()).synthesizedTexts).toEqual([
    'Two sessions are still running.',
  ])
  await expect.poll(async () => (await voice.snapshot()).audioStarts).toBeGreaterThan(0)
  await expect.poll(() => voice.playedText()).toEqual([
    'Two sessions are still running.',
  ])

  await voice.finishOracle('Two sessions are still running.')
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
  await voice.oracleDelta('This synthesis is cancelled before playback.')
  await expect.poll(async () => (await voice.snapshot()).synthesizedTexts).toContain(
    'This synthesis is cancelled before playback.',
  )
  expect(await voice.playedText()).not.toContain(
    'This synthesis is cancelled before playback.',
  )
  await expect(page.getByText('Speaking', { exact: true })).toBeVisible()

  const beforeBargeIn = await voice.snapshot()
  await voice.beginSpeech('Stop and summarize.', { holdFinal: true })
  await expect(page.getByText('Interrupted', { exact: true })).toBeVisible()
  await expect.poll(async () => (await voice.snapshot()).audioStops).toBeGreaterThan(
    beforeBargeIn.audioStops,
  )
  await voice.endSpeech()
  await voice.releaseFinal()
  await page.evaluate(() => {
    window.__oracleVoiceE2E.playbackStartDelayMs = 0
  })
  await voice.oracleDelta('Summary one is obsolete.')
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
    await voice.oracleDelta(`Fresh response ${index + 1}.`)
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
