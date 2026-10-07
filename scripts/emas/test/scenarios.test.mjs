import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const scenarios = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'scenarios.json'), 'utf8'))

test('destruction efficiency values match the spec exactly', () => {
  const values = scenarios.destructionEfficiency.map((x) => x.value).sort()
  assert.deepStrictEqual(values, [0.911, 0.952, 0.98])
})

test('methane volume fractions match the spec and are all provisional', () => {
  const values = scenarios.methaneVolumeFraction.map((x) => x.value).sort()
  assert.deepStrictEqual(values, [0.75, 0.85, 0.95])
  for (const mf of scenarios.methaneVolumeFraction) {
    assert.strictEqual(mf.status, 'PROVISIONAL')
    assert.strictEqual(mf.source, 'AUTHOR TO PROVIDE')
  }
})

test('reference temperatures are 0/15/20 C at 101.325 kPa and map to app reference condition ids', () => {
  const celsius = scenarios.referenceTemperature.map((x) => x.celsius).sort((a, b) => a - b)
  assert.deepStrictEqual(celsius, [0, 15, 20])
  for (const rt of scenarios.referenceTemperature) {
    assert.strictEqual(rt.pressureKPa, 101.325)
    assert.strictEqual(rt.referenceConditionId, `${rt.celsius}C`)
  }
})

test('volume uncertainty is +/-9.5% from Elvidge et al. 2016', () => {
  assert.strictEqual(scenarios.volumeUncertainty.plusMinusPercent, 9.5)
  assert.strictEqual(scenarios.volumeUncertainty.source, 'Elvidge et al. 2016')
})

test('GWP matches AR6 fossil methane', () => {
  assert.strictEqual(scenarios.gwp.gwp20, 82.5)
  assert.strictEqual(scenarios.gwp.gwp100, 29.8)
})

test('central case is 0.98 destruction efficiency, 0.85 methane fraction, 15C', () => {
  const de = scenarios.destructionEfficiency.find((x) => x.id === scenarios.centralCase.destructionEfficiencyId)
  const mf = scenarios.methaneVolumeFraction.find((x) => x.id === scenarios.centralCase.methaneVolumeFractionId)
  const rt = scenarios.referenceTemperature.find((x) => x.id === scenarios.centralCase.referenceTemperatureId)
  assert.strictEqual(de.value, 0.98)
  assert.strictEqual(mf.value, 0.85)
  assert.strictEqual(rt.celsius, 15)
})
