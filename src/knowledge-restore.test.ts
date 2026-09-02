import { describe, expect, it } from 'vitest'
import {
  knowledgeRestoreAction,
  type KnowledgeRestoreState,
} from './knowledge-restore'

const base: KnowledgeRestoreState = {
  selectedKey: 'computer-1:session-1',
  panelOpen: true,
  rootsLoaded: true,
  remembered: { rootId: 'root-1', path: 'guides', file: 'guides/setup.md' },
  rememberedRootExists: true,
  restoredKey: undefined,
  runningKey: undefined,
  viewOwner: undefined,
}

const state = (overrides: Partial<KnowledgeRestoreState> = {}) => ({
  ...base,
  ...overrides,
})

describe('knowledge restore decision', () => {
  it('restores a remembered position', () => {
    expect(knowledgeRestoreAction(state())).toEqual({
      kind: 'restore',
      position: base.remembered,
      key: 'computer-1:session-1',
    })
  })

  it('waits for a session and for roots', () => {
    expect(knowledgeRestoreAction(state({ selectedKey: undefined }))).toEqual({
      kind: 'none',
    })
    expect(knowledgeRestoreAction(state({ rootsLoaded: false }))).toEqual({
      kind: 'none',
    })
  })

  it('settles a session with nothing to restore', () => {
    expect(knowledgeRestoreAction(state({ remembered: undefined }))).toEqual({
      kind: 'settle',
    })
    expect(
      knowledgeRestoreAction(state({ rememberedRootExists: false })),
    ).toEqual({ kind: 'settle' })
  })

  it('never cancels for a session with nothing to restore', () => {
    // Adding the first root starts its own listing. Cancelling here discarded
    // it, and the tree stayed empty until the root was picked again by hand.
    expect(
      knowledgeRestoreAction(state({ remembered: undefined })),
    ).toEqual({ kind: 'settle' })
  })

  it('restores at most once per episode', () => {
    // Once handled, the reader is in charge: opening something else must not
    // be undone by the remembered document arriving late.
    expect(
      knowledgeRestoreAction(
        state({
          restoredKey: 'computer-1:session-1',
          viewOwner: 'computer-1:session-1',
        }),
      ),
    ).toEqual({ kind: 'none' })
  })

  it('ends the episode when the panel closes, so a failure can be retried', () => {
    expect(
      knowledgeRestoreAction(
        state({ panelOpen: false, restoredKey: 'computer-1:session-1' }),
      ),
    ).toEqual({ kind: 'reset' })
    // Reopening then restores again.
    expect(knowledgeRestoreAction(state())).toMatchObject({ kind: 'restore' })
  })

  it('abandons a restore stranded by closing the panel', () => {
    expect(
      knowledgeRestoreAction(
        state({ panelOpen: false, runningKey: 'computer-1:session-1' }),
      ),
    ).toEqual({ kind: 'reset' })
  })

  it('does nothing for a closed panel with no episode to end', () => {
    expect(knowledgeRestoreAction(state({ panelOpen: false }))).toEqual({
      kind: 'none',
    })
  })

  it('abandons a restore that belongs to another session', () => {
    // Returning to A while B is still restoring: B must be abandoned before
    // any shortcut returns, or it writes its document into A.
    expect(
      knowledgeRestoreAction(
        state({
          runningKey: 'computer-1:session-2',
          restoredKey: 'computer-1:session-1',
          viewOwner: 'computer-1:session-1',
        }),
      ),
    ).toEqual({ kind: 'cancel' })

    expect(
      knowledgeRestoreAction(
        state({ runningKey: 'computer-1:session-2', remembered: undefined }),
      ),
    ).toEqual({ kind: 'cancel-and-settle' })

    expect(
      knowledgeRestoreAction(
        state({ runningKey: 'computer-1:session-2' }),
      ),
    ).toMatchObject({ kind: 'restore' })
  })

  it('leaves its own running restore alone', () => {
    // Restarting on every render would mean it never finishes.
    expect(
      knowledgeRestoreAction(state({ runningKey: 'computer-1:session-1' })),
    ).toEqual({ kind: 'none' })
  })

  it('restores again for a different session', () => {
    expect(
      knowledgeRestoreAction(state({ restoredKey: 'computer-1:session-9' })),
    ).toMatchObject({ kind: 'restore', key: 'computer-1:session-1' })
  })

  it('restores again when the view belongs to another session', () => {
    // A cancelled foreign restore can leave its own root and folder on
    // screen. Being marked handled is not enough: the reader would otherwise
    // sit on another session's content and record it as this one's position.
    expect(
      knowledgeRestoreAction(
        state({
          restoredKey: 'computer-1:session-1',
          viewOwner: 'computer-1:session-2',
        }),
      ),
    ).toMatchObject({ kind: 'restore', key: 'computer-1:session-1' })
  })

  it('reaches a fixed point, so the effect cannot loop', () => {
    // Every action, once applied, must leave the decision asking for nothing.
    const apply = (
      current: KnowledgeRestoreState,
      action: ReturnType<typeof knowledgeRestoreAction>,
    ): KnowledgeRestoreState => {
      switch (action.kind) {
        case 'reset':
          return { ...current, runningKey: undefined, restoredKey: undefined }
        case 'cancel':
          return { ...current, runningKey: undefined }
        case 'settle':
          return {
            ...current,
            restoredKey: current.selectedKey,
            viewOwner: current.selectedKey,
          }
        case 'cancel-and-settle':
          return {
            ...current,
            runningKey: undefined,
            restoredKey: current.selectedKey,
            viewOwner: current.selectedKey,
          }
        case 'restore':
          // The restore runs, then completes: the session is handled and the
          // view is now its own.
          return {
            ...current,
            runningKey: undefined,
            restoredKey: action.key,
            viewOwner: action.key,
          }
        default:
          return current
      }
    }

    for (const panelOpen of [true, false]) {
      for (const rootsLoaded of [true, false]) {
        for (const remembered of [undefined, base.remembered]) {
          for (const rememberedRootExists of [true, false]) {
            for (const restoredKey of [
              undefined,
              'computer-1:session-1',
              'computer-1:session-2',
            ]) {
              for (const runningKey of [
                undefined,
                'computer-1:session-1',
                'computer-1:session-2',
              ]) {
                for (const viewOwner of [
                  undefined,
                  'computer-1:session-1',
                  'computer-1:session-2',
                ]) {
                let current = state({
                  panelOpen,
                  rootsLoaded,
                  remembered,
                  rememberedRootExists,
                  restoredKey,
                  runningKey,
                  viewOwner,
                })
                // Applying decisions must converge rather than oscillate.
                let steps = 0
                let action = knowledgeRestoreAction(current)
                while (action.kind !== 'none' && steps < 6) {
                  current = apply(current, action)
                  action = knowledgeRestoreAction(current)
                  steps += 1
                }
                expect(action).toEqual({ kind: 'none' })
                }
              }
            }
          }
        }
      }
    }
  })

  it('never restores without a session, roots, and an open panel', () => {
    for (const selectedKey of [undefined, 'computer-1:session-1']) {
      for (const panelOpen of [false, true]) {
        for (const rootsLoaded of [false, true]) {
          for (const runningKey of [
            undefined,
            'computer-1:session-1',
            'computer-1:session-2',
          ]) {
            const action = knowledgeRestoreAction(
              state({ selectedKey, panelOpen, rootsLoaded, runningKey }),
            )
            if (action.kind === 'restore') {
              expect(selectedKey).toBeDefined()
              expect(panelOpen).toBe(true)
              expect(rootsLoaded).toBe(true)
            }
            // A restore belonging to another session is never left running.
            if (runningKey === 'computer-1:session-2' && panelOpen) {
              expect(action.kind).not.toBe('none')
            }
          }
        }
      }
    }
  })
})
