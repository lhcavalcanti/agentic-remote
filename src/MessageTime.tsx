import { useSyncExternalStore } from 'react'
import { calendarDay, messageTimeParts } from './message-time'

// Every shown time watches one shared day, so rows that skip renders, such as
// memoized transcript messages, still gain their date when it turns. Checked
// each minute and when the app is shown again, since timers stall in sleep.
const listeners = new Set<() => void>()
let today = calendarDay()
let timer: ReturnType<typeof setInterval> | undefined

function checkDay() {
  const day = calendarDay()
  if (day === today) return
  today = day
  for (const listener of listeners) listener()
}

function subscribeDay(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    checkDay()
    timer = setInterval(checkDay, 60_000)
    document.addEventListener('visibilitychange', checkDay)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size) return
    clearInterval(timer)
    document.removeEventListener('visibilitychange', checkDay)
  }
}

const currentDay = () => today

export function MessageTime({ value, className = 'message__timestamp' }: { value?: string; className?: string }) {
  useSyncExternalStore(subscribeDay, currentDay)
  const parts = messageTimeParts(value)
  if (!parts) return null
  return (
    <time className={className} dateTime={value} title={parts.title}>
      {parts.label}
    </time>
  )
}
