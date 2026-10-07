import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bcmToM3, M3_PER_BCM } from '../lib/units.mjs'

test('M3_PER_BCM is exactly 1e9', () => {
  assert.strictEqual(M3_PER_BCM, 1e9)
})

test('bcmToM3 converts 1 BCM to 1e9 m3', () => {
  assert.strictEqual(bcmToM3(1), 1e9)
})

test('bcmToM3 converts a typical site volume correctly', () => {
  // A real value from data/public/nigeria_flares.csv (2022, site 5772).
  assert.strictEqual(bcmToM3(0.18783718525), 0.18783718525 * 1e9)
})

test('bcmToM3 converts zero', () => {
  assert.strictEqual(bcmToM3(0), 0)
})

test('bcmToM3 rejects non-finite input', () => {
  assert.throws(() => bcmToM3(NaN), RangeError)
  assert.throws(() => bcmToM3(Infinity), RangeError)
  assert.throws(() => bcmToM3('0.5'), RangeError)
})
