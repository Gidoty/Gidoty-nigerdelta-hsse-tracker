import { describe, expect, it } from 'vitest'
import {
  canonicalize,
  sha256Hex,
  buildEvidencePayload,
  sealReport,
  appendEvent,
  verifyReport,
  markLegacy,
  deriveRegulatoryStatus,
  deriveEvidenceLevel,
  CANONICALIZATION_VERSION,
  LEGACY_CANONICALIZATION,
} from './integrity.js'

function minimalReport(overrides = {}) {
  return {
    id: 'r1',
    submittedAt: '2026-01-01T00:00:00.000Z',
    incident: { type: 'gas_flare', subType: null, severity: 'serious', duration: 'ongoing', dateTime: '2026-01-01T00:00:00.000Z', description: 'Test incident description' },
    location: { gps: { lat: 4.5, lng: 6.5, accuracy: 10, capturedAt: 1 }, display: { lat: 4.5, lng: 6.5 }, state: 'Rivers', lga: 'Gokana', landmark: null },
    evidence: { photos: [], photoCount: 0 },
    health: { healthImpact: false, symptoms: [], affectedCount: null },
    audit: { consentVersion: 'NDPA-2023-v1', language: 'en', appVersion: 'test' },
    regulatory: { nosdraNotified: false, cleanupStatus: 'pending' },
    ...overrides,
  }
}

