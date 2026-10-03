import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { Thermometer, MapPin, Waves, Target } from 'lucide-react'

const NIGER_DELTA_BOUNDS = [
  [3.8, 4.5],
  [6.5, 9.5],
]

export default function MapControls({ layers, onToggleLayer }) {
  const map = useMap()
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!wrapperRef.current) return
    L.DomEvent.disableClickPropagation(wrapperRef.current)
    L.DomEvent.disableScrollPropagation(wrapperRef.current)
  }, [])

  const toggles = [
    { key: 'heatmap', label: 'Heatmap', icon: Thermometer },
    { key: 'markers', label: 'Markers', icon: MapPin },
    { key: 'boundary', label: 'Boundary', icon: Waves },
  ]

  return (
    <div
      ref={wrapperRef}
      className="absolute right-3 top-3 z-[1000] flex flex-col gap-1.5 rounded-lg border border-border bg-panel/95 p-2 shadow-lg backdrop-blur"
    >
      {toggles.map((toggle) => {
        const Icon = toggle.icon
        const active = layers[toggle.key]
        return (
          <button
            key={toggle.key}
            type="button"
            onClick={() => onToggleLayer(toggle.key)}
            className={`flex min-h-[40px] items-center gap-2 rounded-md px-2.5 text-xs font-medium transition-colors ${
              active ? 'bg-teal text-white' : 'bg-card text-muted hover:text-text'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {toggle.label}
          </button>
        )
      })}
      <button
        type="button"
        onClick={() => map.flyToBounds(NIGER_DELTA_BOUNDS, { duration: 0.8 })}
        className="flex min-h-[40px] items-center gap-2 rounded-md border border-teal px-2.5 text-xs font-bold text-teal hover:bg-teal/10"
      >
        <Target className="h-3.5 w-3.5" />
        Niger Delta
      </button>
    </div>
  )
}
