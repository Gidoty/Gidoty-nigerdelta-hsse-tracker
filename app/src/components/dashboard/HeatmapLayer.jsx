import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

const GRADIENT = {
  0.0: '#00A8CC',
  0.4: '#FFB703',
  0.7: '#F4A261',
  1.0: '#E63946',
}

export default function HeatmapLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return undefined

    const layer = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 14,
      max: 1.0,
      gradient: GRADIENT,
    })
    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map, points])

  return null
}
