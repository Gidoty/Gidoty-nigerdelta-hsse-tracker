// ─── Physical constants ──────────────────────
// Molar masses: CODATA / IUPAC standard atomic weights.
// Gas constant: CODATA 2018 recommended value.
export const PHYSICAL_CONSTANTS = {
  CH4_MOLAR_MASS_G_MOL: 16.043,
  CO2_MOLAR_MASS_G_MOL: 44.009,
  GAS_CONSTANT_J_PER_MOL_K: 8.314462,
}

// Reference temperature/pressure conditions the user can pick for V_g and
// the resulting CH4 density. V_g must be expressed at the same conditions
// selected here — the UI must say so next to the input.
export const REFERENCE_CONDITIONS = {
  '0C': { id: '0C', label: '0°C, 101.325 kPa', tempK: 273.15, pressureKPa: 101.325 },
  '15C': { id: '15C', label: '15°C, 101.325 kPa (default)', tempK: 288.15, pressureKPa: 101.325 },
  '20C': { id: '20C', label: '20°C, 101.325 kPa', tempK: 293.15, pressureKPa: 101.325 },
}

export const DEFAULT_REFERENCE_CONDITION_ID = '15C'

export const VOLUME_SOURCE_OPTIONS = [
  { id: 'operator_data', label: 'Operator-reported data' },
  { id: 'satellite_estimate', label: 'NOSDRA/SDN Gas Flare Tracker satellite estimate' },
  { id: 'user_assumption', label: 'User assumption' },
]

// Flare combustion efficiency (η_f) options. Ids match
// scripts/emas/scenarios.json's destructionEfficiency ids exactly, so the
// two share one set of sourced values. Only these three are sourced;
// anything else must be entered as an explicit custom value by the user.
export const COMBUSTION_EFFICIENCY_OPTIONS = [
  {
    id: 'design_98',
    value: 0.98,
    label: '98% — design assumption (IPCC 2006)',
    source: 'IPCC 2006 Guidelines Vol. 2 Ch. 4, note citing the API Compendium of GHG Emissions Estimation Methodologies for the Oil and Gas Industry (2009)',
  },
  {
    id: 'plant2022_lit',
    value: 0.952,
    label: '95.2% — lit flares, measured, three US basins (Plant et al. 2022)',
    source: 'Plant et al. 2022, Science 377:1566–1571, doi:10.1126/science.abq0385',
  },
  {
    id: 'plant2022_effective',
    value: 0.911,
    label: '91.1% — fleet effective value including unlit flares, three US basins (Plant et al. 2022); not a single-flare efficiency',
    source: 'Plant et al. 2022, Science 377:1566–1571, doi:10.1126/science.abq0385',
  },
  {
    id: 'custom',
    value: null,
    label: 'Custom value (0.5–1.0)',
    source: 'User-specified',
  },
]

export const SENSITIVITY_EFFICIENCIES = [0.98, 0.952, 0.911]

// Required alongside a user-supplied CH₄ fraction — there is no default
// value for x_CH4 (see calculateCH4Slip/calculateCO2FromMethaneCombustion),
// so every calculation must say whether that fraction was measured,
// published, or assumed.
export const CH4_FRACTION_SOURCE_OPTIONS = [
  { id: 'measured', label: 'Measured' },
  { id: 'published', label: 'Published value' },
  { id: 'assumed', label: 'Assumed' },
]

export function validateCh4FractionSource(value) {
  if (!CH4_FRACTION_SOURCE_OPTIONS.some((opt) => opt.id === value)) {
    throw new RangeError('A CH₄ fraction source (measured, published, or assumed) must be selected')
  }
  return value
}

// Output labels for the two figures this module can be mistaken for a
// complete flare-gas GHG accounting. Neither covers C2+ hydrocarbons or
// the CO2 already present in the gas, and CH₄ density is computed
// treating the gas as ideal (ρ = P·M/(R·T)) — see ch4Density.
export const RESULT_LABELS = {
  co2: 'CO₂ — methane fraction only',
  co2e: 'CO₂e — methane slip only',
}

