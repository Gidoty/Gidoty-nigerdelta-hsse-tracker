import { Download } from 'lucide-react'
import { t } from '../../data/translations.js'
import { hoursSince, formatElapsed, exportEscalationCsv, isAwaitingOperatorResponse } from '../../utils/trackerUtils.js'
import { fmt } from '../../utils/formatters.js'

function rowClass(report) {
  if (report.regulatory?.cleanupStatus === 'completed') return 'bg-safe/10'
  if (report.regulatory?.jivScheduled || report.regulatory?.cleanupStatus === 'in_progress') return 'bg-amber/10'
  if (isAwaitingOperatorResponse(report)) return 'bg-danger/10'
  if (!report.regulatory?.nosdraNotified) return 'bg-panel'
  return ''
}

export default function EscalationTable({ reports }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">Escalation Log</h2>
        <button
          type="button"
          onClick={() => exportEscalationCsv(reports)}
          className="flex min-h-[40px] items-center gap-2 rounded-lg border border-teal px-3 text-xs font-bold text-teal hover:bg-teal/10"
        >
          <Download className="h-3.5 w-3.5" />
          Export as CSV
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">
        No full GPS coordinates are included in the export — display locations only (NDPA 2023).
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-panel text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Reference</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Severity</th>
              <th className="px-3 py-2 font-medium">Location</th>
              <th className="px-3 py-2 font-medium">Reported</th>
              <th className="px-3 py-2 font-medium">NOSDRA Notified</th>
              <th className="px-3 py-2 font-medium">JIV Status</th>
              <th className="px-3 py-2 font-medium">Cleanup</th>
              <th className="px-3 py-2 font-medium">Elapsed</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const hours = hoursSince(report.regulatory?.nosdraNotifiedAt)
              const jivStatus = report.regulatory?.jivCompleted
                ? 'Completed'
                : report.regulatory?.jivScheduled
                  ? 'Scheduled'
                  : 'Not scheduled'
              return (
                <tr key={report.id} className={`border-t border-border ${rowClass(report)}`}>
                  <td className="px-3 py-2 font-mono text-text">{report.referenceNumber}</td>
                  <td className="px-3 py-2 text-text">{t('en', 'incidentTypes')[report.incident.type]}</td>
                  <td className="px-3 py-2 text-text">{t('en', 'severityLevels')[report.incident.severity]?.label}</td>
                  <td className="px-3 py-2 text-text">
                    {[report.location.state, report.location.lga].filter(Boolean).join(' · ')}
                  </td>
                  <td className="px-3 py-2 text-muted">{fmt.datetime(report.submittedAt)}</td>
                  <td className="px-3 py-2 text-text">{report.regulatory?.nosdraNotified ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2 text-text">{jivStatus}</td>
                  <td className="px-3 py-2 capitalize text-text">
                    {(report.regulatory?.cleanupStatus ?? 'pending').replace('_', ' ')}
                  </td>
                  <td className="px-3 py-2 text-muted">{hours === null ? '—' : formatElapsed(hours)}</td>
                </tr>
              )
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-muted">
                  No reports to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
