import { useEffect, useState } from 'react'

// Requests persistent storage once per app load, where the browser
// supports the API (StorageManager) — without it, a browser under disk
// pressure may silently evict this app's IndexedDB data (saved reports),
// since there is no server copy. Returns the real outcome so the UI can
// show it; this is a request, not a guarantee, and some browsers (e.g.
// Safari) do not implement navigator.storage.persist() at all.
export function usePersistentStorage() {
  const [status, setStatus] = useState({ checked: false, supported: false, persisted: false })

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!navigator.storage?.persist) {
        if (!cancelled) setStatus({ checked: true, supported: false, persisted: false })
        return
      }
      try {
        const persisted = await navigator.storage.persist()
        if (!cancelled) setStatus({ checked: true, supported: true, persisted })
      } catch {
        if (!cancelled) setStatus({ checked: true, supported: true, persisted: false })
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return status
}