// GWP values, matched to a single assessment report (IPCC AR6), for fossil
// methane. Never mix an AR5 value with an AR6 value.
export const GWP = {
  GWP20: 82.5,
  GWP100: 29.8,
  source: 'IPCC AR6 WGI, Chapter 7, Table 7.15 (fossil CH₄)',
}

export const METHOD_VERSION = 'mass-balance-v1'

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validateVolumeM3(value) {
  if (!isFiniteNumber(value)) throw new RangeError('Gas volume (V_g) must be a number')
  if (value <= 0) throw new RangeError('Gas volume (V_g) must be greater than zero')
  return value
}

export function validateFraction(value, label) {
  if (!isFiniteNumber(value)) throw new RangeError(`${label} must be a number`)
  if (value < 0 || value > 1) throw new RangeError(`${label} must be between 0 and 1`)
  return value
}

export function validateCombustionEfficiency(value) {
  if (!isFiniteNumber(value)) throw new RangeError('Combustion efficiency (η_f) must be a number')
  if (value < 0.5 || value > 1) throw new RangeError('Combustion efficiency (η_f) must be between 0.5 and 1.0')
  return value
}

export function validateVolumeSource(value) {
  if (!VOLUME_SOURCE_OPTIONS.some((opt) => opt.id === value)) {
    throw new RangeError('A volume source must be selected')
  }
  return value
}

export function validateReferenceConditionId(value) {
  if (!REFERENCE_CONDITIONS[value]) throw new RangeError(`Unknown reference condition: ${value}`)
  return value
}

// ρ_CH4(T, P) = P·M / (R·T) — ideal gas law.
// P in Pa, M in kg/mol, R in J/(mol·K), T in K → ρ in kg/m³.
// At the 15°C/101.325 kPa default this evaluates to ≈0.678 kg/m³.
export function ch4Density(referenceConditionId = DEFAULT_REFERENCE_CONDITION_ID) {
  const ref = REFERENCE_CONDITIONS[validateReferenceConditionId(referenceConditionId)]
  const pressurePa = ref.pressureKPa * 1000
  const molarMassKgMol = PHYSICAL_CONSTANTS.CH4_MOLAR_MASS_G_MOL / 1000
  return (pressurePa * molarMassKgMol) / (PHYSICAL_CONSTANTS.GAS_CONSTANT_J_PER_MOL_K * ref.tempK)
}

function buildProvenance({ inputs, defaultsUsed, method, sources, referenceConditionId }) {
  return {
    inputs,
    defaultsUsed,
    method,
    methodVersion: METHOD_VERSION,
    referenceConditions: REFERENCE_CONDITIONS[referenceConditionId],
    sources,
  }
}

/**
 * Mass-balance methane slip (replaces the deleted IPCC Tier 1 "primary" factor):
 *   m_CH4_slip = V_g × x_CH4 × ρ_CH4(T_ref, P_ref) × (1 − η_f)
 *
 * V_g must already be expressed at the chosen reference conditions.
 */
export function calculateCH4Slip({
  volumeM3,
  ch4Fraction,
  ch4FractionSource,
  combustionEfficiency,
  referenceConditionId = DEFAULT_REFERENCE_CONDITION_ID,
  volumeSource,
}) {
  validateVolumeM3(volumeM3)
  validateFraction(ch4Fraction, 'CH₄ fraction (x_CH4)')
  if (ch4FractionSource !== undefined) validateCh4FractionSource(ch4FractionSource)
  validateCombustionEfficiency(combustionEfficiency)
  validateVolumeSource(volumeSource)
  validateReferenceConditionId(referenceConditionId)

  const densityKgM3 = ch4Density(referenceConditionId)
  const unburnedFraction = 1 - combustionEfficiency
  const ch4SlipTonnes = (volumeM3 * ch4Fraction * densityKgM3 * unburnedFraction) / 1000

  return {
    ch4SlipTonnes,
    densityKgM3,
    ...buildProvenance({
      inputs: { volumeM3, ch4Fraction, ch4FractionSource: ch4FractionSource ?? null, combustionEfficiency, volumeSource, referenceConditionId },
      defaultsUsed: {
        referenceConditionId: referenceConditionId === DEFAULT_REFERENCE_CONDITION_ID,
      },
      method: 'Mass balance',
      referenceConditionId,
      sources: [
        'm_CH4_slip = V_g × x_CH4 × ρ_CH4(T_ref,P_ref) × (1 − η_f)',
        'ρ_CH4 via ideal gas law: ρ = P·M/(R·T), M=16.043 g/mol, R=8.314462 J/(mol·K); gas treated as ideal',
      ],
    }),
  }
}

