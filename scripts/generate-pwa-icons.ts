import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { appIconSvg } from '../src/app-icon-design'

const root = resolve(import.meta.dirname, '..')
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
  await writeFile(
    resolve(root, 'public/icon.svg'),
    `${appIconSvg()}\n`,
  )
  await renderIcon('public/icons/apple-touch-icon.png', 180)
  await renderIcon('public/icons/icon-192.png', 192)
  await renderIcon('public/icons/icon-512.png', 512)
  await renderIcon('public/icons/icon-512-maskable.png', 512)
  await copyFile(
    resolve(root, 'public/icons/apple-touch-icon.png'),
    resolve(root, 'public/apple-touch-icon.png'),
  )
  await copyFile(
    resolve(root, 'public/icons/apple-touch-icon.png'),
    resolve(root, 'public/apple-touch-icon-precomposed.png'),
  )
} finally {
  await browser.close()
}
