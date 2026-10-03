import { useMemo } from 'react'
import { FileSpreadsheet, Download } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'
import { exportReportsToCsv, deriveStatus } from '../../../utils/dashboardUtils.js'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { t } from '../../../data/translations.js'

const PREVIEW_ROWS = 8

export default function CsvDataExportPanel() {
  const [allReports] = useLiveReports()
  const reports = useMemo(() => allReports.filter((r) => !r.incident?.isDemoData), [allReports])
  const typeLabels = t('en', 'incidentTypes')

  if (reports.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PanelHeader icon={FileSpreadsheet} color="#06B6D4" title="CSV Data Export" badges={['NDPA 2023 — coarse location only']} />
        <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-border bg-card px-4 text-center text-sm text-muted">
          No reports yet — the export will populate once incidents are submitted.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PanelHeader icon={FileSpreadsheet} color="#06B6D4" title="CSV Data Export" badges={['NDPA 2023 — coarse location only']} />

      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-normal text-muted">
        Exports every community-submitted incident report in the database as a CSV file, suitable for
        analysis in spreadsheet software or GIS tools. In line with the Nigeria Data Protection Act 2023,
        GPS coordinates are rounded to two decimal places (roughly 1 km precision) — never the reporter's
        exact location.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-2xl font-bold text-teal">{reports.length}</p>
          <p className="mt-1 text-xs text-muted">Reports in export</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-2xl font-bold text-teal">14</p>
          <p className="mt-1 text-xs text-muted">Columns exported</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-2xl font-bold text-teal">±2dp</p>
          <p className="mt-1 text-xs text-muted">GPS precision (coarse)</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold text-text">Preview (first {Math.min(PREVIEW_ROWS, reports.length)} rows)</h3>
        <table className="mt-3 w-full min-w-[700px] text-left text-xs">
          <thead>
            <tr className="text-muted">
              <th className="sticky left-0 bg-card pb-2 pr-4 font-medium">Reference</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium">Severity</th>
              <th className="pb-2 pr-4 font-medium">State</th>
              <th className="pb-2 pr-4 font-medium">Lat (2dp)</th>
              <th className="pb-2 pr-4 font-medium">Lng (2dp)</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, PREVIEW_ROWS).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="sticky left-0 bg-card py-2 pr-4 text-text">{r.referenceNumber}</td>
                <td className="py-2 pr-4 text-muted">{typeLabels[r.incident.type] ?? r.incident.type}</td>
                <td className="py-2 pr-4 text-muted">{r.incident.severity}</td>
                <td className="py-2 pr-4 text-muted">{r.location.state ?? '—'}</td>
                <td className="py-2 pr-4 text-muted">{r.location.display?.lat ?? '—'}</td>
                <td className="py-2 pr-4 text-muted">{r.location.display?.lng ?? '—'}</td>
                <td className="py-2 text-muted">{deriveStatus(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => exportReportsToCsv(reports)}
        className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-generate text-sm font-bold text-bg hover:bg-generate/90"
      >
        <Download className="h-4 w-4" />
        Download CSV ({reports.length} reports)
      </button>

      <LegalBasisBadge text="Nigeria Data Protection Act 2023" />
    </div>
  )
}
