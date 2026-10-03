// Canonical JSON serialization and SHA-256 hashing for the evidentiary
// record. Mutable state (NOSDRA notification, corroboration, cleanup, etc.)
// lives in an append-only, hash-chained events array kept separate from the
// immutable evidence payload, so later mutations never require re-hashing
// the original evidence.
//
// This is a tamper-evidence mechanism only: it detects later changes to a
// saved record. It does not establish that a report is true, who made it,
// or its legal admissibility.

export const HASH_ALGORITHM = 'SHA-256'
export const CANONICALIZATION_VERSION = 'hsse-c14n-v1'
export const LEGACY_CANONICALIZATION = 'legacy-v0-noncanonical'

// Deterministic JSON: object keys sorted recursively, no whitespace, UTF-8
// via the caller's TextEncoder. Numbers use JS's native (shortest
// round-trip) string conversion — validation/verify_export.py mirrors this
// with Python's repr()-based float formatting for the numeric fields this
// app actually produces (coordinates, timestamps, counts); it does not
// attempt to match JS number formatting for arbitrary floats.
export function canonicalize(value) {
  if (value === undefined || value === null) return 'null'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new RangeError('Cannot canonicalize a non-finite number')
    return JSON.stringify(value)
  }
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`
  }
  throw new TypeError(`Cannot canonicalize value of type ${typeof value}`)
}

export async function sha256Hex(text) {
  const buffer = await crypto.subtle.digest(HASH_ALGORITHM, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPhotos(photos = []) {
  return Promise.all(photos.map((photo) => sha256Hex(photo)))
}

// The immutable evidence payload: everything that must never change once a
// report is submitted. Explicitly excludes contact details (name, phone),
// user agent, and every field under `regulatory`/`corroboration`, since
// those are expected to change after submission and are tracked instead in
// the append-only events array.
export function buildEvidencePayload(report, photoHashes) {
  return {
    incident: {
      type: report.incident.type,
      subType: report.incident.subType ?? null,
      severity: report.incident.severity,
      duration: report.incident.duration ?? null,
      dateTime: report.incident.dateTime,
      description: report.incident.description ?? '',
    },
    location: {
      gps: report.location.gps ?? null,
      display: report.location.display ?? null,
      state: report.location.state ?? null,
      lga: report.location.lga ?? null,
      landmark: report.location.landmark ?? null,
    },
    submittedAt: report.submittedAt,
    photoHashes,
    health: {
      healthImpact: report.health?.healthImpact ?? null,
      symptoms: report.health?.symptoms ?? [],
      affectedCount: report.health?.affectedCount ?? null,
    },
    language: report.audit?.language ?? null,
    consentVersion: report.audit?.consentVersion ?? null,
    appVersion: report.audit?.appVersion ?? null,
  }
}

// Computes and attaches the integrity block to a freshly-submitted report.
// Call once, at submission time, before the report is ever saved.
export async function sealReport(report) {
  const photoHashes = await hashPhotos(report.evidence?.photos ?? [])
  const payload = buildEvidencePayload(report, photoHashes)
  const payloadHash = await sha256Hex(canonicalize(payload))
  return {
    ...report,
    integrity: {
      algorithm: HASH_ALGORITHM,
      canonicalization: CANONICALIZATION_VERSION,
      payloadHash,
      photoHashes,
      hashedAt: new Date().toISOString(),
      // A running count and the latest event's hash, updated on every
      // appendEvent call. Lets verifyReport notice a missing tail — a
      // truncated-but-otherwise-self-consistent event array would
      // otherwise pass eventChainValid undetected. See the "on-device
      // protection is limited" note in docs/MANUSCRIPT_CHANGES.md: an
      // attacker with device access can rewrite these two fields to
      // match a truncated array, so real detection needs an independently
      // held export from before the truncation, not just this record.
      eventCount: 0,
      headEventHash: null,
    },
    events: [],
  }
}

function eventSigningPayload(event) {
  return { prevEventHash: event.prevEventHash, type: event.type, timestamp: event.timestamp, data: event.data }
}

// Replays the append-only event log to derive the current NOSDRA-
// notification and cleanup status — the source of truth for these three
// fields. report.regulatory carries a denormalized copy for fast
// synchronous reads across the UI, but verifyReport (below) cross-checks
// it against this replay so a direct field edit that bypasses
// appendEvent is detected rather than silently trusted.
const DEFAULT_REGULATORY_STATUS = { nosdraNotified: false, nosdraNotifiedAt: null, cleanupStatus: 'pending' }

export function deriveRegulatoryStatus(events = []) {
  let state = { ...DEFAULT_REGULATORY_STATUS }
  for (const event of events) {
    if (event.type === 'nosdra_notified') {
      state = { ...state, nosdraNotified: true, nosdraNotifiedAt: event.data?.notifiedAt ?? null }
    } else if (event.type === 'cleanup_status_changed') {
      state = { ...state, cleanupStatus: event.data?.status ?? state.cleanupStatus }
    }
  }
  return state
}

// Replays evidence_status_changed events to derive the evidence-status
// level. An upgrade only counts if the event carries the reference the
// rules require (an external record id for externally_referenced; a named
// source and reference for independently_verified), so a stored level that
// was raised without a logged, supported event is detected at verification.
export const DEFAULT_EVIDENCE_LEVEL = 'community_observed'

export function deriveEvidenceLevel(events = []) {
  let level = DEFAULT_EVIDENCE_LEVEL
  for (const event of events) {
    if (event.type !== 'evidence_status_changed') continue
    const data = event.data ?? {}
    if (data.level === 'community_observed') {
      level = 'community_observed'
    } else if (data.level === 'externally_referenced' && data.externalReference?.id) {
      level = 'externally_referenced'
    } else if (data.level === 'independently_verified' && data.verification?.source && data.verification?.reference) {
      level = 'independently_verified'
    }
  }
  return level
}

// Appends a mutable-state event (NOSDRA notification, evidence-status
// change, cleanup update, etc.) to the report's hash-chained event log.
// Returns a new report object; does not mutate the input.
export async function appendEvent(report, type, data) {
  const events = report.events ?? []
  const prevEventHash = events.length > 0 ? events[events.length - 1].eventHash : null
  const timestamp = new Date().toISOString()
  const eventHash = await sha256Hex(canonicalize(eventSigningPayload({ prevEventHash, type, timestamp, data })))
  const event = { id: crypto.randomUUID(), type, timestamp, prevEventHash, eventHash, data }
  const nextEvents = [...events, event]
  return {
    ...report,
    events: nextEvents,
    integrity: report.integrity
      ? { ...report.integrity, eventCount: nextEvents.length, headEventHash: eventHash }
      : report.integrity,
  }
}

// Re-derives the payload hash, the event-chain hashes, the regulatory
// status, and the event-log length from a report's current content and
// compares them against the stored values. Read-only.
export async function verifyReport(report) {
  if (!report.integrity || report.integrity.canonicalization === LEGACY_CANONICALIZATION) {
    return {
      payloadValid: null,
      eventChainValid: null,
      statusConsistent: null,
      eventLogComplete: null,
      details: { reason: 'Legacy record — predates canonical hashing and cannot be re-verified.' },
    }
  }

  const photoHashes = await hashPhotos(report.evidence?.photos ?? [])
  const payload = buildEvidencePayload(report, photoHashes)
  const recomputedPayloadHash = await sha256Hex(canonicalize(payload))
  const payloadValid = recomputedPayloadHash === report.integrity.payloadHash

  let eventChainValid = true
  let prevEventHash = null
  const events = report.events ?? []
  for (const event of events) {
    if (event.prevEventHash !== prevEventHash) {
      eventChainValid = false
      break
    }
    const recomputedEventHash = await sha256Hex(canonicalize(eventSigningPayload(event)))
    if (recomputedEventHash !== event.eventHash) {
      eventChainValid = false
      break
    }
    prevEventHash = event.eventHash
  }

  const derivedStatus = deriveRegulatoryStatus(events)
  const derivedEvidenceLevel = deriveEvidenceLevel(events)
  const statusConsistent =
    derivedStatus.nosdraNotified === Boolean(report.regulatory?.nosdraNotified) &&
    derivedStatus.nosdraNotifiedAt === (report.regulatory?.nosdraNotifiedAt ?? null) &&
    derivedStatus.cleanupStatus === (report.regulatory?.cleanupStatus ?? 'pending') &&
    derivedEvidenceLevel === (report.evidenceStatus?.level ?? DEFAULT_EVIDENCE_LEVEL)

  // A truncated-but-still-internally-consistent tail (the remaining
  // events still chain correctly) would pass eventChainValid above with
  // no complaint — this catches that by comparing the event log's
  // recorded high-water mark against what's actually present now.
  const expectedEventCount = events.length
  const expectedHeadEventHash = events.length > 0 ? events[events.length - 1].eventHash : null
  const eventLogComplete =
    (report.integrity.eventCount ?? 0) === expectedEventCount &&
    (report.integrity.headEventHash ?? null) === expectedHeadEventHash

  return {
    payloadValid,
    eventChainValid,
    statusConsistent,
    eventLogComplete,
    details: {
      recomputedPayloadHash,
      storedPayloadHash: report.integrity.payloadHash,
      eventCount: events.length,
      derivedRegulatoryStatus: derivedStatus,
      derivedEvidenceLevel,
      storedEventCount: report.integrity.eventCount ?? null,
      storedHeadEventHash: report.integrity.headEventHash ?? null,
    },
  }
}

// Builds the single-file JSON export a reporter can hand to anyone else —
// the device-local architecture has no server to submit to, so getting a
// report to NOSDRA, a journalist, or anyone besides the reporter is always
// this explicit export/share action, never automatic.
export function buildSubmissionExport(report) {
  return {
    exportFormat: 'nigerdelta-hsse-tracker-report-v1',
    exportedAt: new Date().toISOString(),
    record: report,
    verification: {
      note: 'Recompute the payload hash from `record` using the canonicalization documented in this project’s validation/verify_export.py, and compare it to record.integrity.payloadHash. eventCount/headEventHash let you detect a later-truncated event log by comparing this export’s values against a newer copy of the same record.',
      algorithm: report.integrity?.algorithm ?? null,
      canonicalization: report.integrity?.canonicalization ?? null,
      payloadHash: report.integrity?.payloadHash ?? null,
      eventCount: report.integrity?.eventCount ?? null,
      headEventHash: report.integrity?.headEventHash ?? null,
    },
  }
}

export function downloadSubmissionExport(report) {
  const payload = buildSubmissionExport(report)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.referenceNumber}-export.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Marks a pre-existing (pre-integrity-rework) record as legacy without
// attempting to compute a canonical hash for content never captured under
// this scheme. Idempotent — a report that already has an `integrity` block
// is returned unchanged.
export function markLegacy(report) {
  if (report.integrity) return report
  return {
    ...report,
    integrity: {
      algorithm: null,
      canonicalization: LEGACY_CANONICALIZATION,
      payloadHash: report.audit?.reportHash ?? null,
      photoHashes: [],
      hashedAt: null,
    },
    events: report.events ?? [],
  }
}