describe('canonicalize', () => {
  it('sorts object keys recursively regardless of insertion order', () => {
    const a = canonicalize({ b: 1, a: { d: 2, c: 3 } })
    const b = canonicalize({ a: { c: 3, d: 2 }, b: 1 })
    expect(a).toBe(b)
    expect(a).toBe('{"a":{"c":3,"d":2},"b":1}')
  })

  it('preserves array order (arrays are not sorted)', () => {
    expect(canonicalize([3, 1, 2])).toBe('[3,1,2]')
  })

  it('treats undefined and null the same way, as JSON null', () => {
    expect(canonicalize(undefined)).toBe('null')
    expect(canonicalize(null)).toBe('null')
  })

  it('throws on non-finite numbers rather than silently emitting NaN/Infinity', () => {
    expect(() => canonicalize(Number.NaN)).toThrow()
    expect(() => canonicalize(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('produces stable output for -0 (no negative zero artifact)', () => {
    expect(canonicalize(-0)).toBe('0')
  })
})

describe('sha256Hex', () => {
  it('matches a known SHA-256 test vector', async () => {
    // SHA-256("abc") is a standard published test vector (FIPS 180-4).
    const hash = await sha256Hex('abc')
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('buildEvidencePayload', () => {
  it('excludes contact details, user agent, and regulatory/corroboration state', () => {
    const report = minimalReport()
    const payload = buildEvidencePayload(report, [])
    const serialized = JSON.stringify(payload)
    expect(serialized).not.toContain('regulatory')
    expect(serialized).not.toContain('nosdraNotified')
    expect(payload).not.toHaveProperty('contact')
    expect(payload).not.toHaveProperty('userAgent')
  })

  it('includes the immutable evidence fields', () => {
    const report = minimalReport()
    const payload = buildEvidencePayload(report, ['photohash1'])
    expect(payload.incident.type).toBe('gas_flare')
    expect(payload.location.state).toBe('Rivers')
    expect(payload.photoHashes).toEqual(['photohash1'])
    expect(payload.consentVersion).toBe('NDPA-2023-v1')
    expect(payload.appVersion).toBe('test')
  })

  it('defaults every optional field to null/[] when omitted from the input report', () => {
    const report = {
      id: 'r2',
      submittedAt: '2026-01-01T00:00:00.000Z',
      incident: { type: 'oil_spill', severity: 'minor', dateTime: '2026-01-01T00:00:00.000Z' },
      location: { state: 'Delta' },
      health: {},
      audit: {},
    }
    const payload = buildEvidencePayload(report, [])
    expect(payload.incident.subType).toBeNull()
    expect(payload.incident.duration).toBeNull()
    expect(payload.incident.description).toBe('')
    expect(payload.location.gps).toBeNull()
    expect(payload.location.display).toBeNull()
    expect(payload.location.lga).toBeNull()
    expect(payload.location.landmark).toBeNull()
    expect(payload.health.healthImpact).toBeNull()
    expect(payload.health.symptoms).toEqual([])
    expect(payload.health.affectedCount).toBeNull()
    expect(payload.language).toBeNull()
    expect(payload.consentVersion).toBeNull()
    expect(payload.appVersion).toBeNull()
  })

  it('defaults photoHashes-related evidence fields and events to [] when evidence/events are absent', async () => {
    const report = { ...minimalReport(), evidence: undefined, events: undefined }
    delete report.evidence
    const sealed = await sealReport(report)
    expect(sealed.integrity.photoHashes).toEqual([])
    expect(sealed.events).toEqual([])
  })
})

describe('sealReport / verifyReport round trip', () => {
  it('a freshly sealed report verifies as valid with an empty event chain', async () => {
    const sealed = await sealReport(minimalReport())
    expect(sealed.integrity.canonicalization).toBe(CANONICALIZATION_VERSION)
    expect(sealed.integrity.payloadHash).toMatch(/^[0-9a-f]{64}$/)
    expect(sealed.events).toEqual([])

    const result = await verifyReport(sealed)
    expect(result.payloadValid).toBe(true)
    expect(result.eventChainValid).toBe(true)
  })

  it('detects a change to a hashed evidence field', async () => {
    const sealed = await sealReport(minimalReport())
    const tampered = { ...sealed, incident: { ...sealed.incident, description: 'A different description entirely' } }
    const result = await verifyReport(tampered)
    expect(result.payloadValid).toBe(false)
  })

  it('detects a change to a photo (photo hash mismatch)', async () => {
    const withPhoto = await sealReport(minimalReport({ evidence: { photos: ['data:image/jpeg;base64,AAAA'], photoCount: 1 } }))
    const tamperedPhoto = { ...withPhoto, evidence: { ...withPhoto.evidence, photos: ['data:image/jpeg;base64,BBBB'] } }
    const result = await verifyReport(tamperedPhoto)
    expect(result.payloadValid).toBe(false)
  })

  it('does not flag contact-field or regulatory-field changes as tampering', async () => {
    const sealed = await sealReport(minimalReport())
    const withRegulatoryChange = { ...sealed, regulatory: { ...sealed.regulatory, nosdraNotified: true } }
    const result = await verifyReport(withRegulatoryChange)
    expect(result.payloadValid).toBe(true)
  })
})

describe('event chain (appendEvent / verifyReport)', () => {
  it('builds a hash chain where each event links to the previous eventHash', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    report = await appendEvent(report, 'cleanup_status_changed', { status: 'in_progress' })

    expect(report.events).toHaveLength(2)
    expect(report.events[0].prevEventHash).toBeNull()
    expect(report.events[1].prevEventHash).toBe(report.events[0].eventHash)

    const result = await verifyReport(report)
    expect(result.eventChainValid).toBe(true)
    expect(result.details.eventCount).toBe(2)
  })

  it('detects a broken chain when an event is altered after the fact', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    const tampered = {
      ...report,
      events: [{ ...report.events[0], data: { notifiedAt: '2099-01-01T00:00:00.000Z' } }],
    }
    const result = await verifyReport(tampered)
    expect(result.eventChainValid).toBe(false)
  })

  it('detects an event chain with a broken link (wrong prevEventHash)', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    report = await appendEvent(report, 'cleanup_status_changed', { status: 'in_progress' })
    const tampered = { ...report, events: [report.events[0], { ...report.events[1], prevEventHash: 'wrong-hash' }] }
    const result = await verifyReport(tampered)
    expect(result.eventChainValid).toBe(false)
  })
})

describe('deriveRegulatoryStatus', () => {
  it('defaults to not-notified/pending with no events', () => {
    expect(deriveRegulatoryStatus([])).toEqual({ nosdraNotified: false, nosdraNotifiedAt: null, cleanupStatus: 'pending' })
  })

  it('takes the notifiedAt from the nosdra_notified event, and the status from the latest cleanup_status_changed event', () => {
    const events = [
      { type: 'nosdra_notified', data: { notifiedAt: '2026-01-02T00:00:00.000Z' } },
      { type: 'cleanup_status_changed', data: { status: 'in_progress' } },
      { type: 'cleanup_status_changed', data: { status: 'completed' } },
    ]
    expect(deriveRegulatoryStatus(events)).toEqual({
      nosdraNotified: true,
      nosdraNotifiedAt: '2026-01-02T00:00:00.000Z',
      cleanupStatus: 'completed',
    })
  })

  it('ignores event types it does not recognize', () => {
    const events = [{ type: 'evidence_status_changed', data: { level: 'externally_referenced' } }]
    expect(deriveRegulatoryStatus(events)).toEqual({ nosdraNotified: false, nosdraNotifiedAt: null, cleanupStatus: 'pending' })
  })
})

describe('verifyReport: statusConsistent (regulatory status must match the replayed event log)', () => {
  it('is true when regulatory fields were updated via appendEvent, matching the replay', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    report = { ...report, regulatory: { ...report.regulatory, nosdraNotified: true, nosdraNotifiedAt: '2026-01-02T00:00:00.000Z' } }

    const result = await verifyReport(report)
    expect(result.statusConsistent).toBe(true)
  })

  it('is false when a regulatory field is edited directly with no corresponding event', async () => {
    const sealed = await sealReport(minimalReport())
    const tampered = { ...sealed, regulatory: { ...sealed.regulatory, nosdraNotified: true, nosdraNotifiedAt: '2026-01-02T00:00:00.000Z' } }

    const result = await verifyReport(tampered)
    expect(result.statusConsistent).toBe(false)
  })

  it('is false when cleanupStatus is edited directly without a cleanup_status_changed event', async () => {
    const sealed = await sealReport(minimalReport())
    const tampered = { ...sealed, regulatory: { ...sealed.regulatory, cleanupStatus: 'completed' } }

    const result = await verifyReport(tampered)
    expect(result.statusConsistent).toBe(false)
  })

  // Each of these isolates exactly one of statusConsistent's four ANDed
  // terms as false while the other three stay true (matching), so the
  // check can only come out false if all four terms are genuinely
  // combined with AND — an implementation that OR'd any two adjacent
  // terms together would wrongly report true here, since the other
  // (true) term would carry it.
  it('is false when only nosdraNotified mismatches (nosdraNotifiedAt, cleanupStatus, evidenceLevel all still match)', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    const tampered = { ...report, regulatory: { ...report.regulatory, nosdraNotified: false, nosdraNotifiedAt: '2026-01-02T00:00:00.000Z' } }
    const result = await verifyReport(tampered)
    expect(result.statusConsistent).toBe(false)
  })

  it('is false when only nosdraNotifiedAt mismatches (nosdraNotified, cleanupStatus, evidenceLevel all still match)', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    const tampered = { ...report, regulatory: { ...report.regulatory, nosdraNotified: true, nosdraNotifiedAt: '2099-01-01T00:00:00.000Z' } }
    const result = await verifyReport(tampered)
    expect(result.statusConsistent).toBe(false)
  })

  it('is false when only evidenceStatus.level mismatches (all regulatory fields still match)', async () => {
    const sealed = await sealReport(minimalReport({ evidenceStatus: { level: 'community_observed' } }))
    const tampered = { ...sealed, evidenceStatus: { level: 'externally_referenced' } }
    const result = await verifyReport(tampered)
    expect(result.statusConsistent).toBe(false)
  })

  it('is null for a legacy record, since it cannot be re-verified', () => {
    const legacy = markLegacy(minimalReport())
    return verifyReport(legacy).then((result) => {
      expect(result.statusConsistent).toBeNull()
    })
  })
})

describe('verifyReport: eventLogComplete (truncation detection)', () => {
  it('is true immediately after sealing, and after each appendEvent call', async () => {
    let report = await sealReport(minimalReport())
    expect(report.integrity.eventCount).toBe(0)
    expect(report.integrity.headEventHash).toBeNull()
    expect((await verifyReport(report)).eventLogComplete).toBe(true)

    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    expect(report.integrity.eventCount).toBe(1)
    expect(report.integrity.headEventHash).toBe(report.events[0].eventHash)
    expect((await verifyReport(report)).eventLogComplete).toBe(true)

    report = await appendEvent(report, 'cleanup_status_changed', { status: 'in_progress' })
    expect(report.integrity.eventCount).toBe(2)
    expect(report.integrity.headEventHash).toBe(report.events[1].eventHash)
    expect((await verifyReport(report)).eventLogComplete).toBe(true)
  })

  it('is false when the last event is dropped, even though the remaining chain is still self-consistent', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'nosdra_notified', { notifiedAt: '2026-01-02T00:00:00.000Z' })
    report = await appendEvent(report, 'cleanup_status_changed', { status: 'in_progress' })

    const truncated = { ...report, events: report.events.slice(0, 1) }
    const result = await verifyReport(truncated)
    // The remaining single-event chain is still internally valid...
    expect(result.eventChainValid).toBe(true)
    // ...but the stored high-water mark (2 events) no longer matches.
    expect(result.eventLogComplete).toBe(false)
  })
})

