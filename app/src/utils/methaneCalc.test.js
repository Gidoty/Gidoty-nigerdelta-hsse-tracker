import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  calculateCH4Slip,
  calculateCH4Sensitivity,
  calculateCO2FromMethaneCombustion,
  calculateCO2Equivalent,
  ch4Density,
  SENSITIVITY_EFFICIENCIES,
  COMBUSTION_EFFICIENCY_OPTIONS,
  CH4_FRACTION_SOURCE_OPTIONS,
  validateCh4FractionSource,
  RESULT_LABELS,
} from './methaneCalc.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VECTORS_PATH = path.resolve(__dirname, '../../../validation/test_vectors.json')
const RESULTS_PATH = path.resolve(__dirname, '../../../validation/results/calculator_check.json')

const RELATIVE_TOLERANCE = 1e-9

function relativeError(actual, expected) {
  if (expected === 0) return Math.abs(actual)
  return Math.abs((actual - expected) / expected)
}

describe('methaneCalc validation vectors (validation/reference_calcs.py)', () => {
  const fixture = JSON.parse(fs.readFileSync(VECTORS_PATH, 'utf-8'))
  const comparisons = []

  for (const vector of fixture.vectors) {
    it(`vector ${vector.id}`, () => {
      const { volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId } = vector.inputs
      const volumeSource = 'user_assumption'

      if (vector.expectError) {
        expect(() =>
          calculateCH4Slip({ volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId, volumeSource }),
        ).toThrow()
        comparisons.push({ id: vector.id, expectError: true, threw: true, pass: true })
        return
      }

      const slip = calculateCH4Slip({ volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId, volumeSource })
      const co2 = calculateCO2FromMethaneCombustion({
        volumeM3,
        ch4Fraction,
        combustionEfficiency,
        referenceConditionId,
        volumeSource,
      })
      const co2e = calculateCO2Equivalent(slip.ch4SlipTonnes)
      const density = ch4Density(referenceConditionId)

      const fields = [
        ['ch4SlipTonnes', slip.ch4SlipTonnes, vector.expected.ch4SlipTonnes],
        ['co2FromCombustionTonnes', co2.co2Tonnes, vector.expected.co2FromCombustionTonnes],
        ['co2e20yrTonnes', co2e.co2e20yrTonnes, vector.expected.co2e20yrTonnes],
        ['co2e100yrTonnes', co2e.co2e100yrTonnes, vector.expected.co2e100yrTonnes],
        ['densityKgM3', density, vector.expected.densityKgM3],
      ]

      const fieldResults = fields.map(([name, actual, expected]) => ({
        field: name,
        actual,
        expected,
        relativeError: relativeError(actual, expected),
        withinTolerance: relativeError(actual, expected) <= RELATIVE_TOLERANCE,
      }))

      comparisons.push({ id: vector.id, expectError: false, fields: fieldResults, pass: fieldResults.every((f) => f.withinTolerance) })

      for (const field of fieldResults) {
        expect(field.relativeError, `${vector.id}.${field.field}`).toBeLessThanOrEqual(RELATIVE_TOLERANCE)
      }
    })
  }

  it('writes the comparison results for the record', () => {
    fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true })
    fs.writeFileSync(
      RESULTS_PATH,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          toleranceRelative: RELATIVE_TOLERANCE,
          vectorCount: comparisons.length,
          allPassed: comparisons.every((c) => c.pass),
          comparisons,
        },
        null,
        2,
      ),
    )
    expect(comparisons.length).toBe(fixture.vectors.length)
  })
})

