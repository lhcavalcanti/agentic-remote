import fastifyMultipart from '@fastify/multipart'
import Fastify from 'fastify'
import { describe, expect, it, vi } from 'vitest'
import type { ComputerManager } from './computer-manager.js'
import {
  registerFileUploadRoutes,
  supportsSessionFile,
} from './file-upload-routes.js'
import { transcriptionMultipartOptions } from './transcription-routes.js'

function multipartFile(
  filename: string,
  content: string,
): { boundary: string; payload: Buffer } {
  const boundary = 'agentic-remote-file-boundary'
  return {
    boundary,
    payload: Buffer.from(
      [
        `--${boundary}`,
        `Content-Disposition: form-data; name="file"; filename="${filename}"`,
        'Content-Type: application/octet-stream',
        '',
        content,
        `--${boundary}--`,
        '',
      ].join('\r\n'),
    ),
  }
}

describe('file upload routes', () => {
  it('uploads a supported document to the selected computer session', async () => {
    const uploadFile = vi.fn(
      async (
        _computerId: string,
        _sessionId: string,
        filename: string,
        data: Buffer,
      ) => ({
        name: filename,
        path: `/private/${filename}`,
        size: data.length,
      }),
    )
    const app = Fastify({ logger: false })
    await app.register(fastifyMultipart, transcriptionMultipartOptions)
    await registerFileUploadRoutes(app, {
      uploadFile,
    } as unknown as ComputerManager)
    const { boundary, payload } = multipartFile(
      'statement.pdf',
      'financial data',
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer/sessions/session/files',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload,
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      file: {
        name: 'statement.pdf',
        path: '/private/statement.pdf',
        size: 14,
      },
    })
    expect(uploadFile).toHaveBeenCalledWith(
      'computer',
      'session',
      'statement.pdf',
      Buffer.from('financial data'),
    )
    await app.close()
  })

  it('allows financial and document formats but rejects executables', () => {
    expect(supportsSessionFile('statement.pdf')).toBe(true)
    expect(supportsSessionFile('transactions.csv')).toBe(true)
    expect(supportsSessionFile('portfolio.xlsx')).toBe(true)
    expect(supportsSessionFile('payload.sh')).toBe(false)
  })
})
