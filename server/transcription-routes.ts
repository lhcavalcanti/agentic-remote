import type { FastifyInstance } from 'fastify'
import {
  MAX_AUDIO_BYTES,
  TranscriptionError,
  type TranscriptionService,
} from './transcription-service.js'

export const transcriptionMultipartOptions = {
  throwFileSizeLimit: false,
} as const

export async function registerTranscriptionRoutes(
  app: FastifyInstance,
  service: TranscriptionService,
): Promise<void> {
  app.post('/api/transcriptions', async (request, reply) => {
    const upload = await request.file({
      limits: {
        fields: 0,
        files: 1,
        fileSize: MAX_AUDIO_BYTES,
        parts: 1,
      },
    })
    if (!upload) {
      throw new TranscriptionError('An audio file is required', 400)
    }

    const controller = new AbortController()
    const cancel = () => controller.abort()
    request.raw.once('aborted', cancel)
    reply.raw.once('close', cancel)
    try {
      return await service.transcribe(
        {
          filename: upload.filename,
          mimeType: upload.mimetype,
          stream: upload.file,
          truncated: () => upload.file.truncated,
        },
        controller.signal,
      )
    } finally {
      request.raw.off('aborted', cancel)
      reply.raw.off('close', cancel)
    }
  })
}
