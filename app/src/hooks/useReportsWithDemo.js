import { useEffect, useMemo, useState } from 'react'
import { generateDemoReports } from '../data/demoReports.js'
import { loadRealReports } from '../utils/dashboardUtils.js'

const REFRESH_INTERVAL_MS = 30000
const DEMO_THRESHOLD = 3

export function useReportsWithDemo() {
  const [realReports, setRealReports] = useState(() => loadRealReports())
  const demoReports = useMemo(() => generateDemoReports(), [])
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setRealReports(loadRealReports())
      setLastUpdated(new Date())
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let debounceTimer = null
    const handleDataUpdated = (event) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        setRealReports(event.detail.reports)
        setLastUpdated(new Date())
      }, 300)
    }
    window.addEventListener('hsse-data-updated', handleDataUpdated)
    return () => {
      clearTimeout(debounceTimer)
      window.removeEventListener('hsse-data-updated', handleDataUpdated)
    }
  }, [])

  const usingDemoData = realReports.length < DEMO_THRESHOLD
  const combinedReports = useMemo(
    () => (usingDemoData ? [...realReports, ...demoReports] : realReports),
    [realReports, demoReports, usingDemoData],
  )

  const refresh = () => {
    setRealReports(loadRealReports())
    setLastUpdated(new Date())
  }

  return {
    realReports,
    combinedReports,
    usingDemoData,
    demoBannerDismissed,
    dismissDemoBanner: () => setDemoBannerDismissed(true),
    lastUpdated,
    refresh,
  }
}
