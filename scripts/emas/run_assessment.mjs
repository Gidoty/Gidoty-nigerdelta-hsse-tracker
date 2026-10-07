#!/usr/bin/env node
// Runs the EMAS methane assessment for every Nigerian flare site-year in
// data/public/nigeria_flares.csv, under every scenario combination in
// scenarios.json, using the application's own methane calculator
// (app/src/utils/methaneCalc.js) unchanged. Writes CSV outputs to
// results/emas/. No scenario value is hard-coded here — everything
// numeric comes from scripts/emas/scenarios.json.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readCsv, writeCsv } from './lib/csv.mjs'
import { computeSiteScenario, volumeBounds, scenarioCombinations, centralCombination } from './lib/assessment.mjs'
import { buildSitePersistence } from './lib/persistence.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(HERE, '..', '..')
const NIGERIA_CSV = path.join(REPO_ROOT, 'data', 'public', 'nigeria_flares.csv')
const SCENARIOS_PATH = path.join(HERE, 'scenarios.json')
const RESULTS_DIR = path.join(REPO_ROOT, 'results', 'emas')

export function loadScenarios() {
  return JSON.parse(fs.readFileSync(SCENARIOS_PATH, 'utf8'))
}

export function loadNigeriaRows() {
  return readCsv(NIGERIA_CSV).map((r) => ({ ...r, year: Number(r.year), volume: Number(r.volume) }))
}

// 21 rows in data/public/nigeria_flares.csv have volume == 0 (no negative
// volumes exist). methaneCalc.js's own calculateCH4Slip() rejects
// volumeM3 <= 0 (validateVolumeM3) — that validation is part of the
// "unchanged" module this script must not alter, so these rows cannot be
// run through it. They are excluded from every calculator-based output
// below, not patched or assumed to be zero-emission; see
// results/emas/ASSESSMENT_NOTES.md for the full list and site IDs.
export function splitCalculableRows(rows) {
  const calculable = rows.filter((r) => r.volume > 0)
  const excludedZeroOrNegative = rows.filter((r) => !(r.volume > 0))
  return { calculable, excludedZeroOrNegative }
}

export function buildFullGrid(rows, scenarios) {
  const combos = scenarioCombinations(scenarios)
  const grid = []
  for (const row of rows) {
    for (const combo of combos) {
      const result = computeSiteScenario({
        volumeBcm: row.volume,
        destructionEfficiency: combo.destructionEfficiency,
        methaneFraction: combo.methaneFraction,
        referenceConditionId: combo.referenceConditionId,
      })
      grid.push({
        year: row.year,
        site_id: row.site_id,
        sheet: row.sheet,
        flare_type: row.flare_type,
        latitude: row.latitude,
        longitude: row.longitude,
        volume_bcm: row.volume,
        volume_m3: result.volumeM3,
        destructionEfficiencyId: combo.destructionEfficiencyId,
        destructionEfficiency: combo.destructionEfficiency,
        methaneFractionId: combo.methaneFractionId,
        methaneFraction: combo.methaneFraction,
        referenceTemperatureId: combo.referenceTemperatureId,
        referenceConditionId: combo.referenceConditionId,
        ch4_slip_tonnes: result.ch4SlipTonnes,
        co2_tonnes_methane_fraction_only: result.co2TonnesMethaneFractionOnly,
        co2e_20yr_tonnes_methane_slip_only: result.co2e20yrTonnesMethaneSlipOnly,
        co2e_100yr_tonnes_methane_slip_only: result.co2e100yrTonnesMethaneSlipOnly,
      })
    }
  }
  return grid
}

const FULL_GRID_COLUMNS = [
  'year', 'site_id', 'sheet', 'flare_type', 'latitude', 'longitude', 'volume_bcm', 'volume_m3',
  'destructionEfficiencyId', 'destructionEfficiency', 'methaneFractionId', 'methaneFraction',
  'referenceTemperatureId', 'referenceConditionId',
  'ch4_slip_tonnes', 'co2_tonnes_methane_fraction_only',
  'co2e_20yr_tonnes_methane_slip_only', 'co2e_100yr_tonnes_methane_slip_only',
]

