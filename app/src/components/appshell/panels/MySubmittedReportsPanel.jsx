import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Camera, Stethoscope, ShieldCheck } from 'lucide-react'
import { t } from '../../../data/translations.js'
import { fmt } from '../../../utils/formatters.js'
import { sortReports, deriveStatus } from '../../../utils/dashboardUtils.js'
import { evidenceStatusLabel, evidenceStatusLevel, EVIDENCE_STATUS } from '../../../utils/evidenceStatus.js'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { SEVERITY_BADGE_CLASSES, TYPE_MARKER_COLORS } from '../../../data/markerColors.js'
import ReportDetailModal from '../ReportDetailModal.jsx'
import PanelHeader from './shared/PanelHeader.jsx'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'severity', label: 'Severity' },
]

const PIPELINE_STAGES = ['Submitted', 'Notified', 'JIV', 'Resolved']

function pipelineFilledCount(report) {
  const status = deriveStatus(report)
  const order = { submitted: 1, nosdra_notified: 2, resolved: 4 }
  if (report.regulatory?.jivCompleted) return 3
  return order[status] ?? 1
}

function ReportListCard({ report, onView }) {
  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
  const severityInfo = t('en', 'severityLevels')[report.incident.severity]
  const excerpt = (report.incident.description ?? '').slice(0, 120)
  const filled = pipelineFilledCount(report)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: TYPE_MARKER_COLORS[report.incident.type] }}
        />
        <span className="text-sm font-bold text-text">{typeLabel}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            SEVERITY_BADGE_CLASSES[report.incident.severity]
          }`}
        >
          {severityInfo?.label ?? report.incident.severity}
        </span>
        <span className="ml-auto text-xs font-medium text-teal">{report.referenceNumber}</span>
      </div>

      <p className="mt-2 text-xs text-muted">
        📍 {[report.location.state, report.location.lga].filter(Boolean).join(' · ') || 'Location not specified'}
      </p>
      <p className="mt-0.5 text-xs text-muted">📅 {fmt.datetime(report.submittedAt)}</p>
      {excerpt && <p className="mt-1.5 text-xs text-text">📝 {excerpt}{report.incident.description?.length > 120 ? '...' : ''}</p>}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        {report.evidence?.photoCount > 0 && (
          <span className="flex items-center gap-1">
            <Camera className="h-3 w-3" /> {report.evidence.photoCount} photo{report.evidence.photoCount === 1 ? '' : 's'}
          </span>
        )}
        {report.health?.healthImpact && (
          <span className="flex items-center gap-1 text-warning">
            <Stethoscope className="h-3 w-3" /> Health impact
          </span>
        )}
        {evidenceStatusLevel(report) !== EVIDENCE_STATUS.COMMUNITY_OBSERVED && (
          <span className="flex items-center gap-1 text-safe">
            <ShieldCheck className="h-3 w-3" /> {evidenceStatusLabel(report)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          {PIPELINE_STAGES.map((stage, index) => (
            <span
              key={stage}
              title={stage}
              className={`h-2 w-2 rounded-full ${index < filled ? 'bg-teal' : 'border border-border bg-transparent'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onView}
          className="rounded-full border border-teal px-3 py-1 text-xs font-bold text-teal hover:bg-teal/10"
        >
          View Full Report
        </button>
      </div>
    </div>
  )
}

export default function MySubmittedReportsPanel() {
  const [reports, setReports] = useLiveReports()
  const [sortBy, setSortBy] = useState('newest')
  const [viewingId, setViewingId] = useState(null)

  const sorted = useMemo(() => sortReports(reports, sortBy), [reports, sortBy])
  const viewing = sorted.find((r) => r.id === viewingId)

  if (reports.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ClipboardList className="h-16 w-16 text-muted" />
        <h1 className="mt-5 text-xl font-bold text-text">No reports submitted yet</h1>
        <p className="mt-2 text-sm text-muted">Submit your first incident report to see it here.</p>
        <Link
          to="/report"
          className="mt-5 flex min-h-[48px] items-center justify-center rounded-lg bg-teal px-6 text-sm font-bold text-white hover:bg-teal/90"
        >
          Submit Report
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PanelHeader icon={ClipboardList} color="#00A8CC" title="My Submitted Reports" />
      <div className="flex items-center justify-end gap-1.5 text-xs">
        <span className="text-muted">Sort by:</span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSortBy(option.id)}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
              sortBy === option.id ? 'bg-teal text-white' : 'text-muted hover:text-text'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {sorted.map((report) => (
          <ReportListCard key={report.id} report={report} onView={() => setViewingId(report.id)} />
        ))}
      </div>

      {viewing && (
        <ReportDetailModal
          report={viewing}
          onClose={() => setViewingId(null)}
          onReportsChanged={(updated) => setReports(updated)}
        />
      )}
    </div>
  )
}
