import {
  ArrowUp, ListPlus, LoaderCircle, MessageCircleQuestion, Mic, Paperclip, Search, Square,
} from 'lucide-react'
import type { ComposerProps } from './types'

export function ComposerActions({
  selected,
  selectedComputerOnline,
  selectedQueueAvailable,
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
}: Pick<ComposerProps,
  'selected' | 'selectedComputerOnline' | 'selectedQueueAvailable' | 'supportsQueuedPromptDispatch' |
  'recording' | 'recordingSeconds' | 'askingAside' | 'sideQuestionDraft' | 'sideQuestionPending' |
  'cancelling' | 'transcribing' | 'uploadingFile' | 'composer' | 'sending' | 'queueActionId' |
  'queuedEditUnconfirmed' | 'editingQueuedPromptId' | 'readonlyResourceCommand' |
  'recordingDuration' | 'onStopRecording' | 'onSubmitSideQuestion' | 'onStopSession' |
  'onOpenAttachmentInput' | 'onStartRecording' | 'onSubmitMessage'
>) {
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
    <div className="composer-actions">
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
    <div className="composer-actions">
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
        ) : <Paperclip size={17} />}
      </button>
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
      <span className="composer-actions__spacer" />
      {selectedQueueAvailable ? (
        <button
          aria-description="Queues this message for later delivery"
          aria-label="Queue message"
          className="send-button send-button--queue"
          disabled={!composer.trim() || sending || transcribing || uploadingFile ||
            Boolean(queueActionId) || Boolean(selected.queuedDispatch) || queuedEditUnconfirmed}
          onClick={() => onSubmitMessage(true)}
          title="Queue for later delivery"
          type="button"
        >
          <ListPlus size={17} />
        </button>
      ) : null}
      <button
        aria-label={
          readonlyResourceCommand
            ? readonlyResourceCommand.tab === 'skills' ? 'Open skills' : 'Open MCP servers'
            : editingQueuedPromptId
              ? supportsQueuedPromptDispatch ? 'Send edited message' : 'Put this back in the queue'
              : 'Send message'
        }
        className="send-button"
        disabled={!composer.trim() || sending || transcribing || uploadingFile ||
          (!readonlyResourceCommand && (
            Boolean(queueActionId) || Boolean(selected.queuedDispatch) ||
            queuedEditUnconfirmed || selected.suspended === true ||
            Boolean(selected.interruption || selected.archivedAt) ||
            Boolean(editingQueuedPromptId && supportsQueuedPromptDispatch &&
              (selected.status === 'running' || selected.status === 'waiting'))))}
        onClick={() => onSubmitMessage()}
        title={
          readonlyResourceCommand
            ? 'Open the read-only resource view without sending a prompt'
            : editingQueuedPromptId
              ? supportsQueuedPromptDispatch ? 'Send this queued message now' : 'Put this back in the queue'
              : selected.status === 'running' ? 'Send into the current response' : 'Send immediately'
        }
        type="button"
      >
        {readonlyResourceCommand ? <Search size={19} /> : <ArrowUp size={19} strokeWidth={2.4} />}
        <span className="send-button__label">
          {readonlyResourceCommand ? 'View' : editingQueuedPromptId
            ? supportsQueuedPromptDispatch ? 'Send now' : 'Save'
            : 'Send'}
        </span>
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
  )
}
