import { useMemo, useState } from 'react'
import { ScrollText, Copy, Download, CheckCircle2 } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'
import { NIGER_DELTA_STATES } from '../../../data/incidentTypes.js'
import { fmt } from '../../../utils/formatters.js'

const INSTITUTIONS = [
  { id: 'nosdra', label: 'NOSDRA', address: 'National Oil Spill Detection and Response Agency\n7 Zambezi Crescent, Maitama, Abuja' },
  { id: 'nuprc', label: 'NUPRC', address: 'Nigerian Upstream Petroleum Regulatory Commission\nCentral Business District, Abuja' },
  { id: 'nmdpra', label: 'NMDPRA', address: 'Nigerian Midstream and Downstream Petroleum Regulatory Authority\nCentral Business District, Abuja' },
  { id: 'fmenv', label: 'Federal Ministry of Environment', address: 'Federal Ministry of Environment\nFederal Secretariat, Mabushi, Abuja' },
  { id: 'other', label: 'Other', address: '' },
]

const REQUEST_ITEMS = [
  { id: 'incident_records', label: 'All incident/oil spill records for the specified state and date range' },
  { id: 'jiv_report', label: 'JIV report for specific incident, by reference number' },
  { id: 'operator_response', label: 'Operator notification and response records' },
  { id: 'flare_data', label: 'Gas flaring volume and flare permit data' },
  { id: 'cleanup_status', label: 'Cleanup and remediation status records' },
  { id: 'corroboration_records', label: 'Community corroboration / witness statement records on file' },
  { id: 'eia_reports', label: 'Environmental Impact Assessment (EIA) reports for the area' },
]

function generateFoiText({ institution, otherInstitution, state, dateFrom, dateTo, referenceNumber, requests, name, contact }) {
  const target = institution.id === 'other' ? otherInstitution || '[Institution name and address]' : institution.address

  const requestLines = REQUEST_ITEMS.filter((item) => requests.has(item.id))
    .map((item, idx) => {
      if (item.id === 'incident_records') {
        return `${idx + 1}. All incident/oil spill records for ${state || '[State]'} from ${dateFrom || '[start date]'} to ${dateTo || 'present'}, including location, volume, cause classification, and JIV completion status.`
      }
      if (item.id === 'jiv_report') {
        return `${idx + 1}. The Joint Investigation Visit (JIV) report for the incident referenced ${referenceNumber || '[reference number]'}.`
      }
      return `${idx + 1}. ${item.label}, for ${state || '[State]'} within the above date range${referenceNumber ? `, reference ${referenceNumber}` : ''}.`
    })

  return `FREEDOM OF INFORMATION REQUEST
Date: ${fmt.datetime(new Date().toISOString())}

To: The Director General / Head of Records
${target}

Pursuant to Section 4 of the Freedom of Information Act 2011, I hereby request the following information:

${requestLines.length > 0 ? requestLines.join('\n\n') : '[Select at least one item below to populate this request]'}

I note that under Section 4 of the FoI Act, public institutions shall respond within 7 days of receiving this request. Where the request is denied in whole or in part, I request that the institution state the specific grounds for denial in writing, as required under Section 7.

Submitted by: ${name || '[name field — optional]'}
Contact: ${contact || '[contact field — optional]'}

Prepared by the reporter using NigerDelta HSSE Tracker. This is not an official NOSDRA document.`
}

export default function FoiRequestDocumentPanel() {
  const [institutionId, setInstitutionId] = useState('nosdra')
  const [otherInstitution, setOtherInstitution] = useState('')
  const [state, setState] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [requests, setRequests] = useState(() => new Set(['incident_records', 'jiv_report']))
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [copied, setCopied] = useState(false)

  const institution = INSTITUTIONS.find((i) => i.id === institutionId)

  const text = useMemo(
    () => generateFoiText({ institution, otherInstitution, state, dateFrom, dateTo, referenceNumber, requests, name, contact }),
    [institution, otherInstitution, state, dateFrom, dateTo, referenceNumber, requests, name, contact],
  )

  const toggleRequest = (id) => {
    setRequests((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
    <div className="mx-auto max-w-3xl">
      <PanelHeader icon={ScrollText} color="#06B6D4" title="Freedom of Information Request" badges={['FOI Act 2011, Section 4']} />

      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-normal text-muted">
        Under the Freedom of Information Act 2011, any Nigerian citizen has the right to request records
        held by public institutions, including oil spill data, JIV reports, and operator compliance
        records. Institutions must respond within 7 days. Use this generator to build a ready-to-send
        request.
      </p>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-text">Target Institution</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INSTITUTIONS.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => setInstitutionId(inst.id)}
              className={`min-h-[44px] rounded-lg border px-3 text-xs font-bold transition-colors ${
                institutionId === inst.id ? 'border-generate bg-generate/10 text-generate' : 'border-border bg-card text-muted'
              }`}
            >
              {inst.label}
            </button>
          ))}
        </div>
        {institutionId === 'other' && (
          <input
            type="text"
            value={otherInstitution}
            onChange={(e) => setOtherInstitution(e.target.value)}
            placeholder="Institution name and address"
            className="mt-2 min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          />
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-state">State</label>
          <select
            id="foi-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          >
            <option value="">Select a state</option>
            {NIGER_DELTA_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-reference">Reference number (optional)</label>
          <input
            id="foi-reference"
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-from">Date range from</label>
          <input
            id="foi-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-to">Date range to</label>
          <input
            id="foi-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-name">Your name (optional)</label>
          <input
            id="foi-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="foi-contact">Contact (optional)</label>
          <input
            id="foi-contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-bold text-text">Specific Request</h3>
        <div className="mt-2 space-y-2">
          {REQUEST_ITEMS.map((item) => (
            <label key={item.id} className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3">
              <input
                type="checkbox"
                checked={requests.has(item.id)}
                onChange={() => toggleRequest(item.id)}
                className="h-4 w-4 accent-generate"
              />
              <span className="text-sm text-text">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <textarea
        readOnly
        value={text}
        rows={16}
        className="mt-5 w-full rounded-lg border border-border bg-bg p-3 font-mono text-[11px] leading-normal text-text focus:border-generate focus:outline-none"
      />

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 print:hidden">
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-generate text-xs font-bold text-generate hover:bg-generate/10"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy FOI Request
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-muted hover:text-text"
        >
          <Download className="h-3.5 w-3.5" />
          Download FOI Request
        </button>
      </div>
      {copied && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-safe">
          <CheckCircle2 className="h-3.5 w-3.5" /> Copied to clipboard
        </p>
      )}

      <LegalBasisBadge text="Freedom of Information Act 2011, Section 4" />
    </div>
  )
}
