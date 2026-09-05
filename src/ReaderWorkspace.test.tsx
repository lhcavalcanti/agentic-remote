// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReaderWorkspace from './ReaderWorkspace'

const WIDTH_KEY = 'agentic-remote:reader-width'
let workspaceWidth: number
let notifyResize: () => void
const disconnect = vi.fn()

function workspace(mode: 'hidden' | 'docked' | 'expanded' = 'docked') {
  return (
    <ReaderWorkspace mode={mode}>
      <main>Conversation</main>
      <aside id="knowledge-panel">Markdown reader</aside>
    </ReaderWorkspace>
  )
}

function handle() {
  return screen.getByRole('separator', { name: 'Resize reader' })
}

function pointer(
  element: HTMLElement,
  type: string,
  clientX: number,
  pointerId = 1,
  button = 0,
) {
  element.dispatchEvent(new PointerEvent(type, {
    bubbles: true,
    clientX,
    pointerId,
    button,
  }))
}

function mockCapture(element: HTMLElement) {
  const captured = new Set<number>()
  const set = vi.fn((id: number) => { captured.add(id) })
  const release = vi.fn((id: number) => { captured.delete(id) })
  Object.assign(element, {
    setPointerCapture: set,
    hasPointerCapture: (id: number) => captured.has(id),
    releasePointerCapture: release,
  })
  return { set, release }
}

