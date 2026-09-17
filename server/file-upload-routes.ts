import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { ComputerManager } from './computer-manager.js'

export const MAX_SESSION_FILE_BYTES = 25 * 1024 * 1024

const supportedExtensions = new Set([
  '.csv',
  '.doc',
  '.docx',
  '.gif',
  '.jpeg',
  '.jpg',
  '.json',
  '.kql',
  '.md',
  '.ofx',
  '.pdf',
  '.png',
  '.qfx',
  '.tsv',
  '.txt',
  '.webp',
  '.xls',
  '.xlsx',
  '.yaml',
  '.yml',
])

interface SessionParams {
  computerId: string
  sessionId: string
}

export class FileUploadError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
    this.name = 'FileUploadError'
  }
}

export function supportsSessionFile(filename: string): boolean {
  return supportedExtensions.has(path.extname(filename).toLowerCase())
}

export async function registerFileUploadRoutes(
  app: FastifyInstance,
  manager: ComputerManager,
): Promise<void> {
  let activeUploads = 0
  app.post<{ Params: SessionParams }>(
    '/api/computers/:computerId/sessions/:sessionId/files',
    async (request, reply) => {
      const upload = await request.file({
        limits: {
          fields: 0,
          files: 1,
          fileSize: MAX_SESSION_FILE_BYTES,
          parts: 1,
        },
      })
      if (!upload) {
        throw new FileUploadError('A file is required', 400)
      }
      if (!supportsSessionFile(upload.filename)) {
        throw new FileUploadError('This file type is not supported', 415)
      }
      if (activeUploads >= 2) {
        throw new FileUploadError('Too many file uploads are in progress', 429)
      }
      activeUploads += 1
      try {
        const data = await upload.toBuffer()
        if (
          upload.file.truncated ||
          data.length === 0 ||
          data.length > MAX_SESSION_FILE_BYTES
        ) {
          throw new FileUploadError(
            data.length === 0
              ? 'The uploaded file is empty'
              : 'The file exceeds the 25 MiB limit',
            data.length === 0 ? 400 : 413,
          )
        }
        return reply.code(201).send({
          file: await manager.uploadFile(
            request.params.computerId,
            request.params.sessionId,
            upload.filename,
            data,
          ),
        })
      } finally {
        activeUploads -= 1
      }
    },
  )
}
