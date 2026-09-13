import { readFile, readdir } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { appIconSvg } from '../src/app-icon-design.js'

const root = new URL('../', import.meta.url)
const appleTouchSizes = [120, 152, 167, 180] as const

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
  it('ships Relay in Agentic green as the only app identity', async () => {
    expect(
      await readFile(new URL('../public/icon.svg', import.meta.url), 'utf8'),
    ).toBe(`${appIconSvg()}\n`)
    expect(appIconSvg()).toContain('color="#b8f36b"')
    expect(appIconSvg()).toContain('M178 220l52 38-52 38M254 304h82')
    await expect(
      readdir(new URL('../public/icons/app/', import.meta.url)),
    ).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('keeps the default install and manifest icons synchronized', async () => {
    for (const size of appleTouchSizes) {
      const name = `apple-touch-icon-${size}x${size}.png`
      expect(await pngSize(`public/icons/${name}`)).toEqual({
        width: size,
        height: size,
        colorType: 2,
      })
      expect(
        await readFile(new URL(`../public/${name}`, import.meta.url)),
      ).toEqual(
        await readFile(new URL(`../public/icons/${name}`, import.meta.url)),
      )
    }
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
      await readFile(new URL('../public/apple-touch-icon.png', import.meta.url)),
    ).toEqual(
      await readFile(
        new URL('../public/icons/apple-touch-icon-180x180.png', import.meta.url),
      ),
    )
    expect(
      await readFile(
        new URL('../public/apple-touch-icon-precomposed.png', import.meta.url),
      ),
    ).toEqual(
      await readFile(
        new URL('../public/icons/apple-touch-icon-180x180.png', import.meta.url),
      ),
    )
  })
})