export function buildSiteYearEstimates(rows, scenarios) {
  const central = centralCombination(scenarios)
  const plusMinus = scenarios.volumeUncertainty.plusMinusPercent
  return rows.map((row) => {
    const { lowBcm, highBcm } = volumeBounds(row.volume, plusMinus)
    const centralResult = computeSiteScenario({
      volumeBcm: row.volume,
      destructionEfficiency: central.destructionEfficiency,
      methaneFraction: central.methaneFraction,
      referenceConditionId: central.referenceConditionId,
    })
    const lowResult = computeSiteScenario({
      volumeBcm: lowBcm,
      destructionEfficiency: central.destructionEfficiency,
      methaneFraction: central.methaneFraction,
      referenceConditionId: central.referenceConditionId,
    })
    const highResult = computeSiteScenario({
      volumeBcm: highBcm,
      destructionEfficiency: central.destructionEfficiency,
      methaneFraction: central.methaneFraction,
      referenceConditionId: central.referenceConditionId,
    })
    return {
      year: row.year,
      site_id: row.site_id,
      sheet: row.sheet,
      flare_type: row.flare_type,
      latitude: row.latitude,
      longitude: row.longitude,
      volume_bcm_central: row.volume,
      volume_bcm_low: lowBcm,
      volume_bcm_high: highBcm,
      ch4_slip_tonnes_central: centralResult.ch4SlipTonnes,
      ch4_slip_tonnes_low: lowResult.ch4SlipTonnes,
      ch4_slip_tonnes_high: highResult.ch4SlipTonnes,
      co2_tonnes_methane_fraction_only_central: centralResult.co2TonnesMethaneFractionOnly,
      co2_tonnes_methane_fraction_only_low: lowResult.co2TonnesMethaneFractionOnly,
      co2_tonnes_methane_fraction_only_high: highResult.co2TonnesMethaneFractionOnly,
      co2e_20yr_tonnes_methane_slip_only_central: centralResult.co2e20yrTonnesMethaneSlipOnly,
      co2e_20yr_tonnes_methane_slip_only_low: lowResult.co2e20yrTonnesMethaneSlipOnly,
      co2e_20yr_tonnes_methane_slip_only_high: highResult.co2e20yrTonnesMethaneSlipOnly,
      co2e_100yr_tonnes_methane_slip_only_central: centralResult.co2e100yrTonnesMethaneSlipOnly,
      co2e_100yr_tonnes_methane_slip_only_low: lowResult.co2e100yrTonnesMethaneSlipOnly,
      co2e_100yr_tonnes_methane_slip_only_high: highResult.co2e100yrTonnesMethaneSlipOnly,
    }
  })
}

const SITE_YEAR_COLUMNS = [
  'year', 'site_id', 'sheet', 'flare_type', 'latitude', 'longitude',
  'volume_bcm_central', 'volume_bcm_low', 'volume_bcm_high',
  'ch4_slip_tonnes_central', 'ch4_slip_tonnes_low', 'ch4_slip_tonnes_high',
  'co2_tonnes_methane_fraction_only_central', 'co2_tonnes_methane_fraction_only_low', 'co2_tonnes_methane_fraction_only_high',
  'co2e_20yr_tonnes_methane_slip_only_central', 'co2e_20yr_tonnes_methane_slip_only_low', 'co2e_20yr_tonnes_methane_slip_only_high',
  'co2e_100yr_tonnes_methane_slip_only_central', 'co2e_100yr_tonnes_methane_slip_only_low', 'co2e_100yr_tonnes_methane_slip_only_high',
]

export function buildNationalTotalsByYear(fullGrid) {
  const key = (g) => [g.year, g.destructionEfficiencyId, g.methaneFractionId, g.referenceTemperatureId].join('|')
  const groups = new Map()
  for (const g of fullGrid) {
    const k = key(g)
    if (!groups.has(k)) {
      groups.set(k, {
        year: g.year,
        destructionEfficiencyId: g.destructionEfficiencyId,
        destructionEfficiency: g.destructionEfficiency,
        methaneFractionId: g.methaneFractionId,
        methaneFraction: g.methaneFraction,
        referenceTemperatureId: g.referenceTemperatureId,
        referenceConditionId: g.referenceConditionId,
        total_sites: 0,
        total_volume_bcm: 0,
        total_ch4_slip_tonnes: 0,
        total_co2_tonnes_methane_fraction_only: 0,
        total_co2e_20yr_tonnes_methane_slip_only: 0,
        total_co2e_100yr_tonnes_methane_slip_only: 0,
      })
    }
    const acc = groups.get(k)
    acc.total_sites += 1
    acc.total_volume_bcm += g.volume_bcm
    acc.total_ch4_slip_tonnes += g.ch4_slip_tonnes
    acc.total_co2_tonnes_methane_fraction_only += g.co2_tonnes_methane_fraction_only
    acc.total_co2e_20yr_tonnes_methane_slip_only += g.co2e_20yr_tonnes_methane_slip_only
    acc.total_co2e_100yr_tonnes_methane_slip_only += g.co2e_100yr_tonnes_methane_slip_only
  }
  return [...groups.values()].sort((a, b) => a.year - b.year || a.destructionEfficiencyId.localeCompare(b.destructionEfficiencyId))
}

