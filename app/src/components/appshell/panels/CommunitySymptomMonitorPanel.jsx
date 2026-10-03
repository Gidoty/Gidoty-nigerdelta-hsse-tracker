import { useMemo } from 'react'
import { Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import PanelHeader from './shared/PanelHeader.jsx'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { affectedCountValue, isHealthImpactReport } from '../../../utils/healthUtils.js'
import { t } from '../../../data/translations.js'
import { WHO_AQG_POLLUTANTS } from '../../../data/whoAqgData.js'
import { fmt } from '../../../utils/formatters.js'

const SYMPTOM_COLORS = ['#E63946', '#F4A261', '#FFB703', '#00A8CC', '#2DC653', '#9D4EDD', '#3A86FF', '#D95F02', '#8B9EB7']

export default function CommunitySymptomMonitorPanel() {
  const [reports] = useLiveReports()
  const healthReports = useMemo(() => reports.filter(isHealthImpactReport), [reports])

  const symptomLabels = t('en', 'symptomsList')
  const symptomCounts = useMemo(() => {
    const counts = {}
    healthReports.forEach((report) => {
      (report.health?.symptoms ?? []).forEach((symptom) => {
        counts[symptom] = (counts[symptom] ?? 0) + 1
      })
    })
    return Object.keys(symptomLabels)
      .map((key) => ({ key, label: symptomLabels[key], count: counts[key] ?? 0 }))
      .sort((a, b) => b.count - a.count)
  }, [healthReports, symptomLabels])

  const totalAffected = healthReports.reduce((sum, r) => sum + affectedCountValue(r), 0)
  const mostReported = symptomCounts.find((s) => s.count > 0)

  const mapReports = healthReports.filter((r) => r.location?.gps)

  if (reports.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-muted">
        No reports yet — the symptom monitor will populate once incidents are submitted.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PanelHeader icon={Activity} color="#E63946" title="Community Health Symptom Monitor" badges={['WHO 2021 AQG']} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-2xl font-bold text-danger">{healthReports.length}</p>
          <p className="mt-1 text-xs text-muted">Health-impact reports</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-2xl font-bold text-danger">{fmt.number(totalAffected)}</p>
          <p className="mt-1 text-xs text-muted">Estimated people affected</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-2xl font-bold text-danger">{mostReported ? mostReported.label : '—'}</p>
          <p className="mt-1 text-xs text-muted">Most-reported symptom</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-text">Reported Symptoms Across All Incidents</h3>
        {healthReports.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No health-impact reports yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={symptomCounts} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis type="number" tick={{ fill: '#8B9EB7', fontSize: 11 }} allowDecimals={false} />
              <YAxis dataKey="label" type="category" width={160} tick={{ fill: '#8B9EB7', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#162840', border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4F8', fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {symptomCounts.map((entry, idx) => (
                  <Cell key={entry.key} fill={SYMPTOM_COLORS[idx % SYMPTOM_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-bold text-text">Health-Impact Report Locations</h3>
        </div>
        <div style={{ height: 300 }} className="relative z-0">
          <MapContainer center={[5.5, 6.5]} zoom={7} minZoom={6} maxZoom={14} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {mapReports.map((report) => (
              <CircleMarker
                key={report.id}
                center={[report.location.gps.lat, report.location.gps.lng]}
                radius={Math.max(6, Math.min(24, affectedCountValue(report) / 4 + 6))}
                pathOptions={{ color: '#E63946', weight: 1.5, fillColor: '#E63946', fillOpacity: 0.7 }}
              >
                <Popup>
                  <p className="font-bold">{report.referenceNumber}</p>
                  <p>{report.health?.affectedCount ?? 'unknown'} affected</p>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        {mapReports.length === 0 && (
          <p className="p-4 text-xs text-muted">No geolocated health-impact reports yet.</p>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-text">WHO Guideline Comparison</h3>
        <table className="mt-3 w-full min-w-[500px] text-left text-xs">
          <thead>
            <tr className="text-muted">
              <th className="sticky left-0 bg-card pb-2 font-medium">Pollutant</th>
              <th className="pb-2 font-medium">WHO Guideline</th>
              <th className="pb-2 font-medium">Niger Delta Documented Context</th>
            </tr>
          </thead>
          <tbody>
            {WHO_AQG_POLLUTANTS.map((p) => (
              <tr key={p.id} className="border-t border-border align-top">
                <td className="sticky left-0 bg-card py-2 font-bold text-text">{p.name}</td>
                <td className="py-2 text-muted">{p.guideline}</td>
                <td className="py-2 text-muted">
                  {p.nigerDeltaContext}
                  <span className="mt-0.5 block text-[10px] italic text-muted/70">{p.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
