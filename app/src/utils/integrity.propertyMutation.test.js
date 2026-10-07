// Property-based mutation testing for the integrity scheme (Task B.2,
// EMAS step 3): instead of the fixed scenario list in
// validation/tamper_test.py, fast-check picks a random base record, a
// random single field to mutate, and a random replacement value, many
// times over. Each field is pre-classified as either "protected" (in the
// evidence payload, the event log, or cross-checked stored status — a
// mutation there must be flagged) or "declared mutable / excluded" (a
// mutation there must NOT be flagged). The exact mutated records this run
// produces are exported to validation/results/ so
// validation/property_mutation_check.py can re-verify the same records
// with the independent Python implementation and report its own counts.
import fs from 'node:fs'
import path from 'node:path'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { appendEvent, sealReport, verifyReport } from './integrity.js'

const VALIDATION = path.resolve(__dirname, '../../../validation')
const RESULTS = path.join(VALIDATION, 'results')
const EXPORT_PATH = path.join(RESULTS, 'property_mutations.json')

function isFlagged(v) {
  return v.payloadValid === false || v.eventChainValid === false || v.statusConsistent === false || v.eventLogComplete === false
}

async function buildBaseRecords() {
  const skeleton = (i) => ({
    id: `prop-base-${i}`,
    submittedAt: new Date(Date.UTC(2026, 9, 1, 8, i)).toISOString(),
    incident: {
      type: i % 2 ? 'gas_flare' : 'oil_spill',
      subType: i % 2 ? 'routine_flare' : 'pipeline_leak',
      severity: 'serious',
      duration: 'days',
      dateTime: '2026-09-30T20:00:00.000Z',
      description: `Base record ${i} for property mutation testing.`,
    },
    location: { gps: { lat: 4.8 + i * 0.1, lng: 7.0 - i * 0.1, accuracy: 10 }, display: `Site ${i}`, state: 'Rivers', lga: 'Gokana', landmark: 'Near market' },
    evidence: { photos: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='] },
    health: { healthImpact: true, symptoms: ['cough'], affectedCount: '6-20' },
    contact: { anonymous: false, name: 'Test Reporter', phone: '+2348011111111', wantsNotification: true },
    regulatory: {
      nosdraNotified: false,
      nosdraNotifiedAt: null,
      nuprcNotified: false,
      nuprcNotifiedAt: null,
      operatorResponse: null,
      jivScheduled: false,
      jivDate: null,
      jivCompleted: false,
      cleanupStatus: 'pending',
    },
    evidenceStatus: { level: 'community_observed', externalReference: null, verification: null },
    audit: { consentVersion: 'NDPA-2023-v1', language: 'en', userAgent: 'property-test-agent', appVersion: 'property-test' },
  })

  const records = []
  for (let i = 0; i < 3; i++) {
    let r = await sealReport(skeleton(i))
    r = await appendEvent(r, 'nosdra_notified', { notifiedAt: '2026-10-02T09:00:00.000Z' })
    r = await appendEvent(r, 'cleanup_status_changed', { status: 'in_progress' })
    r = await appendEvent(r, 'evidence_status_changed', {
      level: 'independently_verified',
      verification: { source: 'JIV report', reference: `JIV-PROP-${i}` },
    })
    r = {
      ...r,
      regulatory: { ...r.regulatory, nosdraNotified: true, nosdraNotifiedAt: '2026-10-02T09:00:00.000Z', cleanupStatus: 'in_progress' },
      evidenceStatus: { level: 'independently_verified', externalReference: null, verification: { source: 'JIV report', reference: `JIV-PROP-${i}` } },
    }
    expect(isFlagged(await verifyReport(r))).toBe(false)
    records.push(r)
  }
  return records
}

// Each target is "protected" (must be detected) or "mutable" (must not
// be). `mutate(record, value)` returns a new record, or null if this
// target doesn't apply to the given record (e.g. not enough events).
const PROTECTED_TARGETS = [
  { name: 'incident.description', category: 'evidence_payload', mutate: (r, v) => ({ ...r, incident: { ...r.incident, description: String(v) } }) },
  { name: 'incident.severity', category: 'evidence_payload', mutate: (r, v) => ({ ...r, incident: { ...r.incident, severity: String(v) } }) },
  { name: 'location.state', category: 'evidence_payload', mutate: (r, v) => ({ ...r, location: { ...r.location, state: String(v) } }) },
  { name: 'location.gps.lat', category: 'evidence_payload', mutate: (r, v) => ({ ...r, location: { ...r.location, gps: { ...r.location.gps, lat: Number(v) || 0 } } }) },
  { name: 'health.affectedCount', category: 'evidence_payload', mutate: (r, v) => ({ ...r, health: { ...r.health, affectedCount: String(v) } }) },
  { name: 'submittedAt', category: 'evidence_payload', mutate: (r, v) => ({ ...r, submittedAt: String(v) }) },
  {
    name: 'evidence.photos[0]',
    category: 'evidence_payload',
    mutate: (r, v) => {
      if (!r.evidence?.photos?.length) return null
      const [prefix, b64] = r.evidence.photos[0].split(',')
      const flipped = b64.slice(0, 5) + String(v).slice(0, 1) + b64.slice(6)
      return { ...r, evidence: { ...r.evidence, photos: [`${prefix},${flipped}`, ...r.evidence.photos.slice(1)] } }
    },
  },
  {
    name: 'events[0].data',
    category: 'event_log',
    mutate: (r, v) => {
      if (!r.events?.length) return null
      const events = [...r.events]
      events[0] = { ...events[0], data: { ...events[0].data, injected: v } }
      return { ...r, events }
    },
  },
  {
    name: 'events[1].prevEventHash',
    category: 'event_log',
    mutate: (r, v) => {
      if ((r.events?.length ?? 0) < 2) return null
      const events = [...r.events]
      events[1] = { ...events[1], prevEventHash: `broken-${v}` }
      return { ...r, events }
    },
  },
  {
    name: 'events truncated (eventCount/headEventHash stale)',
    category: 'event_log',
    mutate: (r) => {
      if (!r.events?.length) return null
      return { ...r, events: r.events.slice(0, -1) }
    },
  },
  {
    name: 'regulatory.nosdraNotified (direct edit, no event)',
    category: 'stored_status',
    mutate: (r) => ({ ...r, regulatory: { ...r.regulatory, nosdraNotified: !r.regulatory.nosdraNotified } }),
  },
  {
    name: 'regulatory.cleanupStatus (direct edit, no event)',
    category: 'stored_status',
    mutate: (r) => ({ ...r, regulatory: { ...r.regulatory, cleanupStatus: r.regulatory.cleanupStatus === 'completed' ? 'pending' : 'completed' } }),
  },
  {
    name: 'evidenceStatus.level (direct edit, no event)',
    category: 'stored_status',
    mutate: (r) => ({ ...r, evidenceStatus: { ...r.evidenceStatus, level: 'community_observed' } }),
  },
]

const MUTABLE_TARGETS = [
  { name: 'contact.name', category: 'declared_mutable', mutate: (r, v) => ({ ...r, contact: { ...r.contact, name: String(v) } }) },
  { name: 'contact.phone', category: 'declared_mutable', mutate: (r, v) => ({ ...r, contact: { ...r.contact, phone: String(v) } }) },
  { name: 'audit.userAgent', category: 'declared_excluded', mutate: (r, v) => ({ ...r, audit: { ...r.audit, userAgent: String(v) } }) },
  { name: 'regulatory.nuprcNotified', category: 'coverage_gap', mutate: (r) => ({ ...r, regulatory: { ...r.regulatory, nuprcNotified: !r.regulatory.nuprcNotified } }) },
  { name: 'regulatory.operatorResponse', category: 'coverage_gap', mutate: (r, v) => ({ ...r, regulatory: { ...r.regulatory, operatorResponse: String(v) } }) },
  { name: 'regulatory.jivCompleted', category: 'coverage_gap', mutate: (r) => ({ ...r, regulatory: { ...r.regulatory, jivCompleted: !r.regulatory.jivCompleted } }) },
]

const ALL_TARGETS = [...PROTECTED_TARGETS.map((t) => ({ ...t, shouldDetect: true })), ...MUTABLE_TARGETS.map((t) => ({ ...t, shouldDetect: false }))]

describe('integrity property-based mutation testing (fast-check)', () => {
  it('flags every protected-field mutation and passes every declared mutable/excluded mutation, across many random trials', async () => {
    const bases = await buildBaseRecords()
    const NUM_RUNS = 300

    const trials = fc.sample(
      fc.record({
        baseIndex: fc.integer({ min: 0, max: bases.length - 1 }),
        target: fc.constantFrom(...ALL_TARGETS),
        value: fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.double({ noNaN: true })),
      }),
      { numRuns: NUM_RUNS, seed: 20261007 },
    )

    const exportedRecords = []
    const counts = {}
    const failures = []

    for (const { baseIndex, target, value } of trials) {
      const base = bases[baseIndex]
      const mutated = target.mutate(JSON.parse(JSON.stringify(base)), value)
      if (mutated === null) continue // target doesn't apply to this base (e.g. not enough events)

      const verdict = await verifyReport(mutated)
      const flagged = isFlagged(verdict)
      const correct = flagged === target.shouldDetect

      const key = target.shouldDetect ? 'protected' : 'mutable'
      counts[key] ??= { attempted: 0, correct: 0 }
      counts[key].attempted += 1
      if (correct) counts[key].correct += 1
      else failures.push({ target: target.name, category: target.category, shouldDetect: target.shouldDetect, flagged })

      exportedRecords.push({
        target: target.name,
        category: target.category,
        shouldDetect: target.shouldDetect,
        detected: flagged,
        correct,
        record: mutated,
      })
    }

    fs.mkdirSync(RESULTS, { recursive: true })
    fs.writeFileSync(
      EXPORT_PATH,
      JSON.stringify(
        {
          generatedBy: 'app/src/utils/integrity.propertyMutation.test.js',
          tool: 'fast-check',
          numRunsRequested: NUM_RUNS,
          trialsRun: exportedRecords.length,
          counts,
          allCorrectInJs: failures.length === 0,
          records: exportedRecords,
        },
        null,
        2,
      ),
    )

    console.log(`Property mutation trials: ${exportedRecords.length} (protected ${counts.protected?.attempted ?? 0}, mutable ${counts.mutable?.attempted ?? 0})`)
    console.log(`Protected correctly detected: ${counts.protected?.correct ?? 0}/${counts.protected?.attempted ?? 0}`)
    console.log(`Mutable/excluded correctly passed: ${counts.mutable?.correct ?? 0}/${counts.mutable?.attempted ?? 0}`)

    expect(failures, JSON.stringify(failures, null, 2)).toEqual([])
    expect(exportedRecords.length).toBeGreaterThan(0)
  })
})
