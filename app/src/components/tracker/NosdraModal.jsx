import { useState } from 'react'
import { X, Copy, Printer, CheckCircle2 } from 'lucide-react'
import { t } from '../../data/translations.js'
import { generateNosdraNotificationText } from '../../utils/trackerUtils.js'
import { fmt } from '../../utils/formatters.js'

export default function NosdraModal({ report, onClose, onMarkNotified }) {
  const [copied, setCopied] = useState(false)
  const [estimatedSpillOccurredAt, setEstimatedSpillOccurredAt] = useState('')
  const notificationText = generateNosdraNotificationText(
    report,
    estimatedSpillOccurredAt ? new Date(estimatedSpillOccurredAt).toISOString() : null,
  )
  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
  const severityLabel = t('en', 'severityLevels')[report.incident.severity]?.label ?? report.incident.severity
  const location = [report.location.state, report.location.lga].filter(Boolean).join(' · ')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notificationText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 print:hidden">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-text">Generate NOSDRA Notification</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-panel p-3 text-xs text-muted">
          <p className="font-bold text-text">
            {report.referenceNumber} · {typeLabel} · {severityLabel}
          </p>
          {location && <p className="mt-1">{location}</p>}
          <p className="mt-1">{fmt.datetime(report.submittedAt)}</p>
        </div>

        <label className="mt-4 block text-xs font-medium text-text" htmlFor="nosdra-spill-occurred">
          Estimated time the spill occurred (optional — your best estimate, not confirmed)
        </label>
        <input
          id="nosdra-spill-occurred"
          type="datetime-local"
          value={estimatedSpillOccurredAt}
          onChange={(e) => setEstimatedSpillOccurredAt(e.target.value)}
          className="mt-1.5 min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
        />

        <textarea
          readOnly
          value={notificationText}
          rows={12}
          className="mt-4 w-full rounded-lg border border-border bg-bg p-3 font-mono text-[11px] leading-normal text-text focus:border-teal focus:outline-none"
        />

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-teal text-xs font-bold text-teal hover:bg-teal/10"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Notification Text
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-muted hover:text-text"
          >
            <Printer className="h-3.5 w-3.5" />
            Download as PDF
          </button>
          <button
            type="button"
            onClick={() =>
              onMarkNotified(report.id, estimatedSpillOccurredAt ? new Date(estimatedSpillOccurredAt).toISOString() : null)
            }
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-teal text-xs font-bold text-white hover:bg-teal/90"
          >
            Mark as Notified
          </button>
        </div>
        {copied && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-safe">
            <CheckCircle2 className="h-3.5 w-3.5" /> Copied! Send via email or WhatsApp to NOSDRA
          </p>
        )}

        <div className="mt-4 rounded-lg bg-panel p-3 text-xs text-muted">
          <p className="font-bold text-text">NOSDRA Contact:</p>
          <p className="mt-1">Website: nosdra.gov.ng</p>
          <p>Email: info@nosdra.gov.ng</p>
          <p>Hotline: 0800-2000-000</p>
          <p>Address: 7 Zambezi Crescent, Maitama, Abuja</p>
        </div>

          <p className="mt-4 text-[11px] text-muted">
            This notification template is provided for community use. The NigerDelta HSSE Tracker
            does not transmit data to NOSDRA directly. Community members are responsible for
            submitting this notification through official NOSDRA channels.
          </p>
        </div>
      </div>

      <div className="hidden print:block">
        <pre className="whitespace-pre-wrap font-mono text-xs text-black">{notificationText}</pre>
      </div>
    </>
  )
}
