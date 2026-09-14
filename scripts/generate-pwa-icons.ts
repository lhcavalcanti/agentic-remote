import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { appIconSvg } from '../src/app-icon-design'

const root = resolve(import.meta.dirname, '..')
const legacyAppleTouchIcons = [
  'public/apple-touch-icon.png',
  'public/apple-touch-icon-precomposed.png',
  'public/apple-touch-icon-120x120.png',
  'public/apple-touch-icon-152x152.png',
  'public/apple-touch-icon-167x167.png',
  'public/apple-touch-icon-180x180.png',
  'public/icons/apple-touch-icon.png',
  'public/icons/apple-touch-icon-120x120.png',
  'public/icons/apple-touch-icon-152x152.png',
  'public/icons/apple-touch-icon-167x167.png',
  'public/icons/apple-touch-icon-180x180.png',
] as const
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

async function renderIcon(
  path: string,
  size: number,
) {
  const output = resolve(root, path)
  await mkdir(dirname(output), { recursive: true })
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #111210; }
      svg { display: block; width: 100%; height: 100%; }
    </style>
    ${appIconSvg()}
  `)
  await page.locator('svg').screenshot({ path: output })
}

try {
  await Promise.all(
    legacyAppleTouchIcons.map((path) =>
      rm(resolve(root, path), { force: true }),
    ),
  )
  await writeFile(
    resolve(root, 'public/icon.svg'),
    `${appIconSvg()}\n`,
  )
  await renderIcon('public/icons/relay-icon-192.png', 192)
  await renderIcon('public/icons/relay-icon-512.png', 512)
  await renderIcon('public/icons/relay-icon-1024.png', 1024)
  await copyFile(
    resolve(root, 'public/icons/relay-icon-192.png'),
    resolve(root, 'public/icons/icon-192.png'),
  )
  await copyFile(
    resolve(root, 'public/icons/relay-icon-512.png'),
    resolve(root, 'public/icons/icon-512.png'),
  )
  await copyFile(
    resolve(root, 'public/icons/relay-icon-512.png'),
    resolve(root, 'public/icons/icon-512-maskable.png'),
  )
} finally {
  await browser.close()
}
