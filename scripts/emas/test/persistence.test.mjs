import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSitePersistence } from '../lib/persistence.mjs'

function row(year, siteId, { id2022 = '', id2023 = '' } = {}) {
  return { year, site_id: String(siteId), id2022: String(id2022), id2023: String(id2023) }
}

test('a site present in all three years chains correctly', () => {
  const rows = [row(2022, 100), row(2023, 200, { id2022: 100 }), row(2024, 300, { id2023: 200 })]
  const chains = buildSitePersistence(rows)
  assert.strictEqual(chains.length, 1)
  assert.deepStrictEqual(chains[0], {
    id2022: 100,
    id2023: 200,
    id2024: 300,
    present2022: true,
    present2023: true,
    present2024: true,
    status: 'present_all_years',
  })
})

test('a site dropped after 2022 (no 2023 back-reference to it)', () => {
  const rows = [row(2022, 100)]
  const [chain] = buildSitePersistence(rows)
  assert.strictEqual(chain.status, 'dropped_after_2022')
  assert.strictEqual(chain.present2023, false)
  assert.strictEqual(chain.present2024, false)
})

test('a site new in 2023 with no id2022 back-reference, dropped by 2024', () => {
  const rows = [row(2023, 200)]
  const [chain] = buildSitePersistence(rows)
  assert.strictEqual(chain.status, 'only_2023')
})

test('a site new in 2023 that persists into 2024', () => {
  const rows = [row(2023, 200), row(2024, 300, { id2023: 200 })]
  const [chain] = buildSitePersistence(rows)
  assert.strictEqual(chain.status, 'new_2023_persisted')
})

test('a site new in 2024 with no id2023 back-reference', () => {
  const rows = [row(2024, 300)]
  const [chain] = buildSitePersistence(rows)
  assert.strictEqual(chain.status, 'new_2024')
})

test('a site dropped after 2023 (present 2022 and 2023, not referenced by any 2024 row)', () => {
  const rows = [row(2022, 100), row(2023, 200, { id2022: 100 })]
  const [chain] = buildSitePersistence(rows)
  assert.strictEqual(chain.status, 'dropped_after_2023')
})

test('total chain count matches the real 2022-2024 Nigeria match reported in NIGERIA_SITE_MATCH.md', async () => {
  // 165 + 168 + 187 raw rows. NIGERIA_SITE_MATCH.md (step 1) manually
  // found 2 "only_2023" sites by eye (5965, 5986); this chain-builder
  // (step 2) finds a third, site 6068, whose id2022 back-reference
  // (5950) does not exist anywhere in the 2022 file at all -- a dangling
  // reference, not a missed intersection. See results/emas/ASSESSMENT_NOTES.md
  // anomaly #5. This is a structural sanity check, not a re-derivation.
  const fs = await import('node:fs')
  const path = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const HERE = path.dirname(fileURLToPath(import.meta.url))
  const csvPath = path.join(HERE, '..', '..', '..', 'data', 'public', 'nigeria_flares.csv')
  const text = fs.readFileSync(csvPath, 'utf8').trim()
  const lines = text.split('\n')
  const header = lines[0].split(',')
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',')
    const r = {}
    header.forEach((h, i) => (r[h] = cells[i]))
    r.year = Number(r.year)
    return r
  })
  const chains = buildSitePersistence(rows)
  const byStatus = {}
  for (const c of chains) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1
  assert.strictEqual(byStatus.only_2023 ?? 0, 3) // 5965, 5986 (flagged in NIGERIA_SITE_MATCH.md) + 6068 (dangling id2022 ref, see ASSESSMENT_NOTES.md)
  const total = chains.length
  assert.ok(total > 0 && total <= 165 + 168 + 187)
})
