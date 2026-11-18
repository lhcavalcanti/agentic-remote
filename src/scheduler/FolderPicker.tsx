import { useEffect, useRef, useState } from 'react'
import type { DirectoryListing } from '../../shared/contracts'
import { listDirectories } from '../api'
import { scheduleError } from './format'

export function FolderPicker({ computerId, value, onSelect }: { computerId: string; value: string; onSelect(path: string): void }) {
  const [listing, setListing] = useState<DirectoryListing>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const generation = useRef(0)
  useEffect(() => () => { generation.current++ }, [])
  async function browse(path: string) {
    const request = ++generation.current
    setLoading(true)
    try {
      const directories = await listDirectories(computerId, path, 'all')
      if (request === generation.current) { setListing(directories); setError(undefined) }
    } catch (caught) { if (request === generation.current) setError(scheduleError(caught)) }
    finally { if (request === generation.current) setLoading(false) }
  }
  return <div className="schedule-folder-picker schedule-wide">
    <button className="secondary-button" type="button" disabled={loading} onClick={() => void browse(value || '~')}>{loading ? 'Loading folders…' : 'Browse folders'}</button>
    {error && <p role="alert">{error}</p>}
    {listing && <section aria-label="Choose schedule folder">
      <p className="schedule-caption">{listing.path}</p>
      <div className="schedule-folder-list">
        {listing.parent && <button className="secondary-button" type="button" disabled={loading} onClick={() => void browse(listing.parent!)}>Parent folder</button>}
        {listing.directories.map((directory) => <button className="secondary-button" type="button" key={directory.path} disabled={loading} onClick={() => void browse(directory.path)}>{directory.name}</button>)}
      </div>
      <button className="secondary-button" type="button" onClick={() => { onSelect(listing.path); setListing(undefined) }}>Use this folder</button>
    </section>}
  </div>
}