// Result at η_f = 0.98, 0.95, and 0.911 side by side, holding every other
// input fixed, so the user can see how sensitive the slip estimate is to
// the combustion-efficiency assumption.
export function calculateCH4Sensitivity({ volumeM3, ch4Fraction, referenceConditionId, volumeSource }) {
  return SENSITIVITY_EFFICIENCIES.map((combustionEfficiency) => ({
    combustionEfficiency,
    ...calculateCH4Slip({ volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId, volumeSource }),
  }))
}

/**
 * CO2 from methane combustion only (C2+ hydrocarbons excluded):
 *   CO2 = V_g × x_CH4 × ρ_CH4 × η_f × (44.009/16.043)
 */
export function calculateCO2FromMethaneCombustion({
  volumeM3,
  ch4Fraction,
  ch4FractionSource,
  combustionEfficiency,
  referenceConditionId = DEFAULT_REFERENCE_CONDITION_ID,
  volumeSource,
}) {
  validateVolumeM3(volumeM3)
  validateFraction(ch4Fraction, 'CH₄ fraction (x_CH4)')
  if (ch4FractionSource !== undefined) validateCh4FractionSource(ch4FractionSource)
  validateCombustionEfficiency(combustionEfficiency)
  validateVolumeSource(volumeSource)
  validateReferenceConditionId(referenceConditionId)

  const densityKgM3 = ch4Density(referenceConditionId)
  const molarRatio = PHYSICAL_CONSTANTS.CO2_MOLAR_MASS_G_MOL / PHYSICAL_CONSTANTS.CH4_MOLAR_MASS_G_MOL
  const co2Tonnes = (volumeM3 * ch4Fraction * densityKgM3 * combustionEfficiency * molarRatio) / 1000

  return {
    co2Tonnes,
    label: `${RESULT_LABELS.co2}; C2+ hydrocarbons and CO2 already present in the gas are excluded; gas treated as ideal`,
    ...buildProvenance({
      inputs: { volumeM3, ch4Fraction, ch4FractionSource: ch4FractionSource ?? null, combustionEfficiency, volumeSource, referenceConditionId },
      defaultsUsed: {
        referenceConditionId: referenceConditionId === DEFAULT_REFERENCE_CONDITION_ID,
      },
      method: 'Stoichiometric (methane fraction only)',
      referenceConditionId,
      sources: [`CO2 = V_g × x_CH4 × ρ_CH4 × η_f × (${PHYSICAL_CONSTANTS.CO2_MOLAR_MASS_G_MOL}/${PHYSICAL_CONSTANTS.CH4_MOLAR_MASS_G_MOL})`],
    }),
  }
}

/**
 * CO2-equivalent over both IPCC AR6 time horizons. Always report both
 * numbers together with their horizon label — never a bare "CO2e".
 */
export function calculateCO2Equivalent(ch4Tonnes) {
  if (!isFiniteNumber(ch4Tonnes) || ch4Tonnes < 0) {
    throw new RangeError('CH₄ mass (tonnes) must be a non-negative number')
  }
  return {
    co2e20yrTonnes: ch4Tonnes * GWP.GWP20,
    co2e100yrTonnes: ch4Tonnes * GWP.GWP100,
    gwp20Used: GWP.GWP20,
    gwp100Used: GWP.GWP100,
    source: GWP.source,
    label: RESULT_LABELS.co2e,
  }
}
