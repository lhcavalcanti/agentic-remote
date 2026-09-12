import { readFile, readdir } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import {
  appIconColors,
  appIconStyles,
  defaultAppIcon,
} from '../src/app-icon-design.js'

const root = new URL('../', import.meta.url)

async function pngSize(path: string): Promise<{
  width: number
  height: number
  colorType: number
}> {
  const bytes = await readFile(new URL(path, root))
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  }
}

describe('PWA app icon assets', () => {
  it('ships every selectable iPhone icon as an opaque 180px PNG', async () => {
    const files = await readdir(new URL('../public/icons/app/', import.meta.url))
    expect(files.sort()).toEqual(
      appIconStyles.flatMap((style) =>
        appIconColors.map(
          (color) => `app-${style.id}-${color.id}-180.png`,
        ),
      ).sort(),
    )
    for (const file of files) {
      expect(await pngSize(`public/icons/app/${file}`)).toEqual({
        width: 180,
        height: 180,
        colorType: 2,
      })
    }
  })

  it('keeps the default install and manifest icons synchronized', async () => {
    expect(await pngSize('public/icons/apple-touch-icon.png')).toEqual({
      width: 180,
      height: 180,
      colorType: 2,
    })
    expect(await pngSize('public/icons/icon-192.png')).toMatchObject({
      width: 192,
      height: 192,
    })
    expect(await pngSize('public/icons/icon-512.png')).toMatchObject({
      width: 512,
      height: 512,
    })
    expect(await pngSize('public/icons/icon-512-maskable.png')).toMatchObject({
      width: 512,
      height: 512,
    })
    expect(
      await readFile(
        new URL(
          `../public/icons/app/app-${defaultAppIcon.style}-${defaultAppIcon.color}-180.png`,
          import.meta.url,
        ),
      ),
    ).toEqual(
      await readFile(new URL('../public/icons/apple-touch-icon.png', import.meta.url)),
    )
  })
})
