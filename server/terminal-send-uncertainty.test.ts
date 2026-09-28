import { afterEach, describe, expect, it, vi } from 'vitest'
import { TmuxTerminalSessionController } from './terminal-session.js'

const processAdapter = vi.hoisted(() => ({ run: vi.fn() }))
vi.mock('node:child_process', () => {
  const execFile = vi.fn()
  Object.defineProperty(execFile, Symbol.for('nodejs.util.promisify.custom'), { value: processAdapter.run })
  return { execFile }
})

const text = 'Keep possible native input'
const composer = (draft = '') => `╻▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n┃ ${draft}\n╹▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\n / commands\n`

afterEach(() => {
  vi.restoreAllMocks()
  processAdapter.run.mockReset()
})

describe('Native send effect classification', () => {
  it.each([
    { failureAt: 'preflight capture', uncertain: false },
    { failureAt: 'set-buffer', uncertain: false },
    { failureAt: 'paste spawn', uncertain: false },
    { failureAt: 'paste acknowledgement', uncertain: true },
    { failureAt: 'post-paste capture', uncertain: true },
    { failureAt: 'post-paste capture spawn', uncertain: true },
    { failureAt: 'Enter acknowledgement', uncertain: true },
    { failureAt: 'terminal settings restoration', uncertain: true },
  ])('classifies $failureAt without inventing confirmed delivery', async ({ failureAt, uncertain }) => {
    const controller = new TmuxTerminalSessionController()
    const owner = { pid: 1234, target: '%owned', rootPid: 1234 }
    vi.spyOn(controller as unknown as {
      owner(id: string): Promise<typeof owner>
    }, 'owner').mockResolvedValue(owner)
    controller['inputReadySessions'].set('owned', owner)
    let pasted = false
    let submits = 0
    const failure = Object.assign(new Error(`Synthetic ${failureAt} failure`),
      ['paste spawn', 'post-paste capture spawn'].includes(failureAt)
        ? { code: 'ENOENT', syscall: 'spawn tmux' } : { code: 73 })
    const output = (stdout = '') => ({ stdout, stderr: '' })
    processAdapter.run.mockImplementation(async (file: string, args: string[]) => {
      if (file === 'stty') {
        if (args.includes('-a')) return output('ixon')
        if (args.at(-1) === 'ixon' && failureAt === 'terminal settings restoration') throw failure
        return output()
      }
      expect(file).toBe('tmux')
      if (args[0] === 'capture-pane') {
        if ((!pasted && failureAt === 'preflight capture') ||
            (pasted && ['post-paste capture', 'post-paste capture spawn'].includes(failureAt))) throw failure
        return output(composer(pasted ? text : ''))
      }
      if (args[0] === 'set-buffer') {
        if (failureAt === 'set-buffer') throw failure
        return output()
      }
      if (args[0] === 'paste-buffer') {
        if (failureAt === 'paste spawn') throw failure
        pasted = true
        if (failureAt === 'paste acknowledgement') throw failure
        return output()
      }
      if (args[0] === 'display-message') return output('/dev/pts/synthetic')
      if (args[0] === 'send-keys') {
        submits += 1
        if (failureAt === 'Enter acknowledgement') throw failure
        return output()
      }
      throw new Error(`Unexpected native operation: ${file} ${args.join(' ')}`)
    })
    const result = await controller.send('owned', text, failureAt === 'terminal settings restoration')
      .then((value) => ({ value }), (error: unknown) => ({ error }))
    if (uncertain) {
      expect(result).toMatchObject({ error: { statusCode: 409, uncertainDelivery: true, cause: failure } })
    } else {
      expect(result).toEqual({ error: failure })
    }
    expect(pasted).toBe(uncertain)
    expect(submits).toBe(['Enter acknowledgement', 'terminal settings restoration'].includes(failureAt) ? 1 : 0)
    expect(controller.sending('owned')).toBe(false)
  })

  it('returns false without effects when the owner is gone before sending', async () => {
    const controller = new TmuxTerminalSessionController()
    vi.spyOn(controller as unknown as {
      owner(id: string): Promise<{ pid: number; target: string } | undefined>
    }, 'owner')
      .mockResolvedValue(undefined)
    await expect(controller.send('missing', text, false)).resolves.toBe(false)
    expect(processAdapter.run).not.toHaveBeenCalled()
    expect(controller.sending('missing')).toBe(false)
  })
})