const NATIONAL_TOTALS_COLUMNS = [
  'year', 'destructionEfficiencyId', 'destructionEfficiency', 'methaneFractionId', 'methaneFraction',
  'referenceTemperatureId', 'referenceConditionId', 'total_sites', 'total_volume_bcm',
  'total_ch4_slip_tonnes', 'total_co2_tonnes_methane_fraction_only',
  'total_co2e_20yr_tonnes_methane_slip_only', 'total_co2e_100yr_tonnes_methane_slip_only',
]

export function buildSensitivitySummary(nationalTotals, scenarios) {
  const central = centralCombination(scenarios)
  const years = [...new Set(nationalTotals.map((t) => t.year))].sort()
  const factors = [
    { name: 'destructionEfficiency', idKey: 'destructionEfficiencyId', fixedOtherIds: ['methaneFractionId', 'referenceTemperatureId'] },
    { name: 'methaneFraction', idKey: 'methaneFractionId', fixedOtherIds: ['destructionEfficiencyId', 'referenceTemperatureId'] },
    { name: 'referenceTemperature', idKey: 'referenceTemperatureId', fixedOtherIds: ['destructionEfficiencyId', 'methaneFractionId'] },
  ]
  const rows = []
  for (const year of years) {
    for (const factor of factors) {
      const matches = nationalTotals.filter((t) => {
        if (t.year !== year) return false
        return factor.fixedOtherIds.every((otherKey) => t[otherKey] === central[otherKey])
      })
      const ch4Values = matches.map((m) => m.total_ch4_slip_tonnes)
      const co2e20Values = matches.map((m) => m.total_co2e_20yr_tonnes_methane_slip_only)
      const co2e100Values = matches.map((m) => m.total_co2e_100yr_tonnes_methane_slip_only)
      rows.push({
        year,
        factor: factor.name,
        levels_compared: matches.length,
        min_total_ch4_slip_tonnes: Math.min(...ch4Values),
        max_total_ch4_slip_tonnes: Math.max(...ch4Values),
        range_total_ch4_slip_tonnes: Math.max(...ch4Values) - Math.min(...ch4Values),
        min_total_co2e_20yr_tonnes_methane_slip_only: Math.min(...co2e20Values),
        max_total_co2e_20yr_tonnes_methane_slip_only: Math.max(...co2e20Values),
        range_total_co2e_20yr_tonnes_methane_slip_only: Math.max(...co2e20Values) - Math.min(...co2e20Values),
        min_total_co2e_100yr_tonnes_methane_slip_only: Math.min(...co2e100Values),
        max_total_co2e_100yr_tonnes_methane_slip_only: Math.max(...co2e100Values),
        range_total_co2e_100yr_tonnes_methane_slip_only: Math.max(...co2e100Values) - Math.min(...co2e100Values),
      })
    }
  }
  return rows
}

const SENSITIVITY_COLUMNS = [
  'year', 'factor', 'levels_compared',
  'min_total_ch4_slip_tonnes', 'max_total_ch4_slip_tonnes', 'range_total_ch4_slip_tonnes',
  'min_total_co2e_20yr_tonnes_methane_slip_only', 'max_total_co2e_20yr_tonnes_methane_slip_only', 'range_total_co2e_20yr_tonnes_methane_slip_only',
  'min_total_co2e_100yr_tonnes_methane_slip_only', 'max_total_co2e_100yr_tonnes_methane_slip_only', 'range_total_co2e_100yr_tonnes_methane_slip_only',
]

