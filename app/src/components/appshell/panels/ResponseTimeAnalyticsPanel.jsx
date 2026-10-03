import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { Timer, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import PanelHeader from './shared/PanelHeader.jsx'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'

const LEGAL_THRESHOLD_HOURS = 24

function notificationHours(report) {
  if (!report.regulatory?.nosdraNotified || !report.regulatory?.nosdraNotifiedAt) return null
  return (new Date(report.regulatory.nosdraNotifiedAt) - new Date(report.submittedAt)) / (1000 * 60 * 60)
}

function isOverdue(report) {
  const hours = notificationHours(report)
  if (hours !== null) return hours > LEGAL_THRESHOLD_HOURS
  const ageHours = (Date.now() - new Date(report.submittedAt).getTime()) / (1000 * 60 * 60)
  return ageHours > LEGAL_THRESHOLD_HOURS
}

function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-bg ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className={`mt-3 text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  )
}

export default function ResponseTimeAnalyticsPanel() {
  const [reports] = useLiveReports()

  const notificationTimes = useMemo(
    () =>
      reports
        .filter((r) => r.regulatory?.nosdraNotified)
        .map((r) => ({
          reference: r.referenceNumber,
          hours: Math.round(notificationHours(r) * 10) / 10,
        })),
    [reports],
  )

  const { avgHours, within24h, overdueCount } = useMemo(
    () => ({
      avgHours:
        notificationTimes.length > 0
          ? notificationTimes.reduce((sum, r) => sum + r.hours, 0) / notificationTimes.length
          : 0,
      within24h: notificationTimes.filter((r) => r.hours <= LEGAL_THRESHOLD_HOURS).length,
      overdueCount: reports.filter(isOverdue).length,
    }),
    [notificationTimes, reports],
  )

  if (reports.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-muted">
        No reports yet — response time analytics will populate once incidents are submitted.
      </div>
    )
  }

  return (
    <div>
      <PanelHeader icon={Timer} color="#F4A261" title="Response Time Analytics" badges={['NOSDRA Act 2006']} />
      <p className="text-sm text-muted">
        Time from report submission to NOSDRA notification, benchmarked against the 24-hour legal
        threshold.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Timer}
          label="Average Notification Time"
          value={notificationTimes.length > 0 ? `${avgHours.toFixed(1)} hrs` : '—'}
          accent="text-teal"
        />
        <MetricCard icon={CheckCircle2} label="Reports Within 24h Window" value={within24h} accent="text-safe" />
        <MetricCard icon={AlertTriangle} label="Overdue Reports" value={overdueCount} accent="text-danger" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-text">Notification Time by Report</h2>
        {notificationTimes.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No NOSDRA-notified reports yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={notificationTimes} margin={{ top: 10, right: 12, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="reference" tick={{ fill: '#8B9EB7', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8B9EB7', fontSize: 11 }} label={{ value: 'hours', fill: '#8B9EB7', fontSize: 11, angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#162840', border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4F8', fontSize: 12 }}
              />
              <ReferenceLine
                y={LEGAL_THRESHOLD_HOURS}
                stroke="#F4A261"
                strokeDasharray="6 4"
                label={{ value: 'NOSDRA 24h legal threshold', fill: '#F4A261', fontSize: 11, position: 'insideTopRight' }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {notificationTimes.map((entry) => (
                  <Cell key={entry.reference} fill={entry.hours > LEGAL_THRESHOLD_HOURS ? '#E63946' : '#2DC653'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <LegalBasisBadge text="NOSDRA Act 2006 — 24-hour operator response obligation" />
    </div>
  )
}