beforeEach(() => {
  localStorage.clear()
  workspaceWidth = 1200
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ width: workspaceWidth } as DOMRect),
  )
  disconnect.mockClear()
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { notifyResize = callback }
    observe() {}
    disconnect = disconnect
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('reader resizing', () => {
  it('balances reading and conversation by default and exposes bounded controls', () => {
    render(workspace())
    expect(handle()).toHaveAttribute('aria-valuenow', '600')
    expect(handle()).toHaveAttribute('aria-valuemin', '320')
    expect(handle()).toHaveAttribute('aria-valuemax', '840')
    expect(handle()).toHaveAttribute('aria-orientation', 'vertical')
    expect(handle()).toHaveAttribute('aria-controls', 'knowledge-panel')
    expect(handle()).toHaveAttribute('tabindex', '0')
    expect(document.querySelector('.workspace')).toHaveStyle('--knowledge-width: 600px')
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
  })

  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])(
    'keeps the responsive default after %s without an effective resize',
    (ending) => {
      render(workspace())
      const resizer = handle()
      const capture = mockCapture(resizer)
      act(() => {
        pointer(resizer, 'pointerdown', 800)
        pointer(resizer, ending, 800)
      })
      expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
      expect(capture.release).toHaveBeenCalledWith(1)
      expect(resizer).toHaveAttribute('data-resizing', 'false')
      workspaceWidth = 1500
      act(() => notifyResize())
      expect(resizer).toHaveAttribute('aria-valuenow', '750')
    },
  )

  it('restores responsive mode after dragging away and back to the original width', () => {
    render(workspace())
    const resizer = handle()
    act(() => {
      pointer(resizer, 'pointerdown', 800)
      pointer(resizer, 'pointermove', 700)
      pointer(resizer, 'pointerup', 800)
    })
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
    workspaceWidth = 1500
    act(() => notifyResize())
    expect(resizer).toHaveAttribute('aria-valuenow', '750')
  })

  it('retains a larger saved preference after a click while the viewport clamps it', () => {
    localStorage.setItem(WIDTH_KEY, '800')
    workspaceWidth = 900
    render(workspace())
    const resizer = handle()
    expect(resizer).toHaveAttribute('aria-valuenow', '540')
    act(() => {
      pointer(resizer, 'pointerdown', 800)
      pointer(resizer, 'pointerup', 800)
    })
    expect(localStorage.getItem(WIDTH_KEY)).toBe('800')
    workspaceWidth = 1400
    act(() => notifyResize())
    expect(resizer).toHaveAttribute('aria-valuenow', '800')
  })

  it('preserves a saved preference when bounds narrow during a stationary gesture', () => {
    localStorage.setItem(WIDTH_KEY, '800')
    render(workspace())
    const resizer = handle()
    act(() => pointer(resizer, 'pointerdown', 800))
    workspaceWidth = 900
    act(() => notifyResize())
    expect(resizer).toHaveAttribute('aria-valuenow', '540')
    act(() => pointer(resizer, 'pointerup', 800))
    expect(localStorage.getItem(WIDTH_KEY)).toBe('800')
    workspaceWidth = 1400
    act(() => notifyResize())
    expect(resizer).toHaveAttribute('aria-valuenow', '800')
  })

  it('keeps the responsive default when bounds change without pointer movement', () => {
    render(workspace())
    const resizer = handle()
    act(() => pointer(resizer, 'pointerdown', 800))
    workspaceWidth = 640
    act(() => notifyResize())
    act(() => pointer(resizer, 'pointerup', 800))
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
    workspaceWidth = 1200
    act(() => notifyResize())
    expect(resizer).toHaveAttribute('aria-valuenow', '600')
  })

  it('keeps the original preference when a drag returns to its origin after a bounds change', () => {
    render(workspace())
    const resizer = handle()
    act(() => {
      pointer(resizer, 'pointerdown', 800)
      pointer(resizer, 'pointermove', 700)
    })
    workspaceWidth = 900
    act(() => notifyResize())
    act(() => pointer(resizer, 'pointerup', 800))
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
    expect(resizer).toHaveAttribute('aria-valuenow', '450')
  })

  it('does not freeze the responsive default for a keyboard step blocked by a limit', () => {
    workspaceWidth = 640
    render(workspace())
    fireEvent.keyDown(handle(), { key: 'ArrowRight' })
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
    workspaceWidth = 1200
    act(() => notifyResize())
    expect(handle()).toHaveAttribute('aria-valuenow', '600')
  })

  it('captures a leftward drag and persists its final position even with batched events', () => {
    const rendered = render(workspace())
    const resizer = handle()
    const capture = mockCapture(resizer)
    act(() => pointer(resizer, 'pointerdown', 800))
    expect(capture.set).toHaveBeenCalledWith(1)
    expect(resizer).toHaveAttribute('data-resizing', 'true')
    act(() => {
      pointer(resizer, 'pointermove', 760)
      pointer(resizer, 'pointerup', 720)
    })
    expect(resizer).toHaveAttribute('aria-valuenow', '680')
    expect(resizer).toHaveAttribute('data-resizing', 'false')
    expect(localStorage.getItem(WIDTH_KEY)).toBe('680')
    expect(capture.release).toHaveBeenCalledWith(1)
    rendered.unmount()
    render(workspace())
    expect(handle()).toHaveAttribute('aria-valuenow', '680')
  })

  it.each(['pointercancel', 'lostpointercapture'])(
    'finishes %s using the last move rather than the cancellation coordinates',
    (event) => {
      render(workspace())
      const resizer = handle()
      const capture = mockCapture(resizer)
      act(() => {
        pointer(resizer, 'pointerdown', 800)
        pointer(resizer, 'pointermove', 700)
        pointer(resizer, event, 0)
        pointer(resizer, 'pointermove', 500)
      })
      expect(resizer).toHaveAttribute('aria-valuenow', '700')
      expect(resizer).toHaveAttribute('data-resizing', 'false')
      expect(localStorage.getItem(WIDTH_KEY)).toBe('700')
      expect(capture.release).toHaveBeenCalledTimes(1)
    },
  )

  it('ignores secondary buttons and unrelated pointers during a drag', () => {
    render(workspace())
    const resizer = handle()
    act(() => {
      pointer(resizer, 'pointerdown', 800, 1, 2)
      pointer(resizer, 'pointermove', 700)
      pointer(resizer, 'pointerup', 700)
    })
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
    act(() => {
      pointer(resizer, 'pointerdown', 800)
      pointer(resizer, 'pointerdown', 800, 2)
      pointer(resizer, 'pointermove', 500, 2)
      pointer(resizer, 'pointercancel', 0, 2)
    })
    expect(resizer).toHaveAttribute('aria-valuenow', '600')
    expect(resizer).toHaveAttribute('data-resizing', 'true')
    act(() => pointer(resizer, 'pointerup', 780))
    expect(localStorage.getItem(WIDTH_KEY)).toBe('620')
  })

  it('supports reversed arrow-key direction, Shift steps, limits, and Home reset', () => {
    render(workspace())
    const resizer = handle()
    fireEvent.keyDown(resizer, { key: 'ArrowLeft' })
    expect(localStorage.getItem(WIDTH_KEY)).toBe('608')
    fireEvent.keyDown(resizer, { key: 'ArrowRight', shiftKey: true })
    expect(localStorage.getItem(WIDTH_KEY)).toBe('576')
    for (let index = 0; index < 20; index++) {
      fireEvent.keyDown(resizer, { key: 'ArrowLeft', shiftKey: true })
    }
    expect(resizer).toHaveAttribute('aria-valuenow', '840')
    for (let index = 0; index < 20; index++) {
      fireEvent.keyDown(resizer, { key: 'ArrowRight', shiftKey: true })
    }
    expect(resizer).toHaveAttribute('aria-valuenow', '320')
    fireEvent.keyDown(resizer, { key: 'Home' })
    expect(resizer).toHaveAttribute('aria-valuenow', '600')
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
  })

  it('bounds pointer resizing and resets to a responsive default on double-click', () => {
    workspaceWidth = 1600
    render(workspace())
    const resizer = handle()
    act(() => {
      pointer(resizer, 'pointerdown', 1000)
      pointer(resizer, 'pointerup', -5000)
    })
    expect(resizer).toHaveAttribute('aria-valuenow', '960')
    act(() => {
      pointer(resizer, 'pointerdown', 1000)
      pointer(resizer, 'pointerup', 5000)
    })
    expect(resizer).toHaveAttribute('aria-valuenow', '320')
    fireEvent.doubleClick(resizer)
    expect(resizer).toHaveAttribute('aria-valuenow', '800')
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull()
    workspaceWidth = 1800
    act(() => notifyResize())
    expect(resizer).toHaveAttribute('aria-valuenow', '900')
  })

  it('protects chat when the window or sidebar changes without overwriting the preference', () => {
    localStorage.setItem(WIDTH_KEY, '800')
    render(workspace())
    expect(handle()).toHaveAttribute('aria-valuenow', '800')
    workspaceWidth = 900
    act(() => notifyResize())
    expect(handle()).toHaveAttribute('aria-valuemax', '540')
    expect(handle()).toHaveAttribute('aria-valuenow', '540')
    workspaceWidth = 500
    fireEvent.resize(window)
    expect(handle()).toHaveAttribute('aria-valuemin', '250')
    expect(handle()).toHaveAttribute('aria-valuemax', '250')
    expect(handle()).toHaveAttribute('aria-valuenow', '250')
    expect(localStorage.getItem(WIDTH_KEY)).toBe('800')
    workspaceWidth = 1400
    act(() => notifyResize())
    expect(handle()).toHaveAttribute('aria-valuenow', '800')
  })

  it('preserves the dock width through expanded and hidden modes, releasing active capture', () => {
    const rendered = render(workspace())
    const resizer = handle()
    const capture = mockCapture(resizer)
    act(() => {
      pointer(resizer, 'pointerdown', 800)
      pointer(resizer, 'pointermove', 700)
    })
    rendered.rerender(workspace('expanded'))
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    expect(capture.release).toHaveBeenCalledWith(1)
    expect(localStorage.getItem(WIDTH_KEY)).toBe('700')
    rendered.rerender(workspace('hidden'))
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
    rendered.rerender(workspace())
    expect(handle()).toHaveAttribute('aria-valuenow', '700')
    expect(handle()).toHaveAttribute('data-resizing', 'false')
  })

  it.each(['garbage', 'Infinity', '0', '-100'])(
    'uses the responsive default for invalid stored width %s',
    (stored) => {
      localStorage.setItem(WIDTH_KEY, stored)
      render(workspace())
      expect(handle()).toHaveAttribute('aria-valuenow', '600')
    },
  )

  it.each([['99999', '840'], ['10', '320']])(
    'bounds stored width %s',
    (stored, expected) => {
      localStorage.setItem(WIDTH_KEY, stored)
      render(workspace())
      expect(handle()).toHaveAttribute('aria-valuenow', expected)
    },
  )

  it('resizes without storage or ResizeObserver and cleans up on unmount', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked') })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw Error('blocked') })
    const rendered = render(workspace())
    const resizer = handle()
    fireEvent.keyDown(resizer, { key: 'ArrowLeft' })
    expect(resizer).toHaveAttribute('aria-valuenow', '608')
    fireEvent.doubleClick(resizer)
    expect(resizer).toHaveAttribute('aria-valuenow', '600')
    const capture = mockCapture(resizer)
    act(() => {
      pointer(resizer, 'pointerdown', 800)
      pointer(resizer, 'pointermove', 700)
    })
    rendered.unmount()
    expect(capture.release).toHaveBeenCalledWith(1)
  })
})
