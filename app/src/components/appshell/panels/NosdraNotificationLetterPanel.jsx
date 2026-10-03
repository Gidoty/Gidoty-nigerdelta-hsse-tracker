import { useState } from 'react'
import { Bell, Copy, Download, CheckCircle2 } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'
import { updateReportWithEvent } from '../../../utils/dashboardUtils.js'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { generateNosdraNotificationText } from '../../../utils/trackerUtils.js'
import { fmt } from '../../../utils/formatters.js'

function NotificationEditor({ report, onMarkNotified }) {
  const [estimatedSpillOccurredAt, setEstimatedSpillOccurredAt] = useState('')
  const [text, setText] = useState(() => generateNosdraNotificationText(report))
  const [message, setMessage] = useState('')

  const handleSpillTimeChange = (value) => {
    setEstimatedSpillOccurredAt(value)
    setText(generateNosdraNotificationText(report, value ? new Date(value).toISOString() : null))
  }

  const flash = (msg) => {
    setMessage(msg)
    window.setTimeout(() => setMessage(''), 3000)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      flash('Copied! Send via email or WhatsApp to NOSDRA.')
    } catch {
      flash('Could not copy — select and copy the text manually.')
    }
  }

  return (
    <>
      <label className="mt-4 block text-xs font-medium text-text" htmlFor="nosdra-letter-spill-occurred">
        Estimated time the spill occurred (optional — your best estimate, not confirmed)
      </label>
      <input
        id="nosdra-letter-spill-occurred"
        type="datetime-local"
        value={estimatedSpillOccurredAt}
        onChange={(e) => handleSpillTimeChange(e.target.value)}
        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-amber focus:outline-none print:hidden"
      />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={16}
        className="mt-4 w-full rounded-lg border border-border bg-bg p-3 font-mono text-[11px] leading-normal text-text focus:border-amber focus:outline-none"
      />

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 print:hidden">
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-amber text-xs font-bold text-amber hover:bg-amber/10"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy to Clipboard
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-muted hover:text-text"
        >
          <Download className="h-3.5 w-3.5" />
          Download as PDF
        </button>
        <button
          type="button"
          onClick={() => {
            onMarkNotified(report.id, estimatedSpillOccurredAt ? new Date(estimatedSpillOccurredAt).toISOString() : null)
            flash(`${report.referenceNumber} marked as NOSDRA-notified.`)
          }}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-amber text-xs font-bold text-bg hover:bg-amber/90"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mark as Notified
        </button>
      </div>
      {message && <p className="mt-2 text-xs font-medium text-safe">{message}</p>}
    </>
  )
}

export default function NosdraNotificationLetterPanel() {
  const [reports, setReports] = useLiveReports()
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? '')
  const selectedReport = reports.find((r) => r.id === selectedId)

  const handleMarkNotified = async (reportId, estimatedSpillOccurredAt) => {
    const notifiedAt = new Date().toISOString()
    const updated = await updateReportWithEvent(reportId, 'nosdra_notified', { notifiedAt, estimatedSpillOccurredAt }, (report) => ({
      ...report,
      regulatory: { ...report.regulatory, nosdraNotified: true, nosdraNotifiedAt: notifiedAt, estimatedSpillOccurredAt },
    }))
    setReports(updated)
  }

  if (reports.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-muted">
        No reports yet — submit an incident to generate a NOSDRA notification.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PanelHeader icon={Bell} color="#F4A261" title="NOSDRA Notification Generator" badges={['NOSDRA Act 2006', 'Oil Spill Regulations 2011']} />

      <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="nosdra-report-select">
        Select Report
      </label>
      <select
        id="nosdra-report-select"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-amber focus:outline-none"
      >
        {reports.map((r) => (
          <option key={r.id} value={r.id}>
            {r.referenceNumber} · {r.location.state ?? 'Unknown'} · {fmt.datetime(r.submittedAt)}
            {r.regulatory?.nosdraNotified ? ' · already notified' : ''}
          </option>
        ))}
      </select>

      {selectedReport && (
        <NotificationEditor key={selectedReport.id} report={selectedReport} onMarkNotified={handleMarkNotified} />
      )}

      <div className="mt-6 rounded-lg bg-panel p-4 text-xs text-muted print:hidden">
        <p className="font-bold text-text">NOSDRA Contact</p>
        <p className="mt-1">Website: nosdra.gov.ng</p>
        <p>Email: info@nosdra.gov.ng</p>
        <p>Hotline: 0800-2000-000</p>
        <p>Address: 7 Zambezi Crescent, Maitama, Abuja</p>
        <p className="mt-2 text-[11px]">
          If phone lines are unreachable, many state NOSDRA offices also accept incident reports via
          WhatsApp — check nosdra.gov.ng for the current number for your state.
        </p>
      </div>

      <LegalBasisBadge text="Oil Spill Recovery, Clean-up, Remediation and Damage Assessment Regulations 2011, Section 5" />
    </div>
  )
}
