import { useEffect, useState } from 'react'
import { loadRealReports } from '../utils/dashboardUtils.js'

export function useLiveReports() {
  const [reports, setReports] = useState(() => loadRealReports())

  useEffect(() => {
    const handler = (event) => setReports(event.detail.reports)
    window.addEventListener('hsse-data-updated', handler)
    return () => window.removeEventListener('hsse-data-updated', handler)
  }, [])

  return [reports, setReports]
}
