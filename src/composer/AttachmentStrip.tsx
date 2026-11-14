import { FileText, RefreshCw, X } from 'lucide-react'
import type { ComposerProps } from './types'

export function AttachmentStrip({
  selectedAttachments,
  uploadingFile,
  transcribing,
  sending,
  queueActionId,
  attachmentSize,
  onRetryAttachment,
  onRemoveAttachment,
}: Pick<ComposerProps,
  'selectedAttachments' | 'uploadingFile' | 'transcribing' | 'sending' |
  'queueActionId' | 'attachmentSize' | 'onRetryAttachment' | 'onRemoveAttachment'
>) {
  return (
    <ul aria-label="Attachments" aria-live="polite" className="composer-attachments">
      {selectedAttachments.map((attachment) => (
        <li
          aria-label={`${attachment.name} attachment`}
          className={`composer-attachment composer-attachment--${attachment.status}`}
          key={attachment.id}
        >
          <FileText aria-hidden="true" size={18} />
          <span className="composer-attachment__details">
            <strong>{attachment.name}</strong>
            <small>
              {attachment.error ||
                (attachment.status === 'uploading' ? 'Uploading…' : 'Attached')}
              {' · '}
              {attachmentSize(attachment.size)}
            </small>
          </span>
          {attachment.status === 'failed' && attachment.retryable ? (
            <button
              aria-label={`Retry ${attachment.name}`}
              className="composer-attachment__action"
              disabled={uploadingFile || transcribing}
              onClick={() => onRetryAttachment(attachment)}
              type="button"
            >
              <RefreshCw size={15} />
            </button>
          ) : null}
          <button
            aria-label={`Remove ${attachment.name}`}
            className="composer-attachment__action"
            disabled={attachment.status === 'uploading' || sending || queueActionId !== undefined}
            onClick={() => onRemoveAttachment(attachment)}
            type="button"
          >
            <X size={15} />
          </button>
        </li>
      ))}
    </ul>
  )
}
