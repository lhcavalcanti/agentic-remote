import { readFile, readdir } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { appIconSvg } from '../src/app-icon-design.js'

const root = new URL('../', import.meta.url)
const manifestIconSizes = [192, 512, 1024] as const

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

  it('keeps the credentialed manifest icons synchronized', async () => {
    const manifest = JSON.parse(
      await readFile(
        new URL('../public/manifest.webmanifest', import.meta.url),
        'utf8',
      ),
    ) as {
      id?: string
      icons?: Array<{
        src?: string
        sizes?: string
        type?: string
        purpose?: string
      }>
    }
    expect(manifest.id).toBe('/')
    expect(manifest.icons?.filter((icon) => icon.purpose === 'any')).toEqual(
      manifestIconSizes.map((size) => ({
        src: `/icons/relay-icon-${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any',
      })),
    )

    for (const size of manifestIconSizes) {
      expect(await pngSize(`public/icons/relay-icon-${size}.png`)).toEqual({
        width: size,
        height: size,
        colorType: 2,
      })
    }
    expect(
      await readFile(new URL('../public/icons/icon-192.png', import.meta.url)),
    ).toEqual(
      await readFile(
        new URL('../public/icons/relay-icon-192.png', import.meta.url),
      ),
    )
    expect(
      await readFile(new URL('../public/icons/icon-512.png', import.meta.url)),
    ).toEqual(
      await readFile(
        new URL('../public/icons/relay-icon-512.png', import.meta.url),
      ),
    )
    expect(
      await readFile(
        new URL('../public/icons/icon-512-maskable.png', import.meta.url),
      ),
    ).toEqual(
      await readFile(
        new URL('../public/icons/relay-icon-512.png', import.meta.url),
      ),
    )
    expect(
      (await readdir(new URL('../public/', import.meta.url)))
        .filter((name) => name.startsWith('apple-touch-icon')),
    ).toEqual([])
    expect(
      (await readdir(new URL('../public/icons/', import.meta.url)))
        .filter((name) => name.startsWith('apple-touch-icon')),
    ).toEqual([])
  })
})
