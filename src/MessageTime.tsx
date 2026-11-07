import { messageTimeParts } from './message-time'

export function MessageTime({ value, className = 'message__timestamp' }: { value?: string; className?: string }) {
  const parts = messageTimeParts(value)
  if (!parts) return null
  return (
    <time className={className} dateTime={value} title={parts.title}>
      {parts.label}
    </time>
  )
}
