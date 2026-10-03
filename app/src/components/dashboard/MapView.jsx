import { memo, useCallback, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polygon } from 'react-leaflet'
import L from 'leaflet'
import { X } from 'lucide-react'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import HeatmapLayer from './HeatmapLayer.jsx'
import IncidentMarkers from './IncidentMarkers.jsx'
import MapControls from './MapControls.jsx'
import { SEVERITY_WEIGHT } from '../../data/markerColors.js'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const NIGER_DELTA_BOUNDARY = [
  [6.5, 4.5],
  [6.5, 9.5],
  [3.8, 9.5],
  [3.8, 4.5],
  [6.5, 4.5],
]

const BOUNDARY_STYLE = {
  color: '#00A8CC',
  weight: 1.5,
  opacity: 0.4,
  fillOpacity: 0.03,
  dashArray: '6, 4',
  interactive: false,
}

function MapView({ reports, selectedReportId, showDemoBanner, onDismissDemoBanner }) {
  const [layers, setLayers] = useState({ heatmap: true, markers: true, boundary: true })

  const heatPoints = useMemo(
    () =>
      reports
        .filter((r) => r.location?.gps)
        .map((r) => [r.location.gps.lat, r.location.gps.lng, SEVERITY_WEIGHT[r.incident.severity] ?? 0.3]),
    [reports],
  )

  const toggleLayer = useCallback((key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] })), [])

  return (
    <div className="relative z-0 h-full w-full overflow-hidden">
      <MapContainer
        center={[5.5, 6.5]}
        zoom={8}
        minZoom={6}
        maxZoom={16}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {layers.boundary && <Polygon positions={NIGER_DELTA_BOUNDARY} pathOptions={BOUNDARY_STYLE} />}
        {layers.heatmap && <HeatmapLayer points={heatPoints} />}
        {layers.markers && <IncidentMarkers reports={reports} selectedReportId={selectedReportId} />}

        <MapControls layers={layers} onToggleLayer={toggleLayer} />
      </MapContainer>

      {layers.heatmap && (
        <div className="pointer-events-none absolute left-3 top-3 z-[1000] max-w-[220px] rounded-lg border border-border bg-panel/90 px-3 py-2 text-[10px] leading-normal text-muted backdrop-blur">
          Reporting hotspot — density reflects where people reported, not measured pollution levels.
        </div>
      )}

      {showDemoBanner && (
        <div className="absolute bottom-3 left-1/2 z-[1000] flex w-[92%] max-w-md -translate-x-1/2 items-center gap-3 rounded-lg border border-amber/40 bg-panel/95 px-4 py-2.5 text-xs text-text shadow-lg backdrop-blur">
          <span className="flex-1">
            Showing demo data — submit real reports to see live community data.
          </span>
          <button
            type="button"
            onClick={onDismissDemoBanner}
            aria-label="Dismiss"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(MapView)
