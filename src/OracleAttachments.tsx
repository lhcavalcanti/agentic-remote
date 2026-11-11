import { FileText, LoaderCircle, RotateCcw, X } from 'lucide-react'
import type { ManagerAttachment } from '../shared/manager'
import { managerFileValidationError } from '../shared/manager-files'
import type { useOracleAttachments } from './use-oracle-attachments'

function attachmentSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`
  return `${(size / 1024 / 1024).toFixed(1)} MiB`
}

export function OracleAttachmentChips({ attachments, disabled = false }: {
  attachments: ReturnType<typeof useOracleAttachments>
  disabled?: boolean
}) {
  if (!attachments.files.length) return null
  return (
    <ul aria-label="Oracle attachments to send" className="composer-attachments oracle-attachments" aria-live="polite">
      {attachments.files.map((file) => (
        <li className={`composer-attachment composer-attachment--${file.state}`} key={file.key}>
          {file.state === 'uploading' || file.state === 'removing'
            ? <LoaderCircle aria-hidden="true" className="activity-message__spinner" size={16} />
            : <FileText aria-hidden="true" size={16} />}
          <div className="composer-attachment__details">
            <strong title={file.name}>{file.name}</strong>
            <small title={file.error}>
              {attachmentSize(file.size)} · {file.error ?? (
                file.state === 'uploaded' ? 'Uploaded' : file.state === 'removing' ? 'Removing…' : 'Uploading…'
              )}
            </small>
          </div>
          {file.state === 'failed' && file.file && !managerFileValidationError(file.file) ? (
            <button aria-label={`Retry ${file.name}`} className="composer-attachment__action" disabled={disabled} onClick={() => attachments.retry(file.key)} type="button">
              <RotateCcw aria-hidden="true" size={16} />
            </button>
          ) : null}
          <button aria-label={`Remove ${file.name}`} className="composer-attachment__action" disabled={disabled || file.state === 'removing'} onClick={() => void attachments.remove(file.key)} type="button">
            <X aria-hidden="true" size={16} />
          </button>
        </li>
      ))}
    </ul>
  )
}

export function OracleMessageAttachments({ files }: { files?: ManagerAttachment[] }) {
  if (!files?.length) return null
  return (
    <ul aria-label="Attached files" className="oracle-message-attachments">
      {files.map((file) => <li key={file.id}><FileText aria-hidden="true" size={13} />{file.name} <span>{attachmentSize(file.size)}</span></li>)}
    </ul>
  )
}
