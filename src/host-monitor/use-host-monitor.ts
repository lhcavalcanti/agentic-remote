import { useEffect, useState } from 'react'
import {
  HostHistorySchema, HostProcessesSchema, HostSnapshotSchema, HostTelemetryMessageSchema,
  type HostMinuteAggregate, type HostProcesses, type HostSnapshot,
} from '../../shared/host-telemetry'
import { request } from '../api'

export function useHostMonitor(computerId: string, active: boolean, processesOpen: boolean, historyOpen: boolean) {
  const [snapshot, setSnapshot] = useState<HostSnapshot>()
  const [diskSamples, setDiskSamples] = useState<{ at: string; free: number }[]>([])
  const [history, setHistory] = useState<HostMinuteAggregate[]>([])
  const [processes, setProcesses] = useState<HostProcesses>()
  const [error, setError] = useState<string>()
  const [processError, setProcessError] = useState<string>()
  const [historyError, setHistoryError] = useState<string>()
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  const base = `/api/computers/${encodeURIComponent(computerId)}/host`
  useEffect(() => {
    const changed = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', changed)
    return () => document.removeEventListener('visibilitychange', changed)
  }, [])
  useEffect(() => {
    if (!active || !visible) return
    let disposed = false
    let socket: WebSocket | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    let incompatible = false
    let failures = 0
    const controller = new AbortController()
    function reconnect() {
      if (disposed || incompatible) return
      clearTimeout(retry)
      retry = setTimeout(() => void connect(), Math.min(30_000, 1000 * 2 ** Math.min(failures++, 5)))
    }
    function requireUpdate() {
      incompatible = true
      clearTimeout(retry)
      setError('This computer sent invalid host telemetry. Update this computer.')
      socket?.close()
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
      try {
        const response = await request(base, { signal: controller.signal, cache: 'no-store' })
        if (disposed) return
        const initial = HostSnapshotSchema.safeParse(response)
        if (!initial.success) { requireUpdate(); return }
        accept(initial.data)
        setError(undefined)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const current = new WebSocket(`${protocol}//${window.location.host}${base}/live`)
        socket = current
        current.onmessage = (event) => {
          if (disposed || incompatible || socket !== current) return
          try {
            const message = HostTelemetryMessageSchema.parse(JSON.parse(String(event.data)))
            accept(message.snapshot)
            failures = 0
            setError(undefined)
          } catch { requireUpdate() }
        }
        current.onclose = () => {
          if (disposed || incompatible || socket !== current) return
          setError('Live connection lost. Reconnecting…')
          reconnect()
        }
        current.onerror = () => current.close()
      } catch (caught) {
        if (disposed) return
        setError(caught instanceof Error ? caught.message : 'Host monitor is unavailable')
        if (caught && typeof caught === 'object' && 'statusCode' in caught && caught.statusCode === 409) incompatible = true
        else reconnect()
      }
    }
    void connect()
    return () => { disposed = true; controller.abort(); clearTimeout(retry); socket?.close() }
  }, [base, active, visible])
  useEffect(() => {
    if (!active || !visible || !processesOpen) return
    let disposed = false
    let next: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    async function poll() {
      try {
        const rows = HostProcessesSchema.parse(await request(`${base}/processes`, { signal: controller.signal, cache: 'no-store' }))
        if (!disposed) { setProcesses(rows); setProcessError(undefined) }
      } catch (caught) {
        if (!disposed) setProcessError(caught instanceof Error ? caught.message : 'Process inventory unavailable')
      } finally { if (!disposed) next = setTimeout(() => void poll(), 5000) }
    }
    void poll()
    return () => { disposed = true; controller.abort(); clearTimeout(next) }
  }, [base, active, visible, processesOpen])
  useEffect(() => {
    if (!active || !visible || !historyOpen) return
    let disposed = false
    let next: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    async function poll() {
      try {
        const rows = HostHistorySchema.parse(await request(`${base}/history?range=24h`, { signal: controller.signal, cache: 'no-store' }))
        if (!disposed) { setHistory(rows); setHistoryError(undefined) }
      } catch (caught) {
        if (!disposed) setHistoryError(caught instanceof Error ? caught.message : 'History unavailable')
      } finally { if (!disposed) next = setTimeout(() => void poll(), 60_000) }
    }
    void poll()
    return () => { disposed = true; controller.abort(); clearTimeout(next) }
  }, [base, active, visible, historyOpen])
  return { snapshot, history, processes, diskSamples, error, processError, historyError }
}
