import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  packagedMediaDigests,
  packagedMediaPaths,
} from './transcription-service.js'

async function sha256(filePath: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
  }
  return hash.digest('hex')
}

describe('packaged media digests', () => {
  it('matches the ffmpeg-static and ffprobe-static binaries in the lockfile', async () => {
    const platform = `${process.platform}-${process.arch}`
    const { ffmpeg, ffprobe } = packagedMediaPaths
    if (!ffmpeg || !ffprobe) {
      throw new Error(
        'ffmpeg-static/ffprobe-static did not resolve a binary path; run pnpm install',
      )
    }

    const actual = {
      ffmpeg: await sha256(ffmpeg),
      ffprobe: await sha256(ffprobe),
    }
    const replacement = `  '${platform}': {\n    ffmpeg: '${actual.ffmpeg}',\n    ffprobe: '${actual.ffprobe}',\n  },`
    const expected = packagedMediaDigests[platform]

    expect(
      expected,
      `Transcription is unavailable on ${platform} because packagedMediaDigests has no entry. Add to server/transcription-service.ts:\n${replacement}`,
    ).toBeDefined()
    expect(
      actual,
      `Packaged media binaries changed for ${platform}, so transcription would fail with a 503. Update packagedMediaDigests in server/transcription-service.ts:\n${replacement}`,
    ).toEqual(expected)
  })
})
