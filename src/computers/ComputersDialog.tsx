import { useState } from 'react'
import type { FormEvent } from 'react'
import { Trash2, Wifi, WifiOff } from 'lucide-react'
import type { ComputerSummary } from '../../shared/contracts'
import { addComputer, listComputers, removeComputer } from '../api'
import { DialogFrame } from '../components/DialogFrame'

export type ComputersBodyProps = {
  computers: ComputerSummary[]
  onAdded: (computer: ComputerSummary) => void
  onRemoved: (computerId: string) => void
  enhanced?: boolean
  open?: boolean
  onClose?: () => void
}

export function ComputersDialog({ open, onClose, ...props }: ComputersBodyProps & {
  open: boolean
  onClose: () => void
}) {
  return <ComputersBody {...props} open={open} onClose={onClose} />
}

export function ComputersBody({
  computers,
  onAdded,
  onRemoved,
  enhanced = false,
  open = true,
  onClose,
}: ComputersBodyProps) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [checking, setChecking] = useState(false)
  const [connection, setConnection] = useState<string>()
  if (!open) return null

  async function check() {
    setChecking(true)
    setError(undefined)
    try {
      const latest = await listComputers()
      for (const computer of latest) onAdded(computer)
      setConnection(latest.map((computer) => `${computer.name}: ${computer.online ? 'Online' : 'Offline'}`).join(' · '))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setChecking(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      const computer = await addComputer({
        baseUrl,
        token,
        name: name.trim() || undefined,
      })
      onAdded(computer)
      setName('')
      setBaseUrl('')
      setToken('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this computer from the hub? Its sessions are not deleted.')) {
      return
    }
    setError(undefined)
    try {
      await removeComputer(id)
      onRemoved(id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  const body = (
    <>
      <div className="computer-list">
        {computers.map((computer) => (
          <div className="computer-row" key={computer.id}>
            {computer.online ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>
              <strong>{computer.name}</strong>
              <small>{computer.isLocal ? 'This computer' : computer.baseUrl}</small>
              {enhanced ? <small>{computer.online ? 'Online' : 'Offline'} · {computer.isLocal ? 'Hub' : 'Node'} · Version {computer.version ?? 'not reported'}</small> : null}
            </span>
            {!computer.isLocal ? (
              <button
                aria-label={`Remove ${computer.name}`}
                className="icon-button icon-button--danger"
                onClick={() => void remove(computer.id)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {enhanced ? <>
        <button className="secondary-button" disabled={checking} onClick={() => void check()} type="button">{checking ? 'Checking…' : 'Check connection'}</button>
        {connection ? <p role="status">{connection}</p> : null}
        <p className="dialog-message">Pair a computer below. Its name can be set when pairing.</p>
      </> : null}
      <form className="computer-form" onSubmit={submit}>
        <label className="field">
          <span>Name (optional)</span>
          <input
            className="dialog-input"
            onChange={(event) => setName(event.target.value)}
            placeholder="worker-node"
            value={name}
          />
        </label>
        <label className="field">
          <span>Node URL</span>
          <input
            className="dialog-input"
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="http://192.168.1.11:4317"
            spellCheck={false}
            value={baseUrl}
          />
        </label>
        <label className="field">
          <span>Pairing token</span>
          <input
            className="dialog-input"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste from agentic-remote pair-info"
            spellCheck={false}
            type="password"
            value={token}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={submitting || !baseUrl.trim() || !token.trim()}
          type="submit"
        >
          {submitting ? 'Connecting…' : 'Add computer'}
        </button>
      </form>
    </>
  )
  return onClose ? <DialogFrame eyebrow="Hub settings" onClose={onClose} title="Computers">{body}</DialogFrame> : body
}
