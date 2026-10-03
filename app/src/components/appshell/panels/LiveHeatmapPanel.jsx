import MapView from '../../dashboard/MapView.jsx'
import { useReportsWithDemo } from '../../../hooks/useReportsWithDemo.js'
import { Scale } from 'lucide-react'

export default function LiveHeatmapPanel() {
  const { combinedReports, usingDemoData, demoBannerDismissed, dismissDemoBanner } = useReportsWithDemo()

  return (
    <div className="relative h-full w-full">
      <MapView
        reports={combinedReports}
        selectedReportId={null}
        showDemoBanner={usingDemoData && !demoBannerDismissed}
        onDismissDemoBanner={dismissDemoBanner}
      />

      <div className="pointer-events-none absolute bottom-3 right-3 z-[100] flex items-center gap-1.5 rounded-full border border-border bg-panel/90 px-3 py-1.5 text-[10px] text-muted backdrop-blur">
        <Scale className="h-3 w-3" />
        Legal basis: Nigeria Data Protection Act 2023 — coarse location display
      </div>
    </div>
  )
}
