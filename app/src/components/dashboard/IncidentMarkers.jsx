import { Fragment, useEffect, useRef } from 'react'
import { CircleMarker, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { TYPE_MARKER_COLORS, SEVERITY_RADIUS } from '../../data/markerColors.js'
import { evidenceStatusLevel, EVIDENCE_STATUS } from '../../utils/evidenceStatus.js'
import IncidentPopup from './IncidentPopup.jsx'

function checkmarkBadgeIcon(radius) {
  return L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:9999px;background:#2DC653;border:1.5px solid white;box-shadow:0 0 2px rgba(0,0,0,0.5);">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </span>`,
    iconSize: [14, 14],
    iconAnchor: [7 - radius * 0.7, 7 + radius * 0.7],
  })
}

export default function IncidentMarkers({ reports, selectedReportId }) {
  const map = useMap()
  const markerRefs = useRef({})

  useEffect(() => {
    if (!selectedReportId) return
    const report = reports.find((r) => r.id === selectedReportId)
    if (!report?.location?.gps) return
    map.flyTo([report.location.gps.lat, report.location.gps.lng], 12, { duration: 0.8 })
    const marker = markerRefs.current[selectedReportId]
    if (marker) {
      window.setTimeout(() => marker.openPopup(), 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportId])

  return (
    <>
      {reports
        .filter((report) => report.location?.gps)
        .map((report) => {
          const { lat, lng } = report.location.gps
          const color = TYPE_MARKER_COLORS[report.incident.type] ?? TYPE_MARKER_COLORS.other
          const radius = SEVERITY_RADIUS[report.incident.severity] ?? 10
          const upgraded = evidenceStatusLevel(report) !== EVIDENCE_STATUS.COMMUNITY_OBSERVED

          return (
            <Fragment key={report.id}>
              <CircleMarker
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  color: upgraded ? '#ffffff' : color,
                  weight: upgraded ? 3 : 1.5,
                  fillColor: color,
                  fillOpacity: 0.85,
                }}
                ref={(instance) => {
                  if (instance) markerRefs.current[report.id] = instance
                }}
              >
                <Popup>
                  <IncidentPopup report={report} />
                </Popup>
              </CircleMarker>
              {upgraded && (
                <Marker
                  position={[lat, lng]}
                  icon={checkmarkBadgeIcon(radius)}
                  interactive={false}
                />
              )}
            </Fragment>
          )
        })}
    </>
  )
}
