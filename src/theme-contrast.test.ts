import { describe, expect, it } from 'vitest'
import { accentSettings } from '../shared/settings-profile'
import css from './index.css?raw'

type Rgb = [number, number, number]

function hex(value: string): Rgb {
  const digits = value.replace('#', '')
  return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16)) as Rgb
}

function luminance([red, green, blue]: Rgb): number {
  const channel = (value: number) => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}

function contrast(left: Rgb, right: Rgb): number {
  const [light, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a)
  return (light + 0.05) / (dark + 0.05)
}

/** `color-mix(in srgb, a p%, b)`, which is a per-channel weighted average. */
function mix(left: Rgb, right: Rgb, weight: number): Rgb {
  return left.map((value, index) => Math.round(value * weight + right[index] * (1 - weight))) as Rgb
}

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  expect(start, selector).toBeGreaterThanOrEqual(0)
  return css.slice(start, css.indexOf('}', start))
}

function token(source: string, name: string): string {
  const match = source.match(new RegExp(`--${name}:\\s*([^;]+);`))
  expect(match, name).not.toBeNull()
  return match![1].trim()
}

const graphite = block(':root')
const light = block(":root[data-appearance='light']")

function accentTokens(accent: string) {
  const source = accent === 'agentic' ? graphite : block(`.app-shell[data-accent-theme='${accent}']`)
  return { accent: hex(token(source, 'accent')), contrast: hex(token(source, 'accent-contrast')) }
}

// The light appearance darkens the accent for text: color-mix(accent 35%, ink).
const lightForeground = token(block(".app-shell[data-appearance='light']"), 'accent-foreground')
const lightMix = lightForeground.match(/color-mix\(in srgb, var\(--accent\) (\d+)%, (#[0-9a-f]{6})\)/i)

describe('accent contrast', () => {
  it('derives light-appearance accent text the way this test models it', () => {
    expect(lightMix).not.toBeNull()
  })

  it.each(accentSettings)('keeps %s readable as text and as a button in both appearances', (accent) => {
    const { accent: color, contrast: onAccent } = accentTokens(accent)
    const surfaces = {
      graphite: ['bg', 'panel'].map((name) => hex(token(graphite, name))),
      light: ['bg', 'panel'].map((name) => hex(token(light, name))),
    }
    const lightText = mix(color, hex(lightMix![2]), Number(lightMix![1]) / 100)
    // WCAG AA body text is 4.5:1.
    for (const surface of surfaces.graphite) expect(contrast(color, surface)).toBeGreaterThanOrEqual(4.5)
    for (const surface of surfaces.light) expect(contrast(lightText, surface)).toBeGreaterThanOrEqual(4.5)
    // A raised light surface still clears the 3:1 needed by UI components.
    expect(contrast(lightText, hex(token(light, 'panel-soft')))).toBeGreaterThanOrEqual(3)
    // Text on a filled accent button.
    expect(contrast(onAccent, color)).toBeGreaterThanOrEqual(4.5)
  })

  it('stops theme transitions for people who ask for reduced motion', () => {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/transition-duration:\s*0\.01ms !important/)
    expect(reduced).toMatch(/animation-duration:\s*0\.01ms !important/)
  })

  it('keeps each hidden accent radio inside its own option, so focusing it scrolls nothing else', () => {
    expect(block('.accent-theme-option')).toMatch(/position:\s*relative/)
    const radio = block('.accent-theme-option input')
    expect(radio).toMatch(/position:\s*absolute/)
    expect(radio).toMatch(/inset:\s*0/)
  })
})
