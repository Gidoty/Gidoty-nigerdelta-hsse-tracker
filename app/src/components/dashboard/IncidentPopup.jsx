import { useState } from 'react'
import { ShieldCheck, Stethoscope } from 'lucide-react'
import { t } from '../../data/translations.js'
import { deriveStatus } from '../../utils/dashboardUtils.js'
import { evidenceStatusLabel, evidenceStatusLevel, EVIDENCE_STATUS } from '../../utils/evidenceStatus.js'
import { TYPE_MARKER_COLORS, SEVERITY_BADGE_CLASSES } from '../../data/markerColors.js'
import { fmt } from '../../utils/formatters.js'

const STATUS_LABELS = {
  submitted: 'Submitted',
  nosdra_notified: 'NOSDRA Notified',
  resolved: 'Resolved',
}

export default function IncidentPopup({ report }) {
  const [expanded, setExpanded] = useState(false)
  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
  const severityInfo = t('en', 'severityLevels')[report.incident.severity]
  const description = report.incident.description ?? ''
  const excerpt =
    expanded || description.length <= 100 ? description : `${description.slice(0, 100)}...`
  const status = deriveStatus(report)
  const isDemo = Boolean(report.incident.isDemoData)

  return (
    <div className="w-64 text-sm">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: TYPE_MARKER_COLORS[report.incident.type] }}
        />
        <span className="flex-1 font-bold text-text">{typeLabel}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            SEVERITY_BADGE_CLASSES[report.incident.severity]
          }`}
        >
          {severityInfo?.label ?? report.incident.severity}
        </span>
      </div>

      <div className="mt-2 space-y-1.5 text-xs text-muted">
        <p>📅 {fmt.datetime(report.incident.dateTime)}</p>
        {report.location.display && (
          <p>
            📍 {report.location.display.lat}°N, {report.location.display.lng}°E
          </p>
        )}
        {(report.location.state || report.location.lga) && (
          <p>
            🏛 {report.location.state}
            {report.location.lga ? ` · ${report.location.lga}` : ''}
          </p>
        )}
        <p className="text-text">📝 {excerpt}</p>

        {evidenceStatusLevel(report) !== EVIDENCE_STATUS.COMMUNITY_OBSERVED && (
          <p className="flex items-center gap-1 font-medium text-safe">
            <ShieldCheck className="h-3.5 w-3.5" /> {evidenceStatusLabel(report)}
          </p>
        )}
        {report.health?.healthImpact && (
          <p className="flex items-center gap-1 font-medium text-warning">
            <Stethoscope className="h-3.5 w-3.5" /> Health impact reported
          </p>
        )}

        <p>
          Status: <span className="font-medium text-text">{STATUS_LABELS[status]}</span>
        </p>
        <p className="text-[10px] text-muted">
          Reference: {report.referenceNumber}
          {isDemo && ' (demo data)'}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {description.length > 100 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="rounded-md border border-teal px-2 py-1.5 text-[11px] font-bold text-teal hover:bg-teal/10"
          >
            {expanded ? 'Less' : 'Full Details'}
          </button>
        )}
      </div>
    </div>
  )
}
