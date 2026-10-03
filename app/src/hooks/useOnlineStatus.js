import { useEffect, useState } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true)
      setJustReconnected(true)
      window.setTimeout(() => setJustReconnected(false), 3000)
    }
    const goOffline = () => {
      setIsOnline(false)
      setJustReconnected(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return { isOnline, justReconnected }
}
