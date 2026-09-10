import { File, FileCode2, FileImage, FileText, PanelsTopLeft } from 'lucide-react'
import type { WorkspaceFile } from '../shared/contracts'

export function WorkspaceFileIcon({
  kind,
  size = 16,
}: {
  kind: WorkspaceFile['kind']
  size?: number
}) {
  const Icon = kind === 'markdown' ? FileText
    : kind === 'html' ? PanelsTopLeft
    : kind === 'image' ? FileImage
      : kind === 'file' ? FileCode2
        : File
  return <Icon aria-hidden="true" className={`workspace-file-icon workspace-file-icon--${kind}`} size={size} />
}
