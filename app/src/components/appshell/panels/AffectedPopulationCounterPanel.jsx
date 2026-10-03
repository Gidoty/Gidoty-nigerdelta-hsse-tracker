import { useMemo } from 'react'
import { Users } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import PanelHeader from './shared/PanelHeader.jsx'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { affectedCountValue } from '../../../utils/healthUtils.js'
import { t } from '../../../data/translations.js'
import { TYPE_MARKER_COLORS } from '../../../data/markerColors.js'
import { fmt } from '../../../utils/formatters.js'

const HIGH_IMPACT_THRESHOLD = 20

function monthKey(isoString) {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function AffectedPopulationCounterPanel() {
  const [reports] = useLiveReports()
  const typeLabels = t('en', 'incidentTypes')
  const symptomLabels = t('en', 'symptomsList')

  const totalAffected = reports.reduce((sum, r) => sum + affectedCountValue(r), 0)

  const byType = useMemo(() => {
    const totals = {}
    reports.forEach((r) => {
      const key = r.incident.type
      totals[key] = (totals[key] ?? 0) + affectedCountValue(r)
    })
    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ name: typeLabels[key] ?? key, key, value }))
  }, [reports, typeLabels])

  const byState = useMemo(() => {
    const totals = {}
    reports.forEach((r) => {
      const key = r.location?.state ?? 'Unknown'
      totals[key] = (totals[key] ?? 0) + affectedCountValue(r)
    })
    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [reports])

  const highImpactReports = reports.filter((r) => affectedCountValue(r) > HIGH_IMPACT_THRESHOLD)
  const symptomBreakdown = useMemo(() => {
    const counts = {}
    highImpactReports.forEach((r) => {
      (r.health?.symptoms ?? []).forEach((s) => {
        counts[s] = (counts[s] ?? 0) + 1
      })
    })
    return Object.keys(symptomLabels)
      .map((key) => ({ label: symptomLabels[key], count: counts[key] ?? 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [highImpactReports, symptomLabels])

  const trend = useMemo(() => {
    const totals = {}
    reports.forEach((r) => {
      const key = monthKey(r.submittedAt)
      totals[key] = (totals[key] ?? 0) + affectedCountValue(r)
    })
    return Object.entries(totals)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, value]) => ({ month, value }))
  }, [reports])

  const hasMultiMonthTrend = trend.length > 1

  if (reports.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-muted">
        No reports yet — affected population data will populate once incidents are submitted.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PanelHeader icon={Users} color="#E63946" title="Affected Population Counter" badges={['Self-reported ranges']} />

      <div className="rounded-xl border border-border bg-gradient-to-b from-card to-panel p-6 text-center">
        <p className="text-4xl font-bold text-danger">{fmt.number(totalAffected)}</p>
        <p className="mt-1 text-sm text-muted">Total estimated people affected across all incidents</p>
        <p className="mt-1 text-[11px] text-muted">
          Midpoint estimates: 1–5 → 3 · 6–20 → 13 · 21–100 → 60 · 100+ → 150 · unknown → 0
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-text">Affected People by Incident Type</h3>
          {byType.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No affected-population data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {byType.map((entry) => (
                    <Cell key={entry.key} fill={TYPE_MARKER_COLORS[entry.key] ?? '#8B9EB7'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#162840', border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4F8', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8B9EB7' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-text">Affected People by State</h3>
          {byState.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No affected-population data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byState} margin={{ top: 10, right: 12, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="name" tick={{ fill: '#8B9EB7', fontSize: 10 }} />
                <YAxis tick={{ fill: '#8B9EB7', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#162840', border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4F8', fontSize: 12 }} />
                <Bar dataKey="value" fill="#E63946" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-text">
          Symptom Breakdown — High-Impact Incidents (&gt;{HIGH_IMPACT_THRESHOLD} affected)
        </h3>
        {symptomBreakdown.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No high-impact incidents with reported symptoms yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {symptomBreakdown.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-muted">{s.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-danger"
                    style={{ width: `${(s.count / highImpactReports.length) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-bold text-text">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasMultiMonthTrend && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-bold text-text">Affected Population Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend} margin={{ top: 10, right: 12, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="month" tick={{ fill: '#8B9EB7', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8B9EB7', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#162840', border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4F8', fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#E63946" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
