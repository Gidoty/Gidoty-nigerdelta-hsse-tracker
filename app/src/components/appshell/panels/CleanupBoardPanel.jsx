import { useMemo, useState } from 'react'
import { Recycle } from 'lucide-react'
import { t } from '../../../data/translations.js'
import { updateReportWithEvent } from '../../../utils/dashboardUtils.js'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { SEVERITY_BADGE_CLASSES, TYPE_MARKER_COLORS } from '../../../data/markerColors.js'
import PanelHeader from './shared/PanelHeader.jsx'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'

const COLUMNS = [
  { id: 'pending', label: 'Pending', accent: 'text-muted', border: 'border-border' },
  { id: 'in_progress', label: 'In Progress', accent: 'text-amber', border: 'border-amber/40' },
  { id: 'completed', label: 'Completed', accent: 'text-safe', border: 'border-safe/40' },
  { id: 'disputed', label: 'Disputed', accent: 'text-danger', border: 'border-danger/40' },
]

function daysSince(isoString) {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / (24 * 60 * 60 * 1000))
}

export default function CleanupBoardPanel() {
  const [reports, setReports] = useLiveReports()
  const [selectedId, setSelectedId] = useState(null)

  const reportsByStatus = useMemo(() => {
    const groups = { pending: [], in_progress: [], completed: [], disputed: [] }
    reports.forEach((r) => {
      const status = r.regulatory?.cleanupStatus ?? 'pending'
      ;(groups[status] ?? groups.pending).push(r)
    })
    return groups
  }, [reports])

  const moveTo = async (reportId, status) => {
    const updated = await updateReportWithEvent(reportId, 'cleanup_status_changed', { status }, (r) => ({
      ...r,
      regulatory: { ...r.regulatory, cleanupStatus: status },
    }))
    setReports(updated)
    setSelectedId(null)
  }

  if (reports.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-muted">
        No reports yet — the cleanup board will populate once incidents are submitted.
      </div>
    )
  }

  return (
    <div>
      <PanelHeader icon={Recycle} color="#FFB703" title="Cleanup Status Board" badges={['Oil Spill Recovery Regulations 2011']} />
      <p className="text-sm text-muted">
        Click a card to select it, then click a column header to move it there.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => {
          const cards = reportsByStatus[column.id]
          return (
            <div key={column.id} className="rounded-xl border border-border bg-panel">
              <button
                type="button"
                onClick={() => selectedId && moveTo(selectedId, column.id)}
                disabled={!selectedId}
                className={`flex w-full items-center justify-between rounded-t-xl border-b-2 px-4 py-3 text-left ${column.border} ${
                  selectedId ? 'cursor-pointer hover:bg-card' : 'cursor-default'
                }`}
              >
                <span className={`text-sm font-bold ${column.accent}`}>{column.label}</span>
                <span className={`rounded-full bg-bg px-2 py-0.5 text-xs font-bold ${column.accent}`}>
                  {cards.length}
                </span>
              </button>

              <div className="space-y-2.5 p-3">
                {cards.length === 0 && <p className="py-4 text-center text-xs text-muted">No reports</p>}
                {cards.map((report) => {
                  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
                  const severityInfo = t('en', 'severityLevels')[report.incident.severity]
                  const selected = selectedId === report.id
                  return (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedId(selected ? null : report.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selected ? 'border-teal bg-teal/10' : 'border-border bg-card hover:border-teal/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: TYPE_MARKER_COLORS[report.incident.type] }}
                        />
                        <span className="text-xs font-bold text-text">{typeLabel}</span>
                        <span className="ml-auto text-[10px] text-teal">{report.referenceNumber}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">
                        {[report.location.state, report.location.lga].filter(Boolean).join(' · ') || 'Unknown location'}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            SEVERITY_BADGE_CLASSES[report.incident.severity]
                          }`}
                        >
                          {severityInfo?.label ?? report.incident.severity}
                        </span>
                        <span className="text-[10px] text-muted">
                          {daysSince(report.submittedAt)} day{daysSince(report.submittedAt) === 1 ? '' : 's'} ago
                        </span>
                      </div>
                      {selected && (
                        <p className="mt-2 text-[10px] font-bold text-teal">Selected — click a column to move</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <LegalBasisBadge text="Oil Spill Recovery, Clean-up, Remediation and Damage Assessment Regulations 2011, Section 5" />
    </div>
  )
}
