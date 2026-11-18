import { useEffect, useState } from 'react'
import { request } from '../api'

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => [...part][0]).join('').toLocaleUpperCase()
}

export function useDisplayName(name: string | undefined, enabled: boolean): string {
  const [fallback, setFallback] = useState('')
  useEffect(() => {
    if (!enabled) return
    let active = true
    void request<{ defaultDisplayName: string }>('/api/settings?defaults=displayName', { cache: 'no-store' })
      .then((response) => { if (active && response.defaultDisplayName) setFallback(response.defaultDisplayName) })
      .catch(() => undefined)
    return () => { active = false }
  }, [enabled])
  return name ?? fallback
}
