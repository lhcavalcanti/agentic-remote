import { useCallback, useEffect, useRef, useState } from 'react'
import {
  HostHistorySchema, HostProcessesSchema, HostSnapshotSchema, HostTelemetryMessageSchema,
  HOST_TELEMETRY_INVALID_CODE, HOST_TELEMETRY_INVALID_CLOSE_CODE,
  type HostMinuteAggregate, type HostProcesses, type HostSnapshot,
} from '../../shared/host-telemetry'
import { request } from '../api'

const updateRequiredMessage = 'This computer sent invalid host telemetry. Update this computer.'

function incompatibilityMessage(caught: unknown): string | undefined {
  if (!caught || typeof caught !== 'object') return
  if ('code' in caught && caught.code === HOST_TELEMETRY_INVALID_CODE) return updateRequiredMessage
  if ('statusCode' in caught && caught.statusCode === 409) {
    return caught instanceof Error ? caught.message : 'Host monitor is unavailable'
  }
}

export function useHostMonitor(computerId: string, active: boolean, processesOpen: boolean, historyOpen: boolean) {
  const [snapshot, setSnapshot] = useState<HostSnapshot>()
  const [diskSamples, setDiskSamples] = useState<{ at: string; free: number }[]>([])
  const [history, setHistory] = useState<HostMinuteAggregate[]>([])
  const [processes, setProcesses] = useState<HostProcesses>()
  const [error, setError] = useState<string>()
  const [processError, setProcessError] = useState<string>()
  const [historyError, setHistoryError] = useState<string>()
  const [retryRequired, setRetryRequired] = useState(false)
  const [attempt, setAttempt] = useState(0)
  // Fence concurrent reads/frames before the retry-required state is rendered.
  const incompatible = useRef(false)
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  const base = `/api/computers/${encodeURIComponent(computerId)}/host`
  const markIncompatible = useCallback((message: string) => {
    incompatible.current = true
    setError(message)
    setRetryRequired(true)
  }, [])
  const retryConnection = useCallback(() => {
    incompatible.current = false
    setError(undefined)
    setRetryRequired(false)
    setAttempt((current) => current + 1)
  }, [])
  useEffect(() => {
    const changed = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', changed)
    return () => document.removeEventListener('visibilitychange', changed)
  }, [])
  useEffect(() => {
    if (!active || !visible || retryRequired) return
    let disposed = false
    let socket: WebSocket | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    let failures = 0
    const controller = new AbortController()
    function reconnect() {
      if (disposed || incompatible.current) return
      clearTimeout(retry)
      retry = setTimeout(() => void connect(), Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5)))
    }
    function requireUpdate(message = updateRequiredMessage) {
      clearTimeout(retry)
      markIncompatible(message)
      const current = socket
      socket = undefined
      current?.close()
    }
    function accept(value: HostSnapshot) {
      setSnapshot(value)
      if (value.latest && value.disk) {
        const at = value.latest.at
        const free = value.disk.freeBytes
        setDiskSamples((samples) => [...samples.filter((sample) =>
          sample.at !== at && Date.parse(sample.at) >= Date.parse(at) - 60_000), { at, free }].slice(-61))
      }
    }
    async function connect() {
      if (disposed || incompatible.current) return
      try {
        const response = await request(base, { signal: controller.signal, cache: 'no-store' })
        if (disposed || incompatible.current) return
        const initial = HostSnapshotSchema.safeParse(response)
        if (!initial.success) { requireUpdate(); return }
        accept(initial.data)
        setError(undefined)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const current = new WebSocket(`${protocol}//${window.location.host}${base}/live`)
        socket = current
        current.onmessage = (event) => {
          if (disposed || incompatible.current || socket !== current) return
          try {
            const message = HostTelemetryMessageSchema.parse(JSON.parse(String(event.data)))
            accept(message.snapshot)
            failures = 0
            setError(undefined)
          } catch { requireUpdate() }
        }
        current.onclose = (event) => {
          if (disposed || incompatible.current || socket !== current) return
          if (event.code === HOST_TELEMETRY_INVALID_CLOSE_CODE) { requireUpdate(); return }
          setError('Live connection lost. Reconnecting…')
          reconnect()
        }
        current.onerror = () => current.close()
      } catch (caught) {
        if (disposed || incompatible.current) return
        const message = caught instanceof Error ? caught.message : 'Host monitor is unavailable'
        const update = incompatibilityMessage(caught)
        if (update !== undefined) requireUpdate(update)
        else { setError(message); reconnect() }
      }
    }
    void connect()
    return () => { disposed = true; controller.abort(); clearTimeout(retry); socket?.close() }
  }, [base, active, visible, retryRequired, attempt, markIncompatible])
  useEffect(() => {
    if (!active || !visible || !processesOpen || retryRequired) return
    let disposed = false
    let next: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    async function poll() {
      if (disposed || incompatible.current) return
      try {
        const rows = HostProcessesSchema.parse(await request(`${base}/processes`, { signal: controller.signal, cache: 'no-store' }))
        if (!disposed) { setProcesses(rows); setProcessError(undefined) }
      } catch (caught) {
        if (!disposed && !incompatible.current) {
          const update = incompatibilityMessage(caught)
          if (update !== undefined) markIncompatible(update)
          else setProcessError(caught instanceof Error ? caught.message : 'Process inventory unavailable')
        }
      } finally { if (!disposed) next = setTimeout(() => void poll(), 5000) }
    }
    void poll()
    return () => { disposed = true; controller.abort(); clearTimeout(next) }
  }, [base, active, visible, processesOpen, retryRequired, markIncompatible])
  useEffect(() => {
    if (!active || !visible || !historyOpen || retryRequired) return
    let disposed = false
    let next: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    async function poll() {
      if (disposed || incompatible.current) return
      try {
        const rows = HostHistorySchema.parse(await request(`${base}/history?range=24h`, { signal: controller.signal, cache: 'no-store' }))
        if (!disposed) { setHistory(rows); setHistoryError(undefined) }
      } catch (caught) {
        if (!disposed && !incompatible.current) {
          const update = incompatibilityMessage(caught)
          if (update !== undefined) markIncompatible(update)
          else setHistoryError(caught instanceof Error ? caught.message : 'History unavailable')
        }
      } finally { if (!disposed) next = setTimeout(() => void poll(), 60_000) }
    }
    void poll()
    return () => { disposed = true; controller.abort(); clearTimeout(next) }
  }, [base, active, visible, historyOpen, retryRequired, markIncompatible])
  return { snapshot, history, processes, diskSamples, error, processError, historyError, retryRequired, retry: retryConnection }
}
