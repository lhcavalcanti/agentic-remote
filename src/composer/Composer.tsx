import { Pencil, X } from 'lucide-react'
import { SIDE_QUESTION_MAX_LENGTH } from '../../shared/side-question'
import { AttachmentStrip } from './AttachmentStrip'
import { ComposerActions } from './ComposerActions'
import { HeldMessageList } from './HeldMessageList'
import { QueuedPromptList } from './QueuedPromptList'
import { SlashCommandMenu } from './SlashCommandMenu'
import type { ComposerProps } from './types'

export function Composer(props: ComposerProps) {
  const {
    selected,
    selectedRetained,
    queueActionId,
    sending,
    editingQueuedPromptId,
    queuedEditUnconfirmed,
    composer,
    uploadingFile,
    transcribing,
    supportsQueuedPromptDispatch,
    deliveryUncertain,
    composerStorageError,
    acceptanceReceiptMissing,
    missingAcceptanceOwners,
    askingAside,
    sideQuestionPanel,
    sideQuestionDraft,
    sideQuestionPending,
    selectedQueueAvailable,
    showCommandMenu,
    selectedAttachments,
    recording,
    dictation,
    composerDraftRecovered,
    phoneEnterCreatesNewline,
    composerRef,
    audioInputRef,
    onDiscardUnconfirmed,
    onSaveQueuedPromptEdit,
    onCancelQueuedPromptEdit,
    onDragOver,
    onDrop,
    onBeforeInput,
    onCut,
    onChange,
    onKeyDown,
    onPaste,
    onFileChange,
    startingSession,
    heldQueue,
    onEditHeldMessage,
    onRemoveHeldMessage,
    onRetryHeldMessages,
  } = props
  // The line below the composer only explains a live state or mode; an idle
  // composer keeps no line. Send and Queue name their shortcuts in tooltips.
  // Recording has none either, whatever else applies: its panel is the status
  // and shows the timer, and it hides the buttons the other lines name.
  // Dictation shows its status beside its own controls.
  const stateLine = recording || dictation
    ? null
    : askingAside
      ? (
        <>
          <span className="composer-hint__desktop">
            {sideQuestionPending
              ? 'Answering… you can type your follow-up · Esc back to your message'
              : 'Enter asks · Shift+Enter newline · Esc back to your message'}
          </span>
          <span className="composer-hint__mobile">
            {sideQuestionPending ? 'Answering… you can type your follow-up' : 'Tap Ask · Return adds a line'}
          </span>
        </>
      )
      : transcribing
        ? 'Transcribing audio…'
        : uploadingFile
          ? 'Uploading file…'
          : editingQueuedPromptId
            ? (
              <>
                <span className="composer-hint__desktop">
                  {supportsQueuedPromptDispatch
                    ? 'Enter saves it back · ↑ sends this queued edit now · Esc leaves it as it was'
                    : 'Enter saves it back · Shift+Enter newline · Esc leaves it as it was'}
                </span>
                <span className="composer-hint__mobile">
                  {supportsQueuedPromptDispatch
                    ? 'Save keeps its place · ↑ sends this queued edit now · Return adds a line'
                    : 'Tap Save to put it back · Return adds a line'}
                </span>
              </>
            )
            : null
  return (
    <footer className="composer-area">
      <div className="composer-context">
        {selected.queuedDispatch || queuedEditUnconfirmed ? (
          <div className="queued-edit-banner queued-edit-banner--dispatch" id="queued-dispatch-warning" role="status">
            <span>
              {selected.queuedDispatch?.message ||
                'Queued delivery is pending or unconfirmed. Do not send the rewrite again until you have checked the provider.'}
            </span>
            {selected.queuedDispatch?.state === 'uncertain' ? (
              <button
                className="queued-edit-banner__save"
                disabled={Boolean(queueActionId) || sending || selectedRetained}
                onClick={onDiscardUnconfirmed}
                type="button"
              >
                Discard unconfirmed queue item
              </button>
            ) : null}
          </div>
        ) : null}
        {selected.queueState ? (
          <div
            className={`queued-edit-banner queued-edit-banner--queue-${selected.queueState.state}`}
            role={selected.queueState.state === 'error' ? 'alert' : 'status'}
          >
            <span>{selected.queueState.message}</span>
          </div>
        ) : null}
        {selected.queuedPrompts?.length ? <QueuedPromptList {...props} /> : null}
        {heldQueue && (heldQueue.messages.length > 0 || heldQueue.failure) ? (
          <HeldMessageList
            onEdit={(id) => onEditHeldMessage?.(id)}
            onRemove={(id) => onRemoveHeldMessage?.(id)}
            onRetry={() => onRetryHeldMessages?.()}
            queue={heldQueue}
            starting={Boolean(startingSession)}
          />
        ) : null}
        {editingQueuedPromptId ? (
          <div className="queued-edit-banner">
            <Pencil size={13} />
            <span>
              Editing a queued message.{' '}
              {phoneEnterCreatesNewline ? <strong>Save to queue</strong> : <strong>Enter</strong>}{' '}
              puts it back in the queue without moving it.
              {supportsQueuedPromptDispatch ? ' Send now delivers only this message.' : ''}
            </span>
            <button
              className="queued-edit-banner__save"
              disabled={!composer.trim() || Boolean(queueActionId) || uploadingFile || transcribing ||
                Boolean(selected.queuedDispatch) || queuedEditUnconfirmed}
              onClick={onSaveQueuedPromptEdit}
              title="Put this back in the queue"
              type="button"
            >
              Save to queue
            </button>
            <button
              aria-label="Stop editing this queued message"
              className="icon-button"
              disabled={Boolean(queueActionId)}
              onClick={onCancelQueuedPromptEdit}
              title="Leave it as it was (Escape)"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ) : null}
        {deliveryUncertain && !selected.queuedDispatch && !queuedEditUnconfirmed ? (
          <div className="error-banner" id="composer-delivery-warning" role="status">
            <span>
              Delivery could not be confirmed. Your message was restored; it may
              already have been sent or queued. Check the conversation and queue
              before sending again.
            </span>
          </div>
        ) : null}
        {composerStorageError ? (
          <div className="error-banner" id="composer-storage-warning" role="alert">
            <span>{composerStorageError}</span>
          </div>
        ) : null}
        {acceptanceReceiptMissing ? (
          <div className="error-banner" id="composer-acceptance-warning" role="status">
            <span>
              {missingAcceptanceOwners.length === 1
                ? 'This send was accepted, but the browser has no saved receipt. '
                : 'These sends were accepted, but the browser has no saved receipts. '}
              Affected: {missingAcceptanceOwners.join('; ')}.
              {' '}Keep this tab open. Reloading may restore the submitted text as
              unconfirmed; check the conversation before sending it again.
            </span>
          </div>
        ) : null}
      </div>
      {sideQuestionPanel}
      <div
        className={`composer ${
          selectedQueueAvailable && !askingAside ? 'composer--running' : ''
        } ${askingAside ? 'composer--aside' : ''}${dictation ? ' composer--dictating' : ''} composer--refresh`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {showCommandMenu ? <SlashCommandMenu {...props} /> : null}
        {!askingAside && selectedAttachments.length > 0 ? <AttachmentStrip {...props} /> : null}
        <div className="composer-text-panel">
          <textarea
            aria-label={askingAside ? 'Side question' : 'Message'}
            aria-describedby={askingAside ? undefined :
              [
                selected.queuedDispatch || queuedEditUnconfirmed
                  ? 'queued-dispatch-warning'
                  : deliveryUncertain ? 'composer-delivery-warning' : undefined,
                composerStorageError ? 'composer-storage-warning' : undefined,
                acceptanceReceiptMissing ? 'composer-acceptance-warning' : undefined,
              ].filter(Boolean).join(' ') || undefined
            }
            // A retained session has nothing running to send to. The
            // conversation stays here to be read; writing to it is what
            // reopening is for. Asking aside reads the saved conversation,
            // which a retained session still has.
            disabled={Boolean(selected.interruption || selected.archivedAt) && !askingAside}
            maxLength={askingAside ? SIDE_QUESTION_MAX_LENGTH : undefined}
            onBeforeInput={askingAside ? undefined : onBeforeInput}
            onCut={askingAside ? undefined : onCut}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={askingAside ? undefined : onPaste}
            placeholder={
              askingAside
                ? props.sideQuestionHasEntries
                  ? 'Ask a follow-up…'
                  : 'Ask about this conversation…'
                : selected.archivedAt
                  ? 'Archived - reopen to send'
                  : selected.interruption
                    ? 'Interrupted - reopen to send'
                    : editingQueuedPromptId
                      ? phoneEnterCreatesNewline
                        ? 'Editing a queued message · Save puts it back'
                        : 'Editing a queued message · Enter puts it back'
                      : `Message agent on ${selected.computerName}…`
            }
            ref={composerRef}
            rows={1}
            value={sideQuestionDraft ?? composer}
          />
        </div>
        <input
          accept="audio/*,.aac,.csv,.doc,.docx,.flac,.gif,.jpeg,.jpg,.json,.kql,.m4a,.md,.mp3,.mp4,.ofx,.ogg,.pdf,.png,.qfx,.tsv,.txt,.wav,.webm,.webp,.xls,.xlsx,.yaml,.yml"
          aria-label="File attachment"
          className="composer-audio-input"
          onChange={onFileChange}
          ref={audioInputRef}
          multiple
          type="file"
        />
        <ComposerActions key={`${selected.computerId}:${selected.id}`} {...props} />
      </div>
      {!askingAside && composer && composerDraftRecovered && !composerStorageError ? (
        <p aria-label="Session draft status" className="composer-draft-status" role="status">
          Recovered saved draft
        </p>
      ) : null}
      {stateLine ? <p className="composer-hint">{stateLine}</p> : null}
    </footer>
  )
}