describe('legacy records', () => {
  it('markLegacy tags a record with no integrity block and does not compute a canonical hash', () => {
    const legacy = markLegacy({ ...minimalReport(), audit: { ...minimalReport().audit, reportHash: 'old-hash-123' } })
    expect(legacy.integrity.canonicalization).toBe(LEGACY_CANONICALIZATION)
    expect(legacy.integrity.payloadHash).toBe('old-hash-123')
  })

  it('markLegacy is a no-op for a record that already has an integrity block', async () => {
    const sealed = await sealReport(minimalReport())
    const result = markLegacy(sealed)
    expect(result).toBe(sealed)
  })

  it('verifyReport refuses to verify a legacy record instead of guessing', () => {
    const legacy = markLegacy(minimalReport())
    return verifyReport(legacy).then((result) => {
      expect(result.payloadValid).toBeNull()
      expect(result.eventChainValid).toBeNull()
      expect(result.statusConsistent).toBeNull()
      expect(result.eventLogComplete).toBeNull()
    })
  })
})

describe('evidence-status replay', () => {
  it('derives community_observed when no evidence events exist', () => {
    expect(deriveEvidenceLevel([])).toBe('community_observed')
  })

  it('counts an upgrade only when the event carries the required reference', () => {
    expect(deriveEvidenceLevel([{ type: 'evidence_status_changed', data: { level: 'externally_referenced' } }])).toBe(
      'community_observed',
    )
    expect(
      deriveEvidenceLevel([
        { type: 'evidence_status_changed', data: { level: 'externally_referenced', externalReference: { id: 'OSM-1' } } },
      ]),
    ).toBe('externally_referenced')
    expect(
      deriveEvidenceLevel([
        { type: 'evidence_status_changed', data: { level: 'independently_verified', verification: { source: 'JIV' } } },
      ]),
    ).toBe('community_observed')
    expect(
      deriveEvidenceLevel([
        { type: 'evidence_status_changed', data: { level: 'independently_verified', verification: { reference: 'JIV-1' } } },
      ]),
    ).toBe('community_observed')
    expect(
      deriveEvidenceLevel([
        { type: 'evidence_status_changed', data: { level: 'externally_referenced', externalReference: {} } },
      ]),
    ).toBe('community_observed')
  })

  it('flags a stored evidence level that was raised without a logged event', async () => {
    const sealed = await sealReport(minimalReport({ evidenceStatus: { level: 'community_observed' } }))
    const edited = { ...sealed, evidenceStatus: { level: 'independently_verified' } }
    const result = await verifyReport(edited)
    expect(result.payloadValid).toBe(true)
    expect(result.statusConsistent).toBe(false)
  })

  it('accepts an evidence upgrade made through a supported event', async () => {
    let r = await sealReport(minimalReport({ evidenceStatus: { level: 'community_observed' } }))
    const verification = { source: 'JIV report', reference: 'JIV-1' }
    r = await appendEvent(r, 'evidence_status_changed', { level: 'independently_verified', verification })
    r = { ...r, evidenceStatus: { level: 'independently_verified', verification } }
    const result = await verifyReport(r)
    expect(result.statusConsistent).toBe(true)
    expect(result.eventChainValid).toBe(true)
    expect(result.eventLogComplete).toBe(true)
  })
})
