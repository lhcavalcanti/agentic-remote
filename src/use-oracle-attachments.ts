import { useEffect, useMemo, useRef, useState } from 'react'
import type { ManagerAttachment } from '../shared/manager'
import { managerFileValidationError } from '../shared/manager-files'
import { removeManagerFile, uploadManagerFile } from './api'

interface DraftAttachment {
  key: number
  name: string
  size: number
  state: 'uploading' | 'uploaded' | 'failed'
  file?: File
  reference?: ManagerAttachment
  error?: string
}

export function useOracleAttachments(initial: ManagerAttachment[] = []) {
  const [files, setFiles] = useState<DraftAttachment[]>(() => initial.map((reference, key) => ({
    key, name: reference.name, size: reference.size, state: 'uploaded', reference,
  })))
  const current = useRef(files)
  const nextKey = useRef(initial.length)
  const pending = useRef<DraftAttachment[]>([])
  const active = useRef(0)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  function update(change: (files: DraftAttachment[]) => DraftAttachment[]) {
    current.current = change(current.current)
    if (mounted.current) setFiles(current.current)
  }

  function drain() {
    while (mounted.current && active.current < 2 && pending.current.length) {
      const item = pending.current.shift()!
      if (!current.current.some((file) => file.key === item.key)) continue
      active.current += 1
      void uploadManagerFile(item.file!).then(async (reference) => {
        if (!mounted.current || !current.current.some((file) => file.key === item.key)) {
          await removeManagerFile(reference.id).catch(() => undefined)
          return
        }
        update((files) => files.map((file) => file.key === item.key
          ? { ...file, state: 'uploaded', reference, error: undefined } : file))
      }, (error: unknown) => {
        update((files) => files.map((file) => file.key === item.key
          ? { ...file, state: 'failed', error: error instanceof Error ? error.message : String(error) } : file))
      }).finally(() => {
        active.current -= 1
        drain()
      })
    }
  }

  function intake(selected: File[]) {
    const items: DraftAttachment[] = selected.map((file, index) => {
      const error = current.current.length + index >= 20
        ? 'Attach at most 20 files'
        : managerFileValidationError(file)
      return { key: nextKey.current++, name: file.name, size: file.size, file, state: error ? 'failed' : 'uploading', error }
    })
    update((files) => [...files, ...items])
    pending.current.push(...items.filter((file) => file.state === 'uploading'))
    drain()
  }

  function retry(key: number) {
    const item = current.current.find((file) => file.key === key)
    if (!item?.file) return
    if (current.current.length > 20) return
    const error = managerFileValidationError(item.file)
    if (error) return
    update((files) => files.map((file) => file.key === key ? { ...file, state: 'uploading', error: undefined } : file))
    pending.current.push(item)
    drain()
  }

  async function remove(key: number) {
    const item = current.current.find((file) => file.key === key)
    if (!item) return
    if (item.reference) {
      try {
        await removeManagerFile(item.reference.id)
      } catch (error) {
        const statusCode = error instanceof Error ? Reflect.get(error, 'statusCode') : undefined
        if (statusCode === 404 || statusCode === 409) {
          // An owned upload stays with its accepted message; only detach this draft.
          update((files) => files.filter((file) => file.key !== key))
          return
        }
        update((files) => files.map((file) => file.key === key
          ? { ...file, error: 'Could not remove the upload. Try Remove again.' } : file))
        return
      }
    }
    update((files) => files.filter((file) => file.key !== key))
  }

  return {
    files,
    uploaded: useMemo(() => files.flatMap((file) => file.reference ? [file.reference] : []), [files]),
    blocked: files.some((file) => file.state !== 'uploaded' || file.error),
    intake, retry, remove,
    clear: () => { pending.current = []; update(() => []) },
  }
}

