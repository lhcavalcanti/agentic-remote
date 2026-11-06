// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  attentionCount,
  shellDeepLink,
  shellPlatform,
  nativeShell,
  shellVersion,
  onShellDeepLink,
  onShellNotificationReply,
  openShellSettings,
  parseShellDeepLink,
  resetShellBadge,
  sendShellNotification,
  setShellBadge,
  shellSettingsAvailable,
  withdrawShellNotifications,
} from './shell'

function installBridge(bridge: unknown): void {
  Object.defineProperty(window, '__AGENTIC_SHELL__', {
    value: bridge,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  Reflect.deleteProperty(window, '__AGENTIC_SHELL__')
  resetShellBadge()
})

describe('nativeShell', () => {
  it('reports false in a plain browser', () => {
    expect(nativeShell()).toBe(false)
  })

  it('reports true once the shell injects its bridge', () => {
    installBridge({})
    expect(nativeShell()).toBe(true)
  })

  it('ignores a non-object bridge', () => {
    installBridge('yes')
    expect(nativeShell()).toBe(false)
  })

  it('ignores a null bridge', () => {
    installBridge(null)
    expect(nativeShell()).toBe(false)
  })
})

describe('shell identity', () => {
  it('reads the version and platform the shell reports', () => {
    installBridge({ version: '0.1.0', platform: 'macos' })
    expect(shellVersion()).toBe('0.1.0')
    expect(shellPlatform()).toBe('macos')
  })

  it('treats blank or non-string identity as absent', () => {
    installBridge({ version: '   ', platform: 7 })
    expect(shellVersion()).toBeUndefined()
    expect(shellPlatform()).toBeUndefined()
  })

  it('returns undefined without a shell', () => {
    expect(shellVersion()).toBeUndefined()
    expect(shellPlatform()).toBeUndefined()
  })
})

describe('attentionCount', () => {
  it('counts pending permissions, questions, and waiting sessions once each', () => {
    expect(
      attentionCount([
        { status: 'running' },
        { status: 'idle', pendingPermission: { id: 'p' } },
        { status: 'idle', pendingUserInput: { id: 'q' } },
        { status: 'waiting' },
        { status: 'error' },
      ]),
    ).toBe(3)
  })

  it('does not double-count a session that is both waiting and pending', () => {
    expect(
      attentionCount([{ status: 'waiting', pendingPermission: { id: 'p' } }]),
    ).toBe(1)
  })

  it('counts queue waiting and delivery errors', () => {
    expect(attentionCount([
      { status: 'idle', queueState: { state: 'waiting' } },
      { status: 'idle', queueState: { state: 'error' } },
    ])).toBe(2)
  })

  it('is zero for no sessions', () => {
    expect(attentionCount([])).toBe(0)
  })
})

describe('setShellBadge', () => {
  it('does nothing without a shell', () => {
    expect(() => setShellBadge(3)).not.toThrow()
  })

  it('forwards the count', () => {
    const setBadge = vi.fn()
    installBridge({ setBadge })
    setShellBadge(4)
    expect(setBadge).toHaveBeenCalledWith(4)
  })

  it('coalesces repeated identical counts', () => {
    const setBadge = vi.fn()
    installBridge({ setBadge })
    setShellBadge(2)
    setShellBadge(2)
    setShellBadge(3)
    expect(setBadge.mock.calls).toEqual([[2], [3]])
  })

  it('normalizes negative, fractional, and non-finite counts', () => {
    const setBadge = vi.fn()
    installBridge({ setBadge })
    setShellBadge(-5)
    setShellBadge(2.7)
    resetShellBadge()
    setShellBadge(Number.NaN)
    expect(setBadge.mock.calls).toEqual([[0], [2], [0]])
  })

  it('survives a shell that throws', () => {
    installBridge({
      setBadge: () => {
        throw new Error('no dock')
      },
    })
    expect(() => setShellBadge(1)).not.toThrow()
  })
})

describe('sendShellNotification', () => {
  const notification = {
    tag: 'agentic-question-c1-s1',
    title: 'development · Fix login',
    body: 'Needs an answer',
    urgent: true,
    actions: [{ id: 'yes', title: 'Yes' }],
  }

  it('reports false without a shell so the caller falls back to Web Push', () => {
    expect(sendShellNotification(notification)).toBe(false)
  })

  it('reports false when the shell predates notification support', () => {
    installBridge({ setBadge: vi.fn() })
    expect(sendShellNotification(notification)).toBe(false)
  })

  it('forwards the notification and reports success', () => {
    const notify = vi.fn()
    installBridge({ notify })
    expect(sendShellNotification(notification)).toBe(true)
    expect(notify).toHaveBeenCalledWith(notification)
  })

  it('reports false when the shell throws', () => {
    installBridge({
      notify: () => {
        throw new Error('denied')
      },
    })
    expect(sendShellNotification(notification)).toBe(false)
  })
})

describe('withdrawShellNotifications', () => {
  it('forwards a copy of the tags', () => {
    const withdrawNotifications = vi.fn()
    installBridge({ withdrawNotifications })
    const tags = ['a', 'b']
    withdrawShellNotifications(tags)
    expect(withdrawNotifications).toHaveBeenCalledWith(['a', 'b'])
    expect(withdrawNotifications.mock.calls[0]?.[0]).not.toBe(tags)
  })

  it('skips an empty list and a missing shell', () => {
    const withdrawNotifications = vi.fn()
    installBridge({ withdrawNotifications })
    withdrawShellNotifications([])
    expect(withdrawNotifications).not.toHaveBeenCalled()
  })

  it('survives a shell that throws', () => {
    installBridge({
      withdrawNotifications: () => {
        throw new Error('gone')
      },
    })
    expect(() => withdrawShellNotifications(['a'])).not.toThrow()
  })
})

describe('onShellNotificationReply', () => {
  it('returns an inert unsubscribe without a shell', () => {
    const stop = onShellNotificationReply(() => undefined)
    expect(() => stop()).not.toThrow()
  })

  it('delivers well-formed replies and ignores malformed ones', () => {
    let emit: ((reply: unknown) => void) | undefined
    installBridge({
      onNotificationReply: (handler: (reply: unknown) => void) => {
        emit = handler
        return () => undefined
      },
    })
    const handler = vi.fn()
    onShellNotificationReply(handler)
    emit?.({ tag: 'agentic-permission-c1-s1', actionId: 'allow' })
    emit?.({ tag: 'agentic-permission-c1-s1' })
    emit?.(undefined)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      tag: 'agentic-permission-c1-s1',
      actionId: 'allow',
    })
  })

  it('invokes the release function returned by the shell', () => {
    const release = vi.fn()
    installBridge({ onNotificationReply: () => release })
    onShellNotificationReply(() => undefined)()
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('tolerates a shell that returns nothing to unsubscribe with', () => {
    installBridge({ onNotificationReply: () => undefined })
    expect(() => onShellNotificationReply(() => undefined)()).not.toThrow()
  })

  it('tolerates a shell that throws while subscribing', () => {
    installBridge({
      onNotificationReply: () => {
        throw new Error('nope')
      },
    })
    expect(() => onShellNotificationReply(() => undefined)()).not.toThrow()
  })
})

describe('onShellDeepLink', () => {
  it('delivers parsed targets and drops unparseable links', () => {
    let emit: ((url: string) => void) | undefined
    installBridge({
      onDeepLink: (handler: (url: string) => void) => {
        emit = handler
        return () => undefined
      },
    })
    const handler = vi.fn()
    onShellDeepLink(handler)
    emit?.('agentic://computer/dev/session/abc')
    emit?.('https://example.com')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({
      computerId: 'dev',
      sessionId: 'abc',
    })
  })
})

describe('parseShellDeepLink', () => {
  it('parses the canonical form', () => {
    expect(parseShellDeepLink('agentic://computer/dev/session/abc')).toEqual({
      computerId: 'dev',
      sessionId: 'abc',
    })
  })

  it('ignores scheme and keyword casing, whitespace, query, and fragment', () => {
    expect(
      parseShellDeepLink('  AGENTIC://Computer/dev/Session/abc?x=1#y  '),
    ).toEqual({ computerId: 'dev', sessionId: 'abc' })
  })

  it('decodes percent-encoded identifiers', () => {
    expect(
      parseShellDeepLink('agentic://computer/my%20mac/session/a%2Fb'),
    ).toEqual({ computerId: 'my mac', sessionId: 'a/b' })
  })

  it.each([
    ['https://agentic.example/computer/dev/session/abc'],
    ['agentic://computer/dev'],
    ['agentic://computer/dev/session/abc/extra'],
    ['agentic://project/dev/session/abc'],
    ['agentic://computer/dev/chat/abc'],
    ['agentic://computer//session/abc'],
    ['agentic://computer/%E0%A4%A/session/abc'],
    [''],
  ])('rejects %s', (value) => {
    expect(parseShellDeepLink(value)).toBeUndefined()
  })
})

describe('shellDeepLink', () => {
  it('round-trips through the parser', () => {
    const target = { computerId: 'my mac', sessionId: 'a/b' }
    expect(parseShellDeepLink(shellDeepLink(target))).toEqual(target)
  })
})

describe('shell settings', () => {
  it('reports unavailable without a shell or on an older shell', () => {
    expect(shellSettingsAvailable()).toBe(false)
    installBridge({ setBadge: vi.fn() })
    expect(shellSettingsAvailable()).toBe(false)
  })

  it('reports available and forwards the request', () => {
    const openSettings = vi.fn()
    installBridge({ openSettings })
    expect(shellSettingsAvailable()).toBe(true)
    openShellSettings()
    expect(openSettings).toHaveBeenCalledTimes(1)
  })

  it('does nothing without a shell', () => {
    expect(() => openShellSettings()).not.toThrow()
  })

  it('survives a shell that throws', () => {
    installBridge({
      openSettings: () => {
        throw new Error('no settings')
      },
    })
    expect(() => openShellSettings()).not.toThrow()
  })
})
