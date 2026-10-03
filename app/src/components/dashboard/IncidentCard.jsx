import { ShieldCheck, Stethoscope } from 'lucide-react'
import { t } from '../../data/translations.js'
import { deriveStatus, formatTimeAgo } from '../../utils/dashboardUtils.js'
import { evidenceStatusLabel, evidenceStatusLevel, EVIDENCE_STATUS } from '../../utils/evidenceStatus.js'
import { TYPE_MARKER_COLORS, SEVERITY_BADGE_CLASSES } from '../../data/markerColors.js'

const STATUS_LABELS = {
  submitted: 'Submitted',
  nosdra_notified: 'NOSDRA Notified',
  resolved: 'Resolved',
}

export default function IncidentCard({ report, onClick }) {
  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
  const severityInfo = t('en', 'severityLevels')[report.incident.severity]
  const description = report.incident.description ?? ''
  const excerpt = description.length > 80 ? `${description.slice(0, 80)}...` : description
  const status = deriveStatus(report)
  const location = [report.location.state, report.location.lga].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-3.5 text-left transition-shadow hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: TYPE_MARKER_COLORS[report.incident.type] }}
        />
        <span className="flex-1 text-sm font-bold text-text">{typeLabel}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            SEVERITY_BADGE_CLASSES[report.incident.severity]
          }`}
        >
          {severityInfo?.label ?? report.incident.severity}
        </span>
      </div>

      {location && <p className="mt-1.5 text-xs text-muted">{location}</p>}
      <p className="mt-0.5 text-[11px] text-muted">{formatTimeAgo(report.submittedAt)}</p>
      {excerpt && <p className="mt-1.5 text-xs text-text">{excerpt}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2 text-[11px] text-muted">
        {evidenceStatusLevel(report) !== EVIDENCE_STATUS.COMMUNITY_OBSERVED && (
          <span className="flex items-center gap-1 text-safe">
            <ShieldCheck className="h-3 w-3" /> {evidenceStatusLabel(report)}
          </span>
        )}
        {report.health?.healthImpact && (
          <span className="flex items-center gap-1 text-warning">
            <Stethoscope className="h-3 w-3" /> Health impact
          </span>
        )}
        <span className="ml-auto font-medium text-text">{STATUS_LABELS[status]}</span>
      </div>
    </button>
  )
}
