import {
  ArrowUp, History, ListPlus, LoaderCircle, MessageCircleQuestion, Mic, Paperclip, Plus, Search, SlidersHorizontal, Square,
} from 'lucide-react'
import { useState } from 'react'
import { usePreviewFeature } from '../preview-features'
import { SessionActions } from '../SessionActions'
import { ContextRing } from './ContextRing'
import { SentMessages } from './SentMessages'
import { SendControl } from './SendControl'
import { composerSteeringUnavailableReason } from './composer-state'
import type { ComposerProps } from './types'

export function ComposerActions({
  selected,
  selectedComputerOnline,
  selectedQueueAvailable,
  foregroundTurnActive,
  supportsQueuedPromptDispatch,
  recording,
  recordingSeconds,
  askingAside,
  sideQuestionDraft,
  sideQuestionPending,
  cancelling,
  transcribing,
  uploadingFile,
  composer,
  expandedComposer,
  sending,
  queueActionId,
  queuedEditUnconfirmed,
  editingQueuedPromptId,
  readonlyResourceCommand,
  recordingDuration,
  onStopRecording,
  onSubmitSideQuestion,
  onStopSession,
  onOpenAttachmentInput,
  onStartRecording,
  onSubmitMessage,
  onOpenRuntime,
  sessionActions,
  onRecallSentMessage,
  onCancelSentMessage,
  providerCapability,
  onUseSentMessage,
  phoneEnterCreatesNewline,
}: Pick<ComposerProps,
  'selected' | 'selectedComputerOnline' | 'selectedQueueAvailable' | 'foregroundTurnActive' | 'supportsQueuedPromptDispatch' |
  'recording' | 'recordingSeconds' | 'askingAside' | 'sideQuestionDraft' | 'sideQuestionPending' |
  'cancelling' | 'transcribing' | 'uploadingFile' | 'composer' | 'expandedComposer' | 'sending' | 'queueActionId' |
  'queuedEditUnconfirmed' | 'editingQueuedPromptId' | 'readonlyResourceCommand' |
  'recordingDuration' | 'onStopRecording' | 'onSubmitSideQuestion' | 'onStopSession' |
  'onOpenAttachmentInput' | 'onStartRecording' | 'onSubmitMessage' | 'onOpenRuntime' | 'sessionActions' |
  'onRecallSentMessage' | 'onCancelSentMessage' | 'providerCapability' | 'onUseSentMessage' | 'phoneEnterCreatesNewline'
>) {
  const refresh = usePreviewFeature('composerRefresh')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyChosen, setHistoryChosen] = useState(false)
  const busyChoices = refresh && foregroundTurnActive &&
    !readonlyResourceCommand && !editingQueuedPromptId && !expandedComposer.trim().startsWith('/')
  // Where Return adds a line, as on a phone, no keyboard shortcut is named.
  const shortcut = (keys: string) => phoneEnterCreatesNewline ? '' : ` (${keys})`
  const sendDisabled = !composer.trim() || sending || transcribing || uploadingFile ||
    (!readonlyResourceCommand && (
      Boolean(queueActionId) || Boolean(selected.queuedDispatch) ||
      queuedEditUnconfirmed || selected.suspended === true ||
      Boolean(selected.interruption || selected.archivedAt) ||
      Boolean(editingQueuedPromptId && supportsQueuedPromptDispatch &&
        (selected.status === 'running' || selected.status === 'waiting'))))
  const historyButton = (
    <button
      aria-haspopup="dialog" aria-label="Sent messages" className="composer-tool"
      disabled={sending || recording || transcribing || uploadingFile || Boolean(editingQueuedPromptId)}
      onClick={() => { setHistoryChosen(false); setHistoryOpen(true) }}
      title="Search sent messages" type="button"
    ><History aria-hidden="true" size={18} /></button>
  )
  const setupButton = (
    <button aria-label="Session setup" className="composer-tool" onClick={onOpenRuntime} type="button">
      <SlidersHorizontal aria-hidden="true" size={18} />
    </button>
  )
  return recording ? (
    <div className="recording-panel" role="status">
      <button className="recording-panel__cancel" onClick={() => onStopRecording(true)} type="button">
        Cancel
      </button>
      <span className="recording-panel__status">
        <i />
        Recording {recordingDuration(recordingSeconds)}
      </span>
      <button className="recording-panel__stop" onClick={() => onStopRecording()} type="button">
        <Square fill="currentColor" size={12} />
        Stop & transcribe
      </button>
    </div>
  ) : askingAside ? (
    <div className={`composer-actions${refresh ? ' composer-actions--refresh' : ''}`}>
      <span className="composer-actions__spacer" />
      <button
        aria-label="Ask side question"
        className="send-button send-button--aside"
        disabled={!sideQuestionDraft?.trim() || sideQuestionPending || !selectedComputerOnline}
        onClick={onSubmitSideQuestion}
        title={sideQuestionPending
          ? 'Waiting for the answer to the last side question'
          : 'Ask without sending anything to the session'}
        type="button"
      >
        <MessageCircleQuestion size={18} />
        <span className="send-button__label">Ask</span>
      </button>
      {selected.status === 'running' ? (
        <button
          aria-label="Stop response"
          className="send-button send-button--stop"
          disabled={cancelling}
          onClick={onStopSession}
          type="button"
        >
          <Square fill="currentColor" size={15} />
        </button>
      ) : null}
    </div>
  ) : (
    <>
    <div className={`composer-actions${refresh ? ' composer-actions--refresh' : ''}`}>
      <button
        aria-label={transcribing
          ? 'Transcribing audio'
          : uploadingFile ? 'Uploading file' : 'Attach file or audio recording'}
        className="send-button composer-attachment-button"
        disabled={transcribing || uploadingFile}
        onClick={onOpenAttachmentInput}
        type="button"
      >
        {transcribing || uploadingFile ? (
          <LoaderCircle className="activity-message__spinner" size={17} />
        ) : refresh ? <Plus size={19} /> : <Paperclip size={17} />}
      </button>
      {refresh ? (
        <div className="composer-secondary-tools">
          {setupButton}
          {historyButton}
          <ContextRing runtime={selected.runtime} onOpen={onOpenRuntime} />
        </div>
      ) : null}
      <button
        aria-label="Start microphone recording"
        className="send-button composer-record-button"
        disabled={transcribing || uploadingFile}
        onClick={onStartRecording}
        title="Record and transcribe"
        type="button"
      >
        <Mic size={17} />
      </button>
      {refresh ? (
        <SessionActions className="composer-session-panel" label="Session panel" description="This session">
          <div className="composer-secondary-overflow">
            {setupButton}
            {historyButton}
            <ContextRing runtime={selected.runtime} onOpen={onOpenRuntime} />
          </div>
          {sessionActions?.map((action) => (
            <button
              className="session-action" disabled={action.disabled}
              key={action.label} onClick={action.onClick} type="button"
            >{action.label}</button>
          ))}
        </SessionActions>
      ) : null}
      <span className="composer-actions__spacer" />
      {selectedQueueAvailable ? (
        <button
          aria-description="Queues this message for later delivery"
          aria-label="Queue message"
          className="send-button send-button--queue"
          disabled={!composer.trim() || sending || transcribing || uploadingFile ||
            Boolean(queueActionId) || Boolean(selected.queuedDispatch) || queuedEditUnconfirmed}
          onClick={() => onSubmitMessage(true)}
          title={`Queue for later delivery${shortcut('Ctrl/⌘+Enter')}`}
          type="button"
        >
          <ListPlus size={17} />
        </button>
      ) : null}
      <SendControl
        disabled={sendDisabled} enabled={busyChoices} key={`send-${busyChoices}`}
        onSubmit={onSubmitMessage}
        steerUnavailableReason={composerSteeringUnavailableReason(selected, providerCapability, selectedComputerOnline)}
      >
      {(triggerProps) => <button
        aria-label={
          readonlyResourceCommand
            ? readonlyResourceCommand.tab === 'skills' ? 'Open skills' : 'Open MCP servers'
            : editingQueuedPromptId
              ? supportsQueuedPromptDispatch ? 'Send edited message' : 'Put this back in the queue'
              : 'Send message'
        }
        className="send-button"
        disabled={sendDisabled}
        {...triggerProps}
        title={
          readonlyResourceCommand
            ? 'Open the read-only resource view without sending a prompt'
            : editingQueuedPromptId
              ? supportsQueuedPromptDispatch ? 'Send this queued message now' : 'Put this back in the queue'
              : busyChoices ? 'Choose Steer or Queue'
                : `${foregroundTurnActive ? 'Send into the current response' : 'Send immediately'}${shortcut('Enter')}`
        }
        type="button"
      >
        {readonlyResourceCommand ? <Search size={19} /> : <ArrowUp size={19} strokeWidth={2.4} />}
        <span className="send-button__label">
          {readonlyResourceCommand ? 'View' : editingQueuedPromptId
            ? supportsQueuedPromptDispatch ? 'Send now' : 'Save'
            : 'Send'}
        </span>
      </button>}
      </SendControl>
      {selected.status === 'running' ? (
        <button
          aria-label="Stop response"
          className="send-button send-button--stop"
          disabled={cancelling}
          onClick={onStopSession}
          type="button"
        >
          <Square fill="currentColor" size={15} />
        </button>
      ) : null}
    </div>
    {refresh && historyOpen ? (
      <SentMessages
        messages={selected.messages}
        receipts={selected.promptReceipts}
        sessionState={selected}
        onCancel={() => {
          if (historyChosen) onCancelSentMessage()
          setHistoryOpen(false)
        }}
        onChoose={(id) => { setHistoryChosen(true); onRecallSentMessage(id) }}
        onUse={() => { if (onUseSentMessage()) setHistoryOpen(false) }}
      />
    ) : null}
    </>
  )
}