describe('methaneCalc sensitivity table', () => {
  it('calculateCH4Sensitivity returns one row per SENSITIVITY_EFFICIENCIES entry, holding other inputs fixed', () => {
    const rows = calculateCH4Sensitivity({
      volumeM3: 48000,
      ch4Fraction: 0.9,
      referenceConditionId: '15C',
      volumeSource: 'user_assumption',
    })
    expect(rows).toHaveLength(SENSITIVITY_EFFICIENCIES.length)
    rows.forEach((row, i) => {
      expect(row.combustionEfficiency).toBe(SENSITIVITY_EFFICIENCIES[i])
      expect(row.ch4SlipTonnes).toBeGreaterThan(0)
    })
    // Higher combustion efficiency must mean less unburned methane slip.
    const sorted = [...rows].sort((a, b) => a.combustionEfficiency - b.combustionEfficiency)
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].ch4SlipTonnes).toBeLessThan(sorted[i - 1].ch4SlipTonnes)
    }
  })
})

describe('methaneCalc input validation', () => {
  const base = { volumeM3: 1000, ch4Fraction: 0.9, combustionEfficiency: 0.98, referenceConditionId: '15C', volumeSource: 'user_assumption' }

  it('rejects zero or negative volume', () => {
    expect(() => calculateCH4Slip({ ...base, volumeM3: 0 })).toThrow()
    expect(() => calculateCH4Slip({ ...base, volumeM3: -1 })).toThrow()
  })

  it('rejects a missing volume source', () => {
    expect(() => calculateCH4Slip({ ...base, volumeSource: undefined })).toThrow()
  })

  it('rejects CH4 fraction outside [0, 1]', () => {
    expect(() => calculateCH4Slip({ ...base, ch4Fraction: -0.01 })).toThrow()
    expect(() => calculateCH4Slip({ ...base, ch4Fraction: 1.01 })).toThrow()
  })

  it('rejects combustion efficiency outside [0.5, 1]', () => {
    expect(() => calculateCH4Slip({ ...base, combustionEfficiency: 0.49 })).toThrow()
    expect(() => calculateCH4Slip({ ...base, combustionEfficiency: 1.01 })).toThrow()
  })

  it('rejects NaN volume rather than silently propagating it', () => {
    expect(() => calculateCH4Slip({ ...base, volumeM3: Number.NaN })).toThrow()
  })

  it('never returns NaN or Infinity for valid inputs', () => {
    const result = calculateCH4Slip(base)
    expect(Number.isFinite(result.ch4SlipTonnes)).toBe(true)
  })

  it('rejects an omitted CH4 fraction — there is no default', () => {
    const { ch4Fraction: _ch4Fraction, ...withoutFraction } = base
    expect(() => calculateCH4Slip(withoutFraction)).toThrow()
    expect(() => calculateCO2FromMethaneCombustion(withoutFraction)).toThrow()
  })

  it('accepts an omitted ch4FractionSource (optional for existing callers such as scripts/emas)', () => {
    expect(() => calculateCH4Slip(base)).not.toThrow()
  })

  it('rejects an invalid ch4FractionSource when one is supplied', () => {
    expect(() => calculateCH4Slip({ ...base, ch4FractionSource: 'guessed' })).toThrow()
    expect(() => calculateCO2FromMethaneCombustion({ ...base, ch4FractionSource: 'guessed' })).toThrow()
  })

  it('accepts and records a valid ch4FractionSource in provenance', () => {
    const result = calculateCH4Slip({ ...base, ch4FractionSource: 'measured' })
    expect(result.inputs.ch4FractionSource).toBe('measured')
  })

  it('records ch4FractionSource as null (not undefined) when omitted', () => {
    expect(calculateCH4Slip(base).inputs.ch4FractionSource).toBeNull()
    expect(calculateCO2FromMethaneCombustion(base).inputs.ch4FractionSource).toBeNull()
  })

  it('rejects a missing volume source for calculateCO2FromMethaneCombustion too', () => {
    expect(() => calculateCO2FromMethaneCombustion({ ...base, volumeSource: undefined })).toThrow()
  })

  it('rejects combustion efficiency outside [0.5, 1] for calculateCO2FromMethaneCombustion too', () => {
    expect(() => calculateCO2FromMethaneCombustion({ ...base, combustionEfficiency: 0.49 })).toThrow()
    expect(() => calculateCO2FromMethaneCombustion({ ...base, combustionEfficiency: 1.01 })).toThrow()
  })

  it('reports defaultsUsed.referenceConditionId correctly for both the default and a non-default id', () => {
    expect(calculateCH4Slip(base).defaultsUsed.referenceConditionId).toBe(true)
    expect(calculateCH4Slip({ ...base, referenceConditionId: '0C' }).defaultsUsed.referenceConditionId).toBe(false)
    expect(calculateCO2FromMethaneCombustion(base).defaultsUsed.referenceConditionId).toBe(true)
    expect(calculateCO2FromMethaneCombustion({ ...base, referenceConditionId: '20C' }).defaultsUsed.referenceConditionId).toBe(false)
  })
})

