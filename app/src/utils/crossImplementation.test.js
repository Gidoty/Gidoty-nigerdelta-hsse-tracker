// Cross-implementation check: the app (JS) and the independent Python
// verifier (validation/canonical.py) must agree byte for byte on the
// canonical serialisation and hashes. This test (1) verifies every
// Python-sealed synthetic record in JS, (2) seals edge-case records in JS
// and writes them as exports for validation/cross_impl_check.py to verify
// in Python, and (3) writes seeded number-format vectors so the Python
// side can confirm its number formatting matches ECMAScript exactly.
// Results are written to validation/results/ from what actually ran.
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { appendEvent, buildSubmissionExport, canonicalize, sealReport, verifyReport, deriveRegulatoryStatus } from './integrity.js'

const VALIDATION = path.resolve(__dirname, '../../../validation')
const RESULTS = path.join(VALIDATION, 'results')
const EXPORT_DIR = path.join(RESULTS, 'js_exports')

function passes(v) {
  return v.payloadValid === true && v.eventChainValid === true && v.statusConsistent === true && v.eventLogComplete === true
}

describe('cross-implementation agreement', () => {
  it('verifies every Python-sealed synthetic record in JS', async () => {
    const data = JSON.parse(fs.readFileSync(path.join(VALIDATION, 'synthetic', 'synthetic_reports.json'), 'utf8'))
    let ok = 0
    const failed = []
    for (const r of data.reports) {
      const v = await verifyReport(r)
      if (passes(v)) ok++
      else failed.push(r.id)
    }
    fs.mkdirSync(RESULTS, { recursive: true })
    fs.writeFileSync(
      path.join(RESULTS, 'cross_impl_js.json'),
      JSON.stringify({ pythonSealedRecords: data.reports.length, verifiedInJs: ok, failedIds: failed }, null, 2),
    )
    expect(ok).toBe(data.reports.length)
  })

  it('writes JS-sealed edge-case exports for Python verification', async () => {
    const texts = [
      'Crude don spill for the creek, fish don die. Loss na ₦ plenty',
      'Ọ̀rọ̀ with Yoruba diacritics, "quotes", a \\ backslash and a tab\tend',
      '',
      'Emoji 🔥🛢️ and a line\nbreak',
      'Plain ASCII description',
      'Mixed 1e-7 text and numbers 0.30000000000000004',
    ]
    fs.rmSync(EXPORT_DIR, { recursive: true, force: true })
    fs.mkdirSync(EXPORT_DIR, { recursive: true })
    for (let k = 0; k < texts.length; k++) {
      let r = {
        id: `xlang-${k}`,
        submittedAt: new Date(Date.UTC(2026, 8, 1, 10, k)).toISOString(),
        incident: { type: k % 2 ? 'gas_flare' : 'oil_spill', subType: null, severity: 'serious', duration: k ? 'hours' : null, dateTime: '2026-09-01T09:30:00.000Z', description: texts[k] },
        location: { gps: { lat: 4.815333 + k * 0.1234567, lng: 7.049444 - k * 0.3, accuracy: [14, 12.5, 3, 0.1 + 0.2, 1e-7, 250][k] }, display: `Site ${k}`, state: 'Rivers', lga: 'Gokana', landmark: k === 2 ? null : 'Near jetty' },
        evidence: { photos: k === 0 ? [] : [`data:image/png;base64,iVBORw0KGgo${k}`, `data:image/png;base64,QUJD${k}`] },
        health: { healthImpact: k > 1, symptoms: k > 1 ? ['cough', 'eye irritation'] : [], affectedCount: k > 1 ? 7 : null },
        contact: { anonymous: true },
        regulatory: { nosdraNotified: false, nosdraNotifiedAt: null, cleanupStatus: 'pending' },
        evidenceStatus: { level: 'community_observed', externalReference: null, verification: null },
        audit: { language: k % 2 ? 'pcm' : 'en', consentVersion: 'NDPA-2023-v1', appVersion: 'xlang-test', userAgent: 'test' },
      }
      r = await sealReport(r)
      r = await appendEvent(r, 'nosdra_notified', { notifiedAt: '2026-09-02T08:00:00.000Z', ratio: 0.1 + 0.2 })
      r = await appendEvent(r, 'cleanup_status_changed', { status: 'in_progress' })
      r = { ...r, regulatory: { ...r.regulatory, ...deriveRegulatoryStatus(r.events) } }
      expect(passes(await verifyReport(r))).toBe(true)
      fs.writeFileSync(path.join(EXPORT_DIR, `js_export_${k}.json`), JSON.stringify(buildSubmissionExport(r)))
    }
  })

  it('writes seeded number-format vectors', () => {
    let seed = 20260930
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    const values = [14, 14.5, 0.1 + 0.2, 1e-7, 5e-7, 1e-6, 1e20, 1e21, 1.5e21, -3, -0.5, 2.5e-8, 9007199254740993, 123456789.125]
    for (let i = 0; i < 2000; i++) values.push((rand() - 0.5) * 2000)
    for (let i = 0; i < 2000; i++) values.push((rand() < 0.5 ? -1 : 1) * 10 ** (rand() * 37 - 12))
    const vectors = values.map((x) => {
      const view = new DataView(new ArrayBuffer(8))
      view.setFloat64(0, x)
      let bits = ''
      for (let b = 0; b < 8; b++) bits += view.getUint8(b).toString(16).padStart(2, '0')
      return { bits, js: canonicalize(x) }
    })
    fs.writeFileSync(path.join(RESULTS, 'number_format_vectors.json'), JSON.stringify(vectors))
    expect(vectors.length).toBe(values.length)
  })
})
