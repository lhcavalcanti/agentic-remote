import type {
  ChangeEventHandler,
  ClipboardEventHandler,
  ComponentProps,
  DragEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
} from 'react'
import type { DndContext, DragEndEvent } from '@dnd-kit/core'
import type { AgentProviderCapability, ManagedSession, QueuedPrompt, SlashCommand } from '../../shared/contracts'
import type { StatuslineSettings } from '../settings/types'
import type { SessionResourceTab } from '../session-resource-commands'

export type ComposerAttachment = {
  id: string
  ownerKey: string
  computerId: string
  sessionId: string
  migratedFrom?: string
  name: string
  size: number
  file?: File
  status: 'uploading' | 'attached' | 'failed'
  error?: string
  retryable?: boolean
  promptText?: string
}

export type ComposerProps = {
  selected: ManagedSession
  selectedRetained: boolean
  selectedQueueHeadIsSteering: boolean
  selectedQueueAvailable: boolean
  foregroundTurnActive: boolean
  selectedComputerOnline: boolean
  supportsQueuedPromptDispatch: boolean
  providerCapability?: AgentProviderCapability
  queueActionId?: string
  sending: boolean
  editingQueuedPromptId?: string
  queuedEditUnconfirmed: boolean
  composer: string
  expandedComposer: string
  uploadingFile: boolean
  transcribing: boolean
  deliveryUncertain: boolean
  composerStorageError?: string
  acceptanceReceiptMissing: boolean
  missingAcceptanceOwners: string[]
  askingAside: boolean
  sideQuestionPanel: ReactNode
  sideQuestionHasEntries: boolean
  sideQuestionDraft?: string
  sideQuestionPending: boolean
  showCommandMenu: boolean
  commandSuggestions: SlashCommand[]
  selectedCommandIndex: number
  selectedAttachments: ComposerAttachment[]
  recording: boolean
  recordingSeconds: number
  cancelling: boolean
  readonlyResourceCommand?: { tab: SessionResourceTab; filter: string }
  composerDraftRecovered: boolean
  statusline: StatuslineSettings
  phoneEnterCreatesNewline: boolean
  composerRef: RefObject<HTMLTextAreaElement | null>
  audioInputRef: RefObject<HTMLInputElement | null>
  sensors: ComponentProps<typeof DndContext>['sensors']
  attachmentSize: (size: number) => string
  recordingDuration: (seconds: number) => string
  compactTokens: (tokens: number) => string
  onQueueDragEnd: (event: DragEndEvent) => void
  onEditQueuedPrompt: (prompt: QueuedPrompt) => void
  onRemoveQueuedPrompt: (promptId: string) => void
  onDiscardUnconfirmed: () => void
  onSaveQueuedPromptEdit: () => void
  onCancelQueuedPromptEdit: () => void
  onDragOver: DragEventHandler<HTMLDivElement>
  onDrop: DragEventHandler<HTMLDivElement>
  onSelectCommand: (command: SlashCommand) => void
  onRetryAttachment: (attachment: ComposerAttachment) => void
  onRemoveAttachment: (attachment: ComposerAttachment) => void
  onBeforeInput: FormEventHandler<HTMLTextAreaElement>
  onCut: ClipboardEventHandler<HTMLTextAreaElement>
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>
  onPaste: ClipboardEventHandler<HTMLTextAreaElement>
  onFileChange: ChangeEventHandler<HTMLInputElement>
  onStopRecording: (discard?: boolean) => void
  onSubmitSideQuestion: () => void
  onStopSession: () => void
  onOpenAttachmentInput: () => void
  onStartRecording: () => void
  onSubmitMessage: (enqueue?: boolean) => void
  onOpenRuntime: () => void
  sessionActions?: { label: string; onClick: () => void; disabled?: boolean }[]
  onRecallSentMessage: (id: string) => void
  onCancelSentMessage: () => void
}
