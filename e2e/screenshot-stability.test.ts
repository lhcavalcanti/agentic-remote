import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screenshotsAreClose } from './screenshot-stability'

type FixtureBitmap = {
  width: number
  height: number
  pixels: Uint8ClampedArray
  close: () => void
}

const bitmaps: FixtureBitmap[] = []
let contextAvailable = true

class FixtureCanvas {
  private frame?: FixtureBitmap

  getContext() {
    if (!contextAvailable) return null
    return {
      drawImage: (frame: FixtureBitmap) => { this.frame = frame },
      clearRect: () => { this.frame = undefined },
      getImageData: () => ({ data: new Uint8ClampedArray(this.frame?.pixels || []) }),
    }
  }
}

function bitmap(changes = 0, width = 20, height = 20): FixtureBitmap {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let index = 0; index < changes; index++) pixels[index * 4] = 1
  return { width, height, pixels, close: vi.fn() }
}

beforeEach(() => {
  contextAvailable = true
  vi.stubGlobal('OffscreenCanvas', FixtureCanvas)
  vi.stubGlobal('createImageBitmap', vi.fn(async () => bitmaps.shift()))
})

afterEach(() => {
  bitmaps.length = 0
  vi.unstubAllGlobals()
})

describe('screenshot stability', () => {
  it.each([0, 1, 12, 13, 40])('bounds tolerance for %i differing pixels', async (changed) => {
    const before = bitmap()
    const after = bitmap(changed)
    bitmaps.push(before, after)
    await expect(screenshotsAreClose({ previous: 'AA==', current: 'AQ==' }))
      .resolves.toBe(changed <= 12)
    expect(before.close).toHaveBeenCalledOnce()
    expect(after.close).toHaveBeenCalledOnce()
  })

  it('rejects a viewport-size change even when its pixels are blank', async () => {
    bitmaps.push(bitmap(), bitmap(0, 10, 40))
    await expect(screenshotsAreClose({ previous: 'AA==', current: 'AQ==' }))
      .resolves.toBe(false)
  })

  it('releases the first bitmap when decoding the second fails', async () => {
    const before = bitmap()
    vi.mocked(createImageBitmap)
      .mockResolvedValueOnce(before)
      .mockRejectedValueOnce(new Error('PNG decoding failed'))
    await expect(screenshotsAreClose({ previous: 'AA==', current: 'AQ==' }))
      .rejects.toThrow('PNG decoding failed')
    expect(before.close).toHaveBeenCalledOnce()
  })

  it('surfaces unavailable pixel comparison rather than accepting a frame', async () => {
    contextAvailable = false
    const before = bitmap()
    const after = bitmap()
    bitmaps.push(before, after)
    await expect(screenshotsAreClose({ previous: 'AA==', current: 'AQ==' }))
      .rejects.toThrow('Cannot compare screenshot pixels')
    expect(before.close).toHaveBeenCalledOnce()
    expect(after.close).toHaveBeenCalledOnce()
  })
})
