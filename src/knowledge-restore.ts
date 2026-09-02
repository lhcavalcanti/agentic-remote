import type { KnowledgePosition } from './knowledge-position'

export type { KnowledgePosition }

/**
 * What the panel is showing, and what it has been asked to show. This is the
 * whole input to the restore decision: keeping it in one plain object is what
 * makes the decision testable, rather than something only reachable by
 * driving the entire app with mocked timing.
 */
export interface KnowledgeRestoreState {
  /** The session the panel belongs to, if one is selected. */
  selectedKey?: string
  panelOpen: boolean
  /** Roots have loaded, so a remembered root can be recognised. */
  rootsLoaded: boolean
  /** Where this session was last reading. */
  remembered?: KnowledgePosition
  /** The remembered root still exists. */
  rememberedRootExists: boolean
  /** The session already handled in this episode. */
  restoredKey?: string
  /**
   * The session whose content the reader is actually showing. A cancelled
   * restore can leave another session's root, folder, or document on screen,
   * and being marked handled is not enough to make that right.
   */
  viewOwner?: string
  /** The session whose restore is still running. */
  runningKey?: string
}

/**
 * `cancel` abandons a restore that no longer belongs to the selected session.
 * `settle` records the session as restored without loading anything.
 * `restore` cancels whatever is running and loads the remembered position.
 */
/**
 * `reset` ends an episode: the panel is closed, so anything running is
 * abandoned and the session stops counting as handled, which is what lets a
 * failed restore be retried when the panel is reopened.
 * `cancel` abandons a restore that no longer belongs to the selected session.
 * `settle` records the session as handled without loading anything.
 * `restore` cancels whatever is running and loads the remembered position.
 */
export type KnowledgeRestoreAction =
  | { kind: 'none' }
  | { kind: 'reset' }
  | { kind: 'cancel' }
  | { kind: 'settle' }
  | { kind: 'cancel-and-settle' }
  | { kind: 'restore'; position: KnowledgePosition; key: string }

/**
 * Decides what the panel owes the selected session.
 *
 * The panel restores at most once per episode, an episode being the stretch
 * during which one session stays selected with the panel open. That single
 * rule is what keeps the reader in charge: once a session has been handled —
 * whether the restore succeeded, failed, or was superseded by the reader
 * opening something else — nothing reopens the remembered document over it.
 * Closing the panel ends the episode, so reopening retries a failure.
 */
export function knowledgeRestoreAction(
  state: KnowledgeRestoreState,
): KnowledgeRestoreAction {
  const foreignRestore = Boolean(
    state.runningKey && state.runningKey !== state.selectedKey,
  )

  // A closed panel ends the episode. Anything still running is abandoned, or
  // it lands on whatever is selected next.
  if (!state.panelOpen) {
    return state.runningKey || state.restoredKey
      ? { kind: 'reset' }
      : { kind: 'none' }
  }

  if (!state.selectedKey || !state.rootsLoaded) {
    return foreignRestore ? { kind: 'cancel' } : { kind: 'none' }
  }

  // Already handled in this episode, and showing this session's own content:
  // the reader is in charge from here.
  if (
    state.restoredKey === state.selectedKey &&
    state.viewOwner === state.selectedKey
  ) {
    return foreignRestore ? { kind: 'cancel' } : { kind: 'none' }
  }

  const restorable =
    Boolean(state.remembered?.rootId) && state.rememberedRootExists

  if (!restorable) {
    // Nothing to restore, and nothing may be cancelled: adding the first root
    // starts its own listing, which cancelling here would discard.
    return foreignRestore
      ? { kind: 'cancel-and-settle' }
      : { kind: 'settle' }
  }

  // A restore already running for this session is left alone, or every render
  // would restart it and it would never finish.
  if (state.runningKey === state.selectedKey) {
    return { kind: 'none' }
  }

  return {
    kind: 'restore',
    position: state.remembered as KnowledgePosition,
    key: state.selectedKey,
  }
}
