import { describe, expect, it } from 'vitest'
import {
  oracleDockShortcutBinding,
  oracleShortcutBinding,
} from './app-shortcuts'

describe('oracleShortcutBinding', () => {
  it.each([
    ['Linux', { code: 'KeyO', alt: true, shift: false, ctrl: true, meta: false }],
    ['Win32', { code: 'KeyO', alt: true, shift: false, ctrl: true, meta: false }],
    ['MacIntel', { code: 'KeyO', alt: true, shift: false, ctrl: false, meta: true }],
    ['iPhone', { code: 'KeyO', alt: true, shift: false, ctrl: false, meta: true }],
  ])('uses the platform command modifier on %s', (platform, expected) => {
    expect(oracleShortcutBinding(platform)).toEqual(expected)
  })
})

describe('oracleDockShortcutBinding', () => {
  it.each([
    ['Linux', { code: 'KeyP', alt: true, shift: false, ctrl: true, meta: false }],
    ['Win32', { code: 'KeyP', alt: true, shift: false, ctrl: true, meta: false }],
    ['MacIntel', { code: 'KeyP', alt: true, shift: false, ctrl: false, meta: true }],
    ['iPhone', { code: 'KeyP', alt: true, shift: false, ctrl: false, meta: true }],
  ])('uses the platform command modifier on %s', (platform, expected) => {
    expect(oracleDockShortcutBinding(platform)).toEqual(expected)
  })
})
