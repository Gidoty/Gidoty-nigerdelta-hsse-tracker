import { WifiOff, CheckCircle2 } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus.js'

export default function ConnectivityStatus() {
  const { isOnline, justReconnected } = useOnlineStatus()

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-amber/40 bg-amber/10 px-4 py-2 text-center text-xs font-medium text-amber">
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        You are offline. Reports are saved on this device — nothing here requires a connection.
      </div>
    )
  }

  if (justReconnected) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-safe/40 bg-safe/10 px-4 py-2 text-center text-xs font-medium text-safe">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Back online.
      </div>
    )
  }

  return null
}
