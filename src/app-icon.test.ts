// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import {
  appIconColors,
  appIconPreferenceFrom,
  appIconStyles,
  appIconSvg,
  appleTouchIconPath,
  applyAppIcon,
  defaultAppIcon,
} from './app-icon'

afterEach(() => {
  document.head.innerHTML = ''
  delete document.documentElement.dataset.appIconStyle
  delete document.documentElement.dataset.appIconColor
})

describe('app icon identity', () => {
  it('offers five glyphs and six durable colors', () => {
    expect(appIconStyles.map((entry) => entry.id)).toEqual([
      'relay',
      'bridge',
      'orbit',
      'beacon',
      'atlas',
    ])
    expect(appIconColors).toHaveLength(6)
  })

  it('normalizes unknown stored preferences', () => {
    expect(appIconPreferenceFrom({ style: 'unknown', color: 'teal' })).toEqual({
      style: defaultAppIcon.style,
      color: 'teal',
    })
    expect(appIconPreferenceFrom(null)).toEqual(defaultAppIcon)
  })

  it('renders every style as valid colorized SVG', () => {
    for (const style of appIconStyles) {
      const svg = new DOMParser().parseFromString(
        appIconSvg({ style: style.id, color: 'violet' }),
        'image/svg+xml',
      )
      expect(svg.querySelector('parsererror')).toBeNull()
      expect(svg.documentElement.getAttribute('color')).toBe('#ad92ff')
      expect(svg.querySelectorAll('[fill="currentColor"], [stroke="currentColor"]').length)
        .toBeGreaterThan(2)
    }
  })

  it('updates and restores favicon, Apple touch icon, and document identity', () => {
    const favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.href = '/icon.svg'
    favicon.type = 'image/svg+xml'
    const touch = document.createElement('link')
    touch.rel = 'apple-touch-icon'
    touch.href = '/icons/apple-touch-icon.png'
    document.head.append(favicon, touch)

    const restore = applyAppIcon({ style: 'atlas', color: 'teal' })
    expect(favicon.href).toContain(encodeURIComponent('color="#63d6c0"'))
    expect(touch.getAttribute('href')).toBe(
      '/icons/app/app-atlas-teal-180.png',
    )
    expect(touch.getAttribute('sizes')).toBe('180x180')
    expect(document.documentElement.dataset.appIconStyle).toBe('atlas')
    expect(document.documentElement.dataset.appIconColor).toBe('teal')
    expect(appleTouchIconPath({ style: 'atlas', color: 'teal' }))
      .toBe('/icons/app/app-atlas-teal-180.png')

    restore()
    expect(favicon.getAttribute('href')).toBe('/icon.svg')
    expect(touch.getAttribute('href')).toBe('/icons/apple-touch-icon.png')
    expect(document.documentElement.dataset.appIconStyle).toBeUndefined()
  })
})