export function buildTop20SitesByYear(rows, scenarios) {
  const central = centralCombination(scenarios)
  const years = [...new Set(rows.map((r) => r.year))].sort()
  const out = []
  for (const year of years) {
    const yearRows = rows.filter((r) => r.year === year)
    // Volume ranking and the volume-share denominator use every row,
    // including the zero-volume ones (adding zero changes nothing). The
    // methane-share denominator can only sum over rows the calculator
    // will accept (volume > 0) — see splitCalculableRows.
    const totalVolume = yearRows.reduce((sum, r) => sum + r.volume, 0)
    const { calculable } = splitCalculableRows(yearRows)
    const withMethane = calculable.map((r) => ({
      ...r,
      ch4SlipTonnesCentral: computeSiteScenario({
        volumeBcm: r.volume,
        destructionEfficiency: central.destructionEfficiency,
        methaneFraction: central.methaneFraction,
        referenceConditionId: central.referenceConditionId,
      }).ch4SlipTonnes,
    }))
    const ch4BySiteId = new Map(withMethane.map((r) => [r.site_id, r.ch4SlipTonnesCentral]))
    const totalCh4 = withMethane.reduce((sum, r) => sum + r.ch4SlipTonnesCentral, 0)
    const top20 = [...yearRows].sort((a, b) => b.volume - a.volume).slice(0, 20)
    top20.forEach((r, i) => {
      out.push({
        year,
        rank: i + 1,
        site_id: r.site_id,
        sheet: r.sheet,
        flare_type: r.flare_type,
        latitude: r.latitude,
        longitude: r.longitude,
        volume_bcm: r.volume,
        share_of_national_flared_volume: r.volume / totalVolume,
        ch4_slip_tonnes_central: ch4BySiteId.has(r.site_id) ? ch4BySiteId.get(r.site_id) : '',
        share_of_national_ch4_slip_central: ch4BySiteId.has(r.site_id) ? ch4BySiteId.get(r.site_id) / totalCh4 : '',
      })
    })
  }
  return out
}

const TOP20_COLUMNS = [
  'year', 'rank', 'site_id', 'sheet', 'flare_type', 'latitude', 'longitude',
  'volume_bcm', 'share_of_national_flared_volume',
  'ch4_slip_tonnes_central', 'share_of_national_ch4_slip_central',
]

const PERSISTENCE_COLUMNS = ['id2022', 'id2023', 'id2024', 'present2022', 'present2023', 'present2024', 'status']

function main() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
  const scenarios = loadScenarios()
  const rows = loadNigeriaRows()
  const { calculable, excludedZeroOrNegative } = splitCalculableRows(rows)
  if (excludedZeroOrNegative.length > 0) {
    console.log(
      `${excludedZeroOrNegative.length} of ${rows.length} rows have volume <= 0 and are excluded from all ` +
        `methane-calculator outputs (app's own validator rejects volumeM3 <= 0) -- see ASSESSMENT_NOTES.md`,
    )
  }

  const fullGrid = buildFullGrid(calculable, scenarios)
  writeCsv(path.join(RESULTS_DIR, 'full_grid.csv'), fullGrid, FULL_GRID_COLUMNS)
  console.log(`full_grid.csv: ${fullGrid.length} rows (${calculable.length} calculable site-years x 27 scenarios)`)

  const siteYear = buildSiteYearEstimates(calculable, scenarios)
  writeCsv(path.join(RESULTS_DIR, 'site_year_estimates.csv'), siteYear, SITE_YEAR_COLUMNS)
  console.log(`site_year_estimates.csv: ${siteYear.length} rows`)

  const nationalTotals = buildNationalTotalsByYear(fullGrid)
  writeCsv(path.join(RESULTS_DIR, 'national_totals_by_year.csv'), nationalTotals, NATIONAL_TOTALS_COLUMNS)
  console.log(`national_totals_by_year.csv: ${nationalTotals.length} rows`)

  const sensitivity = buildSensitivitySummary(nationalTotals, scenarios)
  writeCsv(path.join(RESULTS_DIR, 'sensitivity_summary.csv'), sensitivity, SENSITIVITY_COLUMNS)
  console.log(`sensitivity_summary.csv: ${sensitivity.length} rows`)

  const top20 = buildTop20SitesByYear(rows, scenarios)
  writeCsv(path.join(RESULTS_DIR, 'top20_sites_by_year.csv'), top20, TOP20_COLUMNS)
  console.log(`top20_sites_by_year.csv: ${top20.length} rows`)

  const persistence = buildSitePersistence(rows)
  writeCsv(path.join(RESULTS_DIR, 'site_persistence.csv'), persistence, PERSISTENCE_COLUMNS)
  console.log(`site_persistence.csv: ${persistence.length} rows`)

  const central = centralCombination(scenarios)
  console.log('\nCentral case national totals by year:')
  for (const t of nationalTotals.filter(
    (t) =>
      t.destructionEfficiencyId === central.destructionEfficiencyId &&
      t.methaneFractionId === central.methaneFractionId &&
      t.referenceTemperatureId === central.referenceTemperatureId,
  )) {
    console.log(
      `  ${t.year}: ${t.total_sites} sites, ${t.total_ch4_slip_tonnes.toFixed(2)} t CH4 slip, ` +
        `${t.total_co2e_20yr_tonnes_methane_slip_only.toFixed(2)} t CO2e-20yr, ${t.total_co2e_100yr_tonnes_methane_slip_only.toFixed(2)} t CO2e-100yr`,
    )
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
