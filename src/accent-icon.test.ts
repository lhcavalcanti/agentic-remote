// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { applyAccentIcon } from './accent-icon'

describe('accent icon', () => {
  it('tints the shared SVG artwork and restores the original favicon', () => {
    const icon = document.createElement('link')
    icon.rel = 'icon'
    icon.href = '/icon.svg'
    icon.type = 'image/svg+xml'
    document.head.append(icon)

    try {
      const restore = applyAccentIcon('#ad92ff')
      expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1)
      const svg = new DOMParser().parseFromString(
        decodeURIComponent(icon.href.split(',')[1]),
        'image/svg+xml',
      )
      expect(svg.querySelector('parsererror')).toBeNull()
      expect(svg.documentElement.getAttribute('color')).toBe('#ad92ff')
      expect(svg.querySelectorAll('[fill="currentColor"], [stroke="currentColor"]'))
        .toHaveLength(5)
      expect(svg.querySelector('rect')?.getAttribute('fill')).toBe('#111210')
      restore()
      expect(icon.getAttribute('href')).toBe('/icon.svg')
      expect(icon.type).toBe('image/svg+xml')
    } finally {
      icon.remove()
    }
  })

  it('creates and cleans up a favicon when the host document has none', () => {
    const restore = applyAccentIcon('#63d6c0')
    expect(document.querySelector('link[rel="icon"]')?.getAttribute('href'))
      .toContain(encodeURIComponent('color="#63d6c0"'))
    restore()
    expect(document.querySelector('link[rel="icon"]')).toBeNull()
  })
})
