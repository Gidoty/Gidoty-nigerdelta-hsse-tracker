// Core per-site-scenario calculation, shared by run_assessment.mjs and
// its tests. Imports the application's methane calculator unchanged —
// no formula is reimplemented here.
import {
  calculateCH4Slip,
  calculateCO2FromMethaneCombustion,
  calculateCO2Equivalent,
} from '../../../app/src/utils/methaneCalc.js'
import { bcmToM3 } from './units.mjs'

// The flare volumes in data/public/nigeria_flares.csv come from EOG VIIRS
// satellite detection, not operator-reported data or a user's own
// assumption — 'satellite_estimate' is the closest of the app's three
// VOLUME_SOURCE_OPTIONS ids to what this data actually is.
export const VOLUME_SOURCE = 'satellite_estimate'

/**
 * Run the app's methane calculator for one site-year row under one
 * scenario combination. volumeBcm is converted to m^3 explicitly via
 * bcmToM3 before being passed to the calculator.
 */
export function computeSiteScenario({ volumeBcm, destructionEfficiency, methaneFraction, referenceConditionId }) {
  const volumeM3 = bcmToM3(volumeBcm)
  const slip = calculateCH4Slip({
    volumeM3,
    ch4Fraction: methaneFraction,
    combustionEfficiency: destructionEfficiency,
    referenceConditionId,
    volumeSource: VOLUME_SOURCE,
  })
  const co2 = calculateCO2FromMethaneCombustion({
    volumeM3,
    ch4Fraction: methaneFraction,
    combustionEfficiency: destructionEfficiency,
    referenceConditionId,
    volumeSource: VOLUME_SOURCE,
  })
  const co2e = calculateCO2Equivalent(slip.ch4SlipTonnes)
  return {
    volumeM3,
    ch4SlipTonnes: slip.ch4SlipTonnes,
    co2TonnesMethaneFractionOnly: co2.co2Tonnes,
    co2e20yrTonnesMethaneSlipOnly: co2e.co2e20yrTonnes,
    co2e100yrTonnesMethaneSlipOnly: co2e.co2e100yrTonnes,
  }
}

/** +/- percent volume uncertainty applied to the BCM value before conversion. */
export function volumeBounds(volumeBcm, plusMinusPercent) {
  const factor = plusMinusPercent / 100
  return {
    lowBcm: volumeBcm * (1 - factor),
    highBcm: volumeBcm * (1 + factor),
  }
}

export function scenarioCombinations(scenarios) {
  const combos = []
  for (const de of scenarios.destructionEfficiency) {
    for (const mf of scenarios.methaneVolumeFraction) {
      for (const rt of scenarios.referenceTemperature) {
        combos.push({
          destructionEfficiencyId: de.id,
          destructionEfficiency: de.value,
          methaneFractionId: mf.id,
          methaneFraction: mf.value,
          referenceTemperatureId: rt.id,
          referenceConditionId: rt.referenceConditionId,
        })
      }
    }
  }
  return combos
}

export function centralCombination(scenarios) {
  const de = scenarios.destructionEfficiency.find((x) => x.id === scenarios.centralCase.destructionEfficiencyId)
  const mf = scenarios.methaneVolumeFraction.find((x) => x.id === scenarios.centralCase.methaneVolumeFractionId)
  const rt = scenarios.referenceTemperature.find((x) => x.id === scenarios.centralCase.referenceTemperatureId)
  if (!de || !mf || !rt) throw new Error('scenarios.json centralCase references an unknown id')
  return {
    destructionEfficiencyId: de.id,
    destructionEfficiency: de.value,
    methaneFractionId: mf.id,
    methaneFraction: mf.value,
    referenceTemperatureId: rt.id,
    referenceConditionId: rt.referenceConditionId,
  }
}
