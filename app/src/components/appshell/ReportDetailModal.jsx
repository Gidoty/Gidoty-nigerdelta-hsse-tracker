import { useState } from 'react'
import { X, Fingerprint, ShieldCheck, ShieldAlert, Loader2, Link2, Download } from 'lucide-react'
import { t } from '../../data/translations.js'
import { deriveStatus, updateReportWithEvent } from '../../utils/dashboardUtils.js'
import { hoursSince, formatElapsed, notificationTimerLevel } from '../../utils/trackerUtils.js'
import { verifyReport, downloadSubmissionExport } from '../../utils/integrity.js'
import {
  EVIDENCE_STATUS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUS_DESCRIPTIONS,
  EXTERNAL_REFERENCE_TYPES,
  evidenceStatusLevel,
} from '../../utils/evidenceStatus.js'
import { fmt } from '../../utils/formatters.js'
import { SEVERITY_BADGE_CLASSES } from '../../data/markerColors.js'
import NosdraModal from '../tracker/NosdraModal.jsx'

const TABS = ['Details', 'Evidence', 'Health', 'Regulatory', 'Audit']

const STATUS_LABELS = {
  submitted: 'Submitted',
  nosdra_notified: 'NOSDRA Notified',
  resolved: 'Resolved',
}

export default function ReportDetailModal({ report, onClose, onReportsChanged }) {
  const [tab, setTab] = useState('Details')
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [current, setCurrent] = useState(report)
  const [verifyState, setVerifyState] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [refForm, setRefForm] = useState({ type: EXTERNAL_REFERENCE_TYPES[0].id, id: '', url: '', accessedAt: new Date().toISOString().slice(0, 10) })
  const [verifyForm, setVerifyForm] = useState({ source: '', reference: '', verifiedAt: new Date().toISOString().slice(0, 10) })
  const [showRefForm, setShowRefForm] = useState(false)
  const [showVerifyForm, setShowVerifyForm] = useState(false)

  const handleVerify = async () => {
    setVerifying(true)
    const result = await verifyReport(current)
    setVerifyState(result)
    setVerifying(false)
  }

  const typeLabel = t('en', 'incidentTypes')[current.incident.type] ?? current.incident.type
  const severityInfo = t('en', 'severityLevels')[current.incident.severity]
  const isDemo = Boolean(current.incident.isDemoData)

  const applyEvidenceStatus = async (level, extra) => {
    const evidenceStatus = { ...current.evidenceStatus, level, ...extra }
    if (isDemo) {
      setCurrent((prev) => ({ ...prev, evidenceStatus }))
      return
    }
    const updated = await updateReportWithEvent(current.id, 'evidence_status_changed', { level, ...extra }, (r) => ({
      ...r,
      evidenceStatus,
    }))
    setCurrent(updated.find((r) => r.id === current.id) ?? current)
    onReportsChanged?.(updated)
  }

  const handleAddExternalReference = async () => {
    if (!refForm.id.trim()) return
    await applyEvidenceStatus(EVIDENCE_STATUS.EXTERNALLY_REFERENCED, {
      externalReference: { ...refForm },
    })
    setShowRefForm(false)
  }

  const handleAddVerification = async () => {
    if (!verifyForm.source.trim() || !verifyForm.reference.trim()) return
    await applyEvidenceStatus(EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED, {
      verification: { ...verifyForm },
    })
    setShowVerifyForm(false)
  }

  const handleMarkNotified = async (reportId, estimatedSpillOccurredAt) => {
    const notifiedAt = new Date().toISOString()
    if (isDemo) {
      setCurrent((prev) => ({
        ...prev,
        regulatory: { ...prev.regulatory, nosdraNotified: true, nosdraNotifiedAt: notifiedAt, estimatedSpillOccurredAt },
      }))
      setNotifyOpen(false)
      return
    }
    const updated = await updateReportWithEvent(reportId, 'nosdra_notified', { notifiedAt, estimatedSpillOccurredAt }, (r) => ({
      ...r,
      regulatory: { ...r.regulatory, nosdraNotified: true, nosdraNotifiedAt: notifiedAt, estimatedSpillOccurredAt },
    }))
    setCurrent(updated.find((r) => r.id === reportId) ?? current)
    onReportsChanged?.(updated)
    setNotifyOpen(false)
  }

  const notifiedHours = hoursSince(current.regulatory?.nosdraNotifiedAt)
  const timerLevel = notifiedHours === null ? null : notificationTimerLevel(notifiedHours)

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  SEVERITY_BADGE_CLASSES[current.incident.severity]
                }`}
              >
                {severityInfo?.label ?? current.incident.severity}
              </span>
              <h2 className="text-base font-bold text-text">{typeLabel}</h2>
              <span className="text-xs text-teal">{current.referenceNumber}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {[current.location.state, current.location.lga].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              onClick={() => setTab(tabName)}
              className={`min-h-[40px] shrink-0 rounded-t-lg px-4 text-sm font-bold transition-colors ${
                tab === tabName ? 'bg-panel text-teal' : 'text-muted hover:text-text'
              }`}
            >
              {tabName}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 text-sm">
          {tab === 'Details' && (
            <div className="space-y-3">
              <Row label="Reference" value={current.referenceNumber} />
              <Row label="Type" value={typeLabel} />
              <Row label="Sub-type" value={current.incident.subType ? t('en', 'subTypes')[current.incident.subType] : '—'} />
              <Row label="Severity" value={severityInfo?.label ?? current.incident.severity} />
              <Row label="Duration" value={current.incident.duration ?? '—'} />
              <Row label="Date/Time" value={fmt.datetime(current.incident.dateTime)} />
              <Row
                label="Location"
                value={
                  current.location.display
                    ? fmt.gps(current.location.display.lat, current.location.display.lng)
                    : current.location.landmark ?? '—'
                }
              />
              <Row label="State / LGA" value={[current.location.state, current.location.lga].filter(Boolean).join(' · ') || '—'} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Description</p>
                <p className="mt-1 text-text">{current.incident.description}</p>
              </div>
            </div>
          )}

          {tab === 'Evidence' && (
            <div>
              {current.evidence?.photos?.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {current.evidence.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Evidence ${index + 1}`}
                      loading="lazy"
                      className="h-28 w-full rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted">No photos submitted.</p>
              )}
            </div>
          )}

          {tab === 'Health' && (
            <div className="space-y-3">
              <Row label="Health impact reported" value={current.health?.healthImpact ? 'Yes' : 'No'} />
              {current.health?.healthImpact && (
                <>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Symptoms</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-text">
                      {(current.health.symptoms ?? []).map((symptom) => (
                        <li key={symptom}>{t('en', 'symptomsList')[symptom] ?? symptom}</li>
                      ))}
                      {(current.health.symptoms ?? []).length === 0 && <li>None specified</li>}
                    </ul>
                  </div>
                  <Row
                    label="Affected count"
                    value={current.health.affectedCount ? t('en', 'affectedCount')[current.health.affectedCount] : '—'}
                  />
                </>
              )}
            </div>
          )}

          {tab === 'Regulatory' && (
            <div className="space-y-4">
              <Row label="Lifecycle stage" value={STATUS_LABELS[deriveStatus(current)]} />

              <div className="rounded-lg border border-border bg-panel p-3">
                <p className="flex items-center gap-1.5 text-sm font-bold text-text">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  Evidence status: {EVIDENCE_STATUS_LABELS[evidenceStatusLevel(current)]}
                </p>
                <p className="mt-1 text-xs text-muted">{EVIDENCE_STATUS_DESCRIPTIONS[evidenceStatusLevel(current)]}</p>

                {current.evidenceStatus?.externalReference && (
                  <p className="mt-2 text-xs text-text">
                    Linked: {current.evidenceStatus.externalReference.type} · {current.evidenceStatus.externalReference.id}
                    {current.evidenceStatus.externalReference.url && (
                      <>
                        {' · '}
                        <a href={current.evidenceStatus.externalReference.url} target="_blank" rel="noreferrer" className="text-teal underline">
                          source
                        </a>
                      </>
                    )}
                    {' · accessed '}
                    {current.evidenceStatus.externalReference.accessedAt}
                  </p>
                )}
                {current.evidenceStatus?.verification && (
                  <p className="mt-2 text-xs text-text">
                    Verified via: {current.evidenceStatus.verification.source} — {current.evidenceStatus.verification.reference}
                    {' · '}
                    {current.evidenceStatus.verification.verifiedAt}
                  </p>
                )}

                {evidenceStatusLevel(current) !== EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED && !isDemo && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRefForm((v) => !v)}
                      className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-teal px-3 text-xs font-bold text-teal hover:bg-teal/10"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Link External Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVerifyForm((v) => !v)}
                      className="flex min-h-[36px] items-center gap-1.5 rounded-lg border border-safe px-3 text-xs font-bold text-safe hover:bg-safe/10"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Add Verification Source
                    </button>
                  </div>
                )}

                {showRefForm && (
                  <div className="mt-3 space-y-2 rounded-lg border border-border bg-card p-3">
                    <select
                      value={refForm.type}
                      onChange={(e) => setRefForm((f) => ({ ...f, type: e.target.value }))}
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text focus:border-teal focus:outline-none"
                    >
                      {EXTERNAL_REFERENCE_TYPES.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={refForm.id}
                      onChange={(e) => setRefForm((f) => ({ ...f, id: e.target.value }))}
                      placeholder="Record ID / site name (required)"
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text placeholder:text-muted focus:border-teal focus:outline-none"
                    />
                    <input
                      type="url"
                      value={refForm.url}
                      onChange={(e) => setRefForm((f) => ({ ...f, url: e.target.value }))}
                      placeholder="URL (optional)"
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text placeholder:text-muted focus:border-teal focus:outline-none"
                    />
                    <input
                      type="date"
                      value={refForm.accessedAt}
                      onChange={(e) => setRefForm((f) => ({ ...f, accessedAt: e.target.value }))}
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text focus:border-teal focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddExternalReference}
                      disabled={!refForm.id.trim()}
                      className="flex min-h-[36px] w-full items-center justify-center rounded-md bg-teal text-xs font-bold text-white hover:bg-teal/90 disabled:opacity-50"
                    >
                      Save Reference
                    </button>
                  </div>
                )}

                {showVerifyForm && (
                  <div className="mt-3 space-y-2 rounded-lg border border-border bg-card p-3">
                    <input
                      type="text"
                      value={verifyForm.source}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, source: e.target.value }))}
                      placeholder="Verification source, e.g. JIV report (required)"
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text placeholder:text-muted focus:border-safe focus:outline-none"
                    />
                    <input
                      type="text"
                      value={verifyForm.reference}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, reference: e.target.value }))}
                      placeholder="Reference number / citation (required)"
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text placeholder:text-muted focus:border-safe focus:outline-none"
                    />
                    <input
                      type="date"
                      value={verifyForm.verifiedAt}
                      onChange={(e) => setVerifyForm((f) => ({ ...f, verifiedAt: e.target.value }))}
                      className="min-h-[36px] w-full rounded-md border border-border bg-panel px-2 text-xs text-text focus:border-safe focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddVerification}
                      disabled={!verifyForm.source.trim() || !verifyForm.reference.trim()}
                      className="flex min-h-[36px] w-full items-center justify-center rounded-md bg-safe text-xs font-bold text-white hover:bg-safe/90 disabled:opacity-50"
                    >
                      Save Verification
                    </button>
                  </div>
                )}
              </div>

              <Row label="NOSDRA notified" value={current.regulatory?.nosdraNotified ? 'Yes' : 'No'} />
              {current.regulatory?.nosdraNotified && (
                <Row
                  label="Notified at"
                  value={fmt.datetime(current.regulatory.nosdraNotifiedAt)}
                />
              )}
              {current.regulatory?.estimatedSpillOccurredAt && (
                <Row
                  label="Estimated spill occurrence (reporter estimate)"
                  value={fmt.datetime(current.regulatory.estimatedSpillOccurredAt)}
                />
              )}
              <Row label="Cleanup status" value={(current.regulatory?.cleanupStatus ?? 'pending').replace('_', ' ')} />

              {current.regulatory?.nosdraNotified ? (
                <div
                  className={`rounded-lg border px-4 py-3 text-xs ${
                    timerLevel === 'ok'
                      ? 'border-safe/40 bg-safe/10 text-safe'
                      : timerLevel === 'warning'
                        ? 'border-amber/40 bg-amber/10 text-amber'
                        : 'border-danger bg-danger/10 text-danger'
                  }`}
                >
                  Time since you recorded notifying NOSDRA: {formatElapsed(notifiedHours)}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setNotifyOpen(true)}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-teal text-sm font-bold text-white hover:bg-teal/90"
                >
                  Notify NOSDRA
                </button>
              )}
            </div>
          )}

          {tab === 'Audit' && (
            <div className="space-y-3">
              <Row
                label="Payload hash (SHA-256)"
                value={current.integrity?.payloadHash ?? current.audit?.reportHash ?? 'not available'}
                mono
              />
              <Row
                label="Canonicalization"
                value={current.integrity?.canonicalization ?? 'unknown'}
                mono
              />
              <Row label="Submission timestamp" value={fmt.datetime(current.submittedAt)} />
              <Row label="Consent version" value={current.audit?.consentVersion ?? '—'} />
              <Row label="Language used" value={current.audit?.language ?? '—'} />
              <Row label="Events recorded" value={String(current.events?.length ?? 0)} />

              <div className="mt-4 flex gap-2 rounded-lg border border-border bg-panel p-3 text-xs text-muted">
                <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <p>
                  Tamper-evident fingerprint. Detects later changes to the saved record. Does not
                  establish that the report is true, who made it, or legal admissibility.
                </p>
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-teal text-sm font-bold text-teal hover:bg-teal/10 disabled:opacity-60"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify Integrity
              </button>

              {verifyState && (
                <div
                  className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                    verifyState.payloadValid === null
                      ? 'border-border bg-panel text-muted'
                      : verifyState.payloadValid && verifyState.eventChainValid
                        ? 'border-safe/40 bg-safe/10 text-safe'
                        : 'border-danger/40 bg-danger/10 text-danger'
                  }`}
                >
                  {verifyState.payloadValid === null ? (
                    <Fingerprint className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : verifyState.payloadValid && verifyState.eventChainValid ? (
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <div>
                    {verifyState.payloadValid === null ? (
                      <p>{verifyState.details.reason}</p>
                    ) : (
                      <>
                        <p className="font-bold">
                          Evidence payload: {verifyState.payloadValid ? 'matches recorded hash' : 'DOES NOT MATCH — record may have been altered'}
                        </p>
                        <p className="mt-1 font-bold">
                          Event chain ({verifyState.details.eventCount}): {verifyState.eventChainValid ? 'intact' : 'BROKEN — chain does not verify'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => downloadSubmissionExport(current)}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-generate text-sm font-bold text-bg hover:bg-generate/90"
              >
                <Download className="h-4 w-4" />
                Export for Submission
              </button>
              <p className="text-[11px] text-muted">
                Downloads a single JSON file with this report and its integrity hash — the only way
                this report leaves your device. Nothing is sent automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {notifyOpen && (
        <NosdraModal report={current} onClose={() => setNotifyOpen(false)} onMarkNotified={handleMarkNotified} />
      )}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-2">
      <span className="text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      <span className={`text-right text-text ${mono ? 'break-all font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
