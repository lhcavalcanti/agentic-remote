import { readFile, writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { parsePcm16Wave } from '../scripts/oracle-voice-benchmark'
import { installFakeBrowserVoice } from './fixtures/fake-voice'

interface RealVoiceState {
  managerSends: string[]
  managerCancellations: number
  workerPid?: number
  workerAlive: boolean
  metrics: {
    firstPartialMs?: number
    finalAfterSpeechMs?: number
    sttRtf?: number
    ttsFirstAudioMs?: number
    ttsRtf?: number
    peakRssMiB?: number
    sustainedCpuPercent?: number
    cancellationGeneration?: number
    audioAfterCancellation: number
    generations: Record<string, {
      audioFrames: number
      audioEndEvents: number
      audioAfterCancellation: number
      cancelled: boolean
    }>
    fatalError?: string
  }
}

test('real sherpa transport submits, speaks, and rejects interrupted audio', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const wavPath = process.env.AGENTIC_REMOTE_REAL_E2E_WAV
  if (!wavPath) throw new Error('AGENTIC_REMOTE_REAL_E2E_WAV is required')
  const wave = parsePcm16Wave(await readFile(wavPath))
  expect(wave.sampleRate).toBe(16_000)
  expect(wave.channels).toBe(1)
  const samples = Array.from(wave.samples, (sample) => sample / 32_768)

  await installFakeBrowserVoice(page)
  expect((await page.request.post('/__e2e/reset')).ok()).toBe(true)
  await page.goto('/')
  await page.locator('main').getByRole('button', { name: /^Oracle/ }).click()
  await page.getByRole('button', { name: 'Start conversation' }).click()
  await expect(page.getByText('Listening', { exact: true })).toBeVisible()

  await page.waitForFunction(() => Boolean(window.__oracleVoiceE2E.vad))
  await page.evaluate(() => {
    window.__oracleVoiceE2E.vadFrameDelayMs = 20
  })
  const firstStartedAt = Date.now()
  await page.evaluate(() => window.__oracleVoiceE2E.vad?.beginSpeech())
  await page.evaluate(
    (audio) => window.__oracleVoiceE2E.vad?.pushAudio(audio),
    samples,
  )
  await expect(page.locator('[aria-live="polite"]')).not.toBeEmpty()
  await page.evaluate(() => window.__oracleVoiceE2E.vad?.endSpeech())
  await expect.poll(async () => (await realState(page)).managerSends.length, {
    timeout: 30_000,
  }).toBe(1)
  const firstState = await realState(page)
  const transcript = firstState.managerSends[0]
  expect(transcript.length).toBeGreaterThan(0)
  await expect(page.getByText(transcript, { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('')
  expect(Date.now() - firstStartedAt).toBeLessThan(30_000)

  const browserBeforeTts = await browserAudioState(page)
  await page.evaluate(() => {
    window.__oracleVoiceE2E.playbackStartDelayMs = 1_500
  })
  await post(page, '/__e2e/manager/delta', {
    content: 'The verified systems are healthy.',
  })
  await expect(page.getByText('The verified systems are healthy.', {
    exact: true,
  })).toBeVisible()
  await expect.poll(async () => {
    const state = await realState(page)
    return state.metrics.fatalError ?? state.metrics.ttsFirstAudioMs
  }, { timeout: 30_000 }).not.toBeUndefined()
  expect((await realState(page)).metrics.fatalError).toBeUndefined()
  await expect.poll(async () => (await browserAudioState(page)).starts, {
    timeout: 30_000,
  }).toBe(browserBeforeTts.starts)
  await expect.poll(async () => (
    await browserAudioState(page)
  ).scheduled.filter(({ generation }) => generation === 1).length, {
    timeout: 30_000,
  }).toBeGreaterThan(0)
  await expect.poll(async () => (
    await browserAudioState(page)
  ).pending.filter(({ generation }) => generation === 1).length).toBeGreaterThan(0)
  const pendingState = await realState(page)
  expect(pendingState.metrics.generations['1']?.audioFrames).toBeGreaterThan(0)
  expect(pendingState.metrics.generations['1']?.audioEndEvents).toBeGreaterThan(0)
  await expect(page.getByText('Speaking', { exact: true })).toBeVisible()

  const interruptionAt = await page.evaluate(async () => {
    const at = performance.now()
    await window.__oracleVoiceE2E.vad?.beginSpeech()
    return at
  })
  await expect.poll(async () => (await browserAudioState(page)).stops).toBeGreaterThan(
    browserBeforeTts.stops,
  )
  await expect.poll(async () => (
    await browserAudioState(page)
  ).pending.filter(({ generation }) => generation === 1).length).toBe(0)

  await page.evaluate(
    (audio) => window.__oracleVoiceE2E.vad?.pushAudio(audio),
    samples,
  )
  await page.evaluate(() => window.__oracleVoiceE2E.vad?.endSpeech())
  await expect.poll(async () => (await realState(page)).managerSends.length, {
    timeout: 30_000,
  }).toBe(2)
  await post(page, '/__e2e/manager/delta', {
    content: 'The replacement generation is audible.',
  })
  await expect.poll(async () => (
    await browserAudioState(page)
  ).started.filter(({ generation }) => generation === 2).length, {
    timeout: 30_000,
  }).toBeGreaterThan(0)

  const finalState = await realState(page)
  const finalBrowserState = await browserAudioState(page)
  const oldAudioStartsAfterInterruption = finalBrowserState.started.filter(
    ({ at, generation }) => generation === 1 && at >= interruptionAt,
  ).length
  expect(finalState.workerAlive).toBe(true)
  expect(finalState.workerPid).toBeGreaterThan(0)
  expect(finalState.managerCancellations).toBeGreaterThanOrEqual(1)
  expect(typeof finalState.metrics.firstPartialMs).toBe('number')
  expect(typeof finalState.metrics.finalAfterSpeechMs).toBe('number')
  expect(typeof finalState.metrics.sttRtf).toBe('number')
  expect(typeof finalState.metrics.ttsFirstAudioMs).toBe('number')
  expect(typeof finalState.metrics.ttsRtf).toBe('number')
  expect(typeof finalState.metrics.peakRssMiB).toBe('number')
  expect(typeof finalState.metrics.sustainedCpuPercent).toBe('number')
  expect(typeof finalState.metrics.cancellationGeneration).toBe('number')
  expect(finalState.metrics.audioAfterCancellation).toBe(0)
  expect(finalState.metrics.generations['1']?.cancelled).toBe(true)
  expect(finalState.metrics.generations['1']?.audioAfterCancellation).toBe(0)
  expect(oldAudioStartsAfterInterruption).toBe(0)
  const outputPath = process.env.AGENTIC_REMOTE_REAL_E2E_OUTPUT
  if (outputPath) {
    await writeFile(outputPath, `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      managerSendCount: finalState.managerSends.length,
      managerCancellationCount: finalState.managerCancellations,
      workerPid: finalState.workerPid,
      workerAlive: finalState.workerAlive,
      metrics: finalState.metrics,
      browserAudio: finalBrowserState,
      interruptionAt,
      oldAudioStartsAfterInterruption,
    }, null, 2)}\n`, 'utf8')
  }
})

async function realState(page: Parameters<typeof browserAudioState>[0]): Promise<RealVoiceState> {
  const response = await page.request.get('/__e2e/real-state')
  expect(response.ok()).toBe(true)
  return response.json() as Promise<RealVoiceState>
}

async function browserAudioState(
  page: import('@playwright/test').Page,
): Promise<{
  starts: number
  stops: number
  scheduled: Array<{ id: number; generation: number; signature: number; at: number }>
  pending: Array<{ id: number; generation: number; signature: number; at: number }>
  started: Array<{ id: number; generation: number; signature: number; at: number }>
}> {
  return page.evaluate(() => ({
    starts: window.__oracleVoiceE2E.audioStarts.length,
    stops: window.__oracleVoiceE2E.audioStops,
    scheduled: [...window.__oracleVoiceE2E.audioScheduleRecords],
    pending: [...window.__oracleVoiceE2E.pendingAudioStarts],
    started: [...window.__oracleVoiceE2E.audioStartRecords],
  }))
}

async function post(
  page: import('@playwright/test').Page,
  pathname: string,
  data?: unknown,
): Promise<void> {
  const response = await page.request.post(pathname, { data })
  expect(response.ok()).toBe(true)
}
