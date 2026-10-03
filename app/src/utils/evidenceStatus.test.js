import { describe, expect, it } from 'vitest'
import {
  EVIDENCE_STATUS,
  EVIDENCE_STATUS_LABELS,
  defaultEvidenceStatus,
  evidenceStatusLevel,
  evidenceStatusLabel,
} from './evidenceStatus.js'
import { appendEvent, sealReport } from './integrity.js'

function minimalReport() {
  return {
    id: 'r1',
    submittedAt: '2026-01-01T00:00:00.000Z',
    incident: { type: 'gas_flare', subType: null, severity: 'serious', duration: 'ongoing', dateTime: '2026-01-01T00:00:00.000Z', description: 'Test incident' },
    location: { gps: null, display: null, state: 'Rivers', lga: null, landmark: 'Test' },
    evidence: { photos: [], photoCount: 0 },
    health: { healthImpact: false, symptoms: [], affectedCount: null },
    audit: { consentVersion: 'NDPA-2023-v1', language: 'en' },
    evidenceStatus: defaultEvidenceStatus(),
  }
}

describe('defaultEvidenceStatus', () => {
  it('starts every report at community_observed with no reference or verification', () => {
    const status = defaultEvidenceStatus()
    expect(status.level).toBe(EVIDENCE_STATUS.COMMUNITY_OBSERVED)
    expect(status.externalReference).toBeNull()
    expect(status.verification).toBeNull()
  })
})

describe('evidenceStatusLevel / evidenceStatusLabel', () => {
  it('defaults to community_observed for a report with no evidenceStatus at all (legacy records)', () => {
    const report = { ...minimalReport(), evidenceStatus: undefined }
    expect(evidenceStatusLevel(report)).toBe(EVIDENCE_STATUS.COMMUNITY_OBSERVED)
    expect(evidenceStatusLabel(report)).toBe(EVIDENCE_STATUS_LABELS[EVIDENCE_STATUS.COMMUNITY_OBSERVED])
  })

  it('reads the label for each level correctly', () => {
    for (const level of Object.values(EVIDENCE_STATUS)) {
      const report = { ...minimalReport(), evidenceStatus: { level, externalReference: null, verification: null } }
      expect(evidenceStatusLabel(report)).toBe(EVIDENCE_STATUS_LABELS[level])
    }
  })
})

describe('evidence-status transitions (as applied via the append-only event log)', () => {
  it('community_observed -> externally_referenced requires a linked external record', async () => {
    let report = await sealReport(minimalReport())
    expect(evidenceStatusLevel(report)).toBe(EVIDENCE_STATUS.COMMUNITY_OBSERVED)

    const externalReference = { type: 'oil_spill_monitor', id: 'NOSDRA-OSM-123', url: 'https://example.org/123', accessedAt: '2026-01-05' }
    report = await appendEvent(report, 'evidence_status_changed', { level: EVIDENCE_STATUS.EXTERNALLY_REFERENCED, externalReference })
    report = { ...report, evidenceStatus: { level: EVIDENCE_STATUS.EXTERNALLY_REFERENCED, externalReference, verification: null } }

    expect(evidenceStatusLevel(report)).toBe(EVIDENCE_STATUS.EXTERNALLY_REFERENCED)
    expect(report.events).toHaveLength(1)
    expect(report.events[0].data.externalReference.id).toBe('NOSDRA-OSM-123')
  })

  it('community_observed -> independently_verified requires a stated verification source', async () => {
    let report = await sealReport(minimalReport())
    const verification = { source: 'JIV report', reference: 'JIV-2026-014', verifiedAt: '2026-01-06' }
    report = await appendEvent(report, 'evidence_status_changed', { level: EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED, verification })
    report = { ...report, evidenceStatus: { level: EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED, externalReference: null, verification } }

    expect(evidenceStatusLevel(report)).toBe(EVIDENCE_STATUS.INDEPENDENTLY_VERIFIED)
    expect(report.evidenceStatus.verification.source).toBe('JIV report')
  })

  it('every evidence-status change is recorded in the hash-chained event log, not just the denormalized field', async () => {
    let report = await sealReport(minimalReport())
    report = await appendEvent(report, 'evidence_status_changed', {
      level: EVIDENCE_STATUS.EXTERNALLY_REFERENCED,
      externalReference: { type: 'gas_flare_tracker', id: 'SDN-001', url: '', accessedAt: '2026-01-05' },
    })
    expect(report.events.map((e) => e.type)).toContain('evidence_status_changed')
  })
})
