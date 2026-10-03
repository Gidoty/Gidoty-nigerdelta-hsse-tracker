import { useState } from 'react'
import { Copy, Printer, CheckCircle2 } from 'lucide-react'
import { NIGER_DELTA_STATES } from '../../data/incidentTypes.js'
import { generateFoiRequestText } from '../../utils/trackerUtils.js'

export default function FoiGenerator() {
  const [state, setState] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [copied, setCopied] = useState(false)

  const text = generateFoiRequestText({ state, dateFrom, dateTo, referenceNumber, name, contact })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 print:border-0 print:bg-transparent">
      <div className="print:hidden">
        <h2 className="text-lg font-bold text-text">Freedom of Information Request</h2>
        <p className="mt-1 text-sm text-muted">
          Under the Freedom of Information Act 2011, citizens have the right to request
          environmental data from NOSDRA and other public institutions.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-state">
              State
            </label>
            <select
              id="foi-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
            >
              <option value="">Select a state</option>
              {NIGER_DELTA_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-reference">
              Reference number (optional)
            </label>
            <input
              id="foi-reference"
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-from">
              Date range from
            </label>
            <input
              id="foi-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-to">
              Incident date (or to)
            </label>
            <input
              id="foi-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-name">
              Your name (optional)
            </label>
            <input
              id="foi-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-contact">
              Contact (optional)
            </label>
            <input
              id="foi-contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
            />
          </div>
        </div>

        <textarea
          readOnly
          value={text}
          rows={14}
          className="mt-4 w-full rounded-lg border border-border bg-bg p-3 font-mono text-[11px] leading-normal text-text focus:border-teal focus:outline-none"
        />

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-teal text-xs font-bold text-teal hover:bg-teal/10"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy FOI Request
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-muted hover:text-text"
          >
            <Printer className="h-3.5 w-3.5" />
            Download FOI Request
          </button>
        </div>
        {copied && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-safe">
            <CheckCircle2 className="h-3.5 w-3.5" /> Copied to clipboard
          </p>
        )}
      </div>

      <div className="hidden print:block">
        <pre className="whitespace-pre-wrap font-mono text-xs text-black">{text}</pre>
      </div>
    </div>
  )
}
