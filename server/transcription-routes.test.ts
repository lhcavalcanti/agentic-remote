import fastifyMultipart from '@fastify/multipart'
import Fastify from 'fastify'
import { describe, expect, it, vi } from 'vitest'
import {
  registerTranscriptionRoutes,
  transcriptionMultipartOptions,
} from './transcription-routes.js'
import type {
  AudioUpload,
  TranscriptionService,
} from './transcription-service.js'

function multipartAudio(
  filename: string,
  mimeType: string,
  content: string,
): { boundary: string; payload: Buffer } {
  const boundary = 'agentic-remote-test-boundary'
  const payload = Buffer.from(
    [
      `--${boundary}`,
      `Content-Disposition: form-data; name="audio"; filename="${filename}"`,
      `Content-Type: ${mimeType}`,
      '',
      content,
      `--${boundary}--`,
      '',
    ].join('\r\n'),
  )
  return { boundary, payload }
}

describe('transcription routes', () => {
  it('streams one audio file to the transcription service', async () => {
    const transcribe = vi.fn(async (upload: AudioUpload) => {
      const chunks: Buffer[] = []
      for await (const chunk of upload.stream) {
        chunks.push(Buffer.from(chunk))
      }
      expect(Buffer.concat(chunks).toString()).toBe('audio data')
      expect(upload.filename).toBe('idea.m4a')
      expect(upload.mimeType).toBe('audio/x-m4a')
      return { transcript: 'An idea', durationSeconds: 4 }
    })
    const service: TranscriptionService = {
      initialize: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      transcribe,
    }
    const app = Fastify({ logger: false })
    await app.register(fastifyMultipart, transcriptionMultipartOptions)
    await registerTranscriptionRoutes(app, service)
    const { boundary, payload } = multipartAudio(
      'idea.m4a',
      'audio/x-m4a',
      'audio data',
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/transcriptions',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      transcript: 'An idea',
      durationSeconds: 4,
    })
    expect(transcribe).toHaveBeenCalledOnce()
    await app.close()
  })
})