describe('calculateCO2Equivalent input validation', () => {
  it('rejects a non-finite, non-negative mass (NaN is neither finite nor < 0)', () => {
    expect(() => calculateCO2Equivalent(Number.NaN)).toThrow()
    expect(() => calculateCO2Equivalent(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('rejects a negative mass', () => {
    expect(() => calculateCO2Equivalent(-1)).toThrow()
  })

  it('accepts zero', () => {
    expect(() => calculateCO2Equivalent(0)).not.toThrow()
  })
})

describe('validateCh4FractionSource', () => {
  it('accepts every declared CH4_FRACTION_SOURCE_OPTIONS id', () => {
    for (const opt of CH4_FRACTION_SOURCE_OPTIONS) {
      expect(validateCh4FractionSource(opt.id)).toBe(opt.id)
    }
  })

  it('rejects anything not in CH4_FRACTION_SOURCE_OPTIONS', () => {
    expect(() => validateCh4FractionSource('')).toThrow()
    expect(() => validateCh4FractionSource('guessed')).toThrow()
    expect(() => validateCh4FractionSource(undefined)).toThrow()
  })
})

describe('COMBUSTION_EFFICIENCY_OPTIONS', () => {
  it('includes exactly the three sourced destruction-efficiency values plus custom', () => {
    const sourced = COMBUSTION_EFFICIENCY_OPTIONS.filter((o) => o.id !== 'custom')
    expect(sourced.map((o) => o.value).sort()).toEqual([0.911, 0.952, 0.98].sort())
    expect(COMBUSTION_EFFICIENCY_OPTIONS.find((o) => o.id === 'custom').value).toBeNull()
  })

  it('ids match scripts/emas/scenarios.json destructionEfficiency ids', () => {
    const ids = COMBUSTION_EFFICIENCY_OPTIONS.map((o) => o.id)
    expect(ids).toContain('design_98')
    expect(ids).toContain('plant2022_lit')
    expect(ids).toContain('plant2022_effective')
  })

  it('every sourced option carries a non-empty source citation', () => {
    for (const opt of COMBUSTION_EFFICIENCY_OPTIONS) {
      if (opt.id === 'custom') continue
      expect(opt.source.length).toBeGreaterThan(0)
    }
  })
})

describe('RESULT_LABELS', () => {
  it('labels the CO2 figure "methane fraction only" and the CO2e figure "methane slip only"', () => {
    expect(RESULT_LABELS.co2).toMatch(/methane fraction only/)
    expect(RESULT_LABELS.co2e).toMatch(/methane slip only/)
  })

  it('calculateCO2FromMethaneCombustion and calculateCO2Equivalent surface these labels', () => {
    const co2 = calculateCO2FromMethaneCombustion({
      volumeM3: 1000,
      ch4Fraction: 0.9,
      combustionEfficiency: 0.98,
      referenceConditionId: '15C',
      volumeSource: 'user_assumption',
    })
    expect(co2.label).toContain(RESULT_LABELS.co2)
    const co2e = calculateCO2Equivalent(1)
    expect(co2e.label).toBe(RESULT_LABELS.co2e)
  })
})
