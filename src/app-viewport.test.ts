import { describe, expect, it } from 'vitest'
import { appKeyboardOpen, appViewportGeometry } from './app-viewport'

describe('app viewport geometry', () => {
  it('fills the installed window when iOS reports a shorter idle visual viewport', () => {
    expect(appViewportGeometry({
      innerHeight: 852,
      visualHeight: 774,
      visualOffsetTop: 0,
      standalone: true,
      keyboardOpen: false,
    })).toEqual({ height: 852, offsetTop: 0 })
  })

  it('follows the visual viewport while the standalone keyboard is open', () => {
    expect(appViewportGeometry({
      innerHeight: 852,
      visualHeight: 510,
      visualOffsetTop: 42,
      standalone: true,
      keyboardOpen: true,
    })).toEqual({ height: 510, offsetTop: 42 })
  })

  it('keeps following Safari and split-size visual viewports', () => {
    expect(appViewportGeometry({
      innerHeight: 852,
      visualHeight: 700,
      visualOffsetTop: 18,
      standalone: false,
      keyboardOpen: false,
    })).toEqual({ height: 700, offsetTop: 18 })
  })

  it('detects the keyboard when iOS shrinks both reported heights', () => {
    expect(appKeyboardOpen({
      editorFocused: true,
      wasOpen: false,
      baselineHeight: 852,
      viewportHeight: 510,
      viewportOffsetTop: 42,
    })).toBe(true)
    expect(appKeyboardOpen({
      editorFocused: true,
      wasOpen: false,
      baselineHeight: 852,
      viewportHeight: 852,
      viewportOffsetTop: 0,
    })).toBe(false)
  })

  it('retains keyboard mode across the focus gap between editors', () => {
    expect(appKeyboardOpen({
      editorFocused: false,
      wasOpen: true,
      baselineHeight: 852,
      viewportHeight: 510,
      viewportOffsetTop: 10,
    })).toBe(true)
    expect(appKeyboardOpen({
      editorFocused: false,
      wasOpen: true,
      baselineHeight: 852,
      viewportHeight: 852,
      viewportOffsetTop: 0,
    })).toBe(false)
  })
})
