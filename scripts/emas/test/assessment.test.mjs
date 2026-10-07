import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeSiteScenario, volumeBounds, scenarioCombinations, centralCombination } from '../lib/assessment.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const scenarios = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'scenarios.json'), 'utf8'))

test('computeSiteScenario matches the app calculator directly for a known row (2022 site 5772)', async () => {
  const { calculateCH4Slip, calculateCO2FromMethaneCombustion, calculateCO2Equivalent } = await import(
    '../../../app/src/utils/methaneCalc.js'
  )
  const volumeBcm = 0.18783718525
  const volumeM3 = volumeBcm * 1e9
  const expectedSlip = calculateCH4Slip({
    volumeM3,
    ch4Fraction: 0.85,
    combustionEfficiency: 0.98,
    referenceConditionId: '15C',
    volumeSource: 'satellite_estimate',
  })
  const expectedCo2 = calculateCO2FromMethaneCombustion({
    volumeM3,
    ch4Fraction: 0.85,
    combustionEfficiency: 0.98,
    referenceConditionId: '15C',
    volumeSource: 'satellite_estimate',
  })
  const expectedCo2e = calculateCO2Equivalent(expectedSlip.ch4SlipTonnes)

  const result = computeSiteScenario({
    volumeBcm,
    destructionEfficiency: 0.98,
    methaneFraction: 0.85,
    referenceConditionId: '15C',
  })

  assert.strictEqual(result.volumeM3, volumeM3)
  assert.strictEqual(result.ch4SlipTonnes, expectedSlip.ch4SlipTonnes)
  assert.strictEqual(result.co2TonnesMethaneFractionOnly, expectedCo2.co2Tonnes)
  assert.strictEqual(result.co2e20yrTonnesMethaneSlipOnly, expectedCo2e.co2e20yrTonnes)
  assert.strictEqual(result.co2e100yrTonnesMethaneSlipOnly, expectedCo2e.co2e100yrTonnes)
})

test('volumeBounds applies +/- percent symmetrically', () => {
  const { lowBcm, highBcm } = volumeBounds(1, 9.5)
  assert.strictEqual(lowBcm, 0.905)
  assert.strictEqual(highBcm, 1.095)
})

test('scenarioCombinations produces exactly 27 combinations (3x3x3)', () => {
  const combos = scenarioCombinations(scenarios)
  assert.strictEqual(combos.length, 27)
  // every combo must be unique
  const keys = new Set(combos.map((c) => `${c.destructionEfficiencyId}|${c.methaneFractionId}|${c.referenceTemperatureId}`))
  assert.strictEqual(keys.size, 27)
})

test('centralCombination resolves to the documented central case', () => {
  const central = centralCombination(scenarios)
  assert.strictEqual(central.destructionEfficiency, 0.98)
  assert.strictEqual(central.methaneFraction, 0.85)
  assert.strictEqual(central.referenceConditionId, '15C')
})

test('computeSiteScenario throws for zero volume, same as the underlying calculator', () => {
  assert.throws(() =>
    computeSiteScenario({ volumeBcm: 0, destructionEfficiency: 0.98, methaneFraction: 0.85, referenceConditionId: '15C' }),
  )
})
