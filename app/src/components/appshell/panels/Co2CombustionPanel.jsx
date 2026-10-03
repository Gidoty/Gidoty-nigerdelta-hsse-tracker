import { useMemo, useState } from 'react'
import { Wind, AlertTriangle } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import ResultCard from './shared/ResultCard.jsx'
import FormulaBlock from './shared/FormulaBlock.jsx'
import {
  REFERENCE_CONDITIONS,
  DEFAULT_REFERENCE_CONDITION_ID,
  COMBUSTION_EFFICIENCY_OPTIONS,
  PHYSICAL_CONSTANTS,
  GWP,
  ch4Density,
  calculateCO2FromMethaneCombustion,
  calculateCH4Slip,
  calculateCO2Equivalent,
} from '../../../utils/methaneCalc.js'

const CO2_CH4_MOLAR_RATIO = PHYSICAL_CONSTANTS.CO2_MOLAR_MASS_G_MOL / PHYSICAL_CONSTANTS.CH4_MOLAR_MASS_G_MOL
import { fmt } from '../../../utils/formatters.js'

export default function Co2CombustionPanel() {
  const [volumeInput, setVolumeInput] = useState('50000')
  const [ch4Fraction, setCh4Fraction] = useState(0.9)
  const [referenceConditionId, setReferenceConditionId] = useState(DEFAULT_REFERENCE_CONDITION_ID)
  const [efficiencyOptionId, setEfficiencyOptionId] = useState('design_98')
  const [customEfficiency, setCustomEfficiency] = useState('0.9')

  const selectedEfficiencyOption = COMBUSTION_EFFICIENCY_OPTIONS.find((o) => o.id === efficiencyOptionId)
  const combustionEfficiency = efficiencyOptionId === 'custom' ? Number(customEfficiency) : selectedEfficiencyOption?.value
  const volumeM3 = Number(volumeInput)

  const inputValid =
    volumeInput.trim() !== '' &&
    !Number.isNaN(volumeM3) &&
    volumeM3 > 0 &&
    !Number.isNaN(combustionEfficiency) &&
    combustionEfficiency >= 0.5 &&
    combustionEfficiency <= 1

  const results = useMemo(() => {
    if (!inputValid) return null
    const co2 = calculateCO2FromMethaneCombustion({
      volumeM3,
      ch4Fraction,
      combustionEfficiency,
      referenceConditionId,
      volumeSource: 'user_assumption',
    })
    const slip = calculateCH4Slip({
      volumeM3,
      ch4Fraction,
      combustionEfficiency,
      referenceConditionId,
      volumeSource: 'user_assumption',
    })
    const co2e = calculateCO2Equivalent(slip.ch4SlipTonnes)
    return { co2, slip, co2e }
  }, [inputValid, volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId])

  const densityKgM3 = ch4Density(referenceConditionId)
  const totalGhgCo2e100yr = results ? results.co2.co2Tonnes + results.co2e.co2e100yrTonnes : 0

  return (
    <div className="mx-auto max-w-3xl">
      <PanelHeader
        icon={Wind}
        color="#3A86FF"
        title="CO₂ from Gas Flare Combustion"
        badges={['Methane-only stoichiometry']}
      />

      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-normal text-muted">
        When flared gas combusts, the methane fraction converts to carbon dioxide (CO₂) rather than
        escaping unburned. This calculator estimates that CO₂ output from the methane fraction of a
        given gas volume only — C2+ hydrocarbons in the associated gas are excluded, since their
        composition is not modelled here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="combustion-volume">
            Gas Volume Flared (V_g, m³)
          </label>
          <input
            id="combustion-volume"
            type="number"
            min="0"
            step="100"
            value={volumeInput}
            onChange={(e) => setVolumeInput(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="combustion-reference">
            Reference Conditions
          </label>
          <select
            id="combustion-reference"
            value={referenceConditionId}
            onChange={(e) => setReferenceConditionId(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-teal focus:outline-none"
          >
            {Object.values(REFERENCE_CONDITIONS).map((ref) => (
              <option key={ref.id} value={ref.id}>
                {ref.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-text" htmlFor="combustion-ch4">
            CH₄ Fraction (x_CH4)
          </label>
          <span className="text-xs font-bold text-teal">{Math.round(ch4Fraction * 100)}%</span>
        </div>
        <input
          id="combustion-ch4"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={ch4Fraction}
          onChange={(e) => setCh4Fraction(Number(e.target.value))}
          className="mt-3 w-full accent-teal"
        />
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-medium text-text">Combustion Efficiency (η_f)</h3>
        <div className="mt-2 space-y-2">
          {COMBUSTION_EFFICIENCY_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex min-h-[40px] cursor-pointer items-start gap-2.5 rounded-lg border border-border px-3 py-2 text-xs text-text has-[:checked]:border-teal has-[:checked]:bg-teal/10"
            >
              <input
                type="radio"
                name="combustion-efficiency"
                checked={efficiencyOptionId === opt.id}
                onChange={() => setEfficiencyOptionId(opt.id)}
                className="mt-0.5 h-3.5 w-3.5 accent-teal"
              />
              <span>
                <span className="block font-bold">{opt.label}</span>
                <span className="block text-[10px] text-muted">{opt.source}</span>
              </span>
            </label>
          ))}
          {efficiencyOptionId === 'custom' && (
            <input
              type="number"
              min="0.5"
              max="1"
              step="0.001"
              value={customEfficiency}
              onChange={(e) => setCustomEfficiency(e.target.value)}
              className="min-h-[36px] w-36 rounded-lg border border-border bg-card px-3 text-xs text-text focus:border-teal focus:outline-none"
            />
          )}
        </div>
      </div>

      {!inputValid && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Enter a gas volume greater than zero and a combustion efficiency between 0.5 and 1.0.
        </div>
      )}

      {results && (
        <>
          <div className="mt-6 rounded-xl border border-teal/40 bg-teal/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-teal">Formula</p>
            <FormulaBlock
              citation="Stoichiometric (methane fraction only)"
              lines={[
                'CO2 = V_g × x_CH4 × ρ_CH4 × η_f × (44.009/16.043)',
                `CO2 = ${fmt.volume(volumeM3)} × ${ch4Fraction} × ${densityKgM3.toFixed(4)} kg/m³ × ${fmt.pct(combustionEfficiency)} × ${CO2_CH4_MOLAR_RATIO.toFixed(3)} = ${fmt.tonnes(results.co2.co2Tonnes)}`,
              ]}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ResultCard title="CO₂ Produced" subtitle="Tonnes — methane fraction only">
              <p className="text-2xl font-bold text-text">{fmt.tonnes(results.co2.co2Tonnes)}</p>
            </ResultCard>
            <ResultCard title="CO₂ Produced" subtitle="Kilograms">
              <p className="text-2xl font-bold text-text">{fmt.number(results.co2.co2Tonnes * 1000)} kg</p>
            </ResultCard>
          </div>

          <div className="mt-4 rounded-lg border border-amber/40 bg-amber/5 p-4 text-sm text-text">
            <strong className="text-amber">CO₂ is not the same as CH₄.</strong> This figure is the carbon
            dioxide released by <em>combusted</em> methane — a fast-decaying but lower-potency gas. It is
            separate from the unburned methane slip, which carries a much higher warming potential per
            tonne (see the Methane Emissions and CO₂ Equivalent calculators). C2+ hydrocarbons in the
            associated gas are excluded from this figure.
          </div>

          <ResultCard title="Combined Total GHG Impact" subtitle="CO₂ from combustion + methane's CO₂e (100-yr horizon)">
            <p className="text-2xl font-bold text-danger">{fmt.co2eHorizon(totalGhgCo2e100yr, 100)}</p>
            <FormulaBlock
              citation={GWP.source}
              lines={[
                'Total(100-yr) = CO2_combustion + (CH4_slip_tonnes × GWP100)',
                `Total(100-yr) = ${fmt.tonnes(results.co2.co2Tonnes)} + (${fmt.tonnes(results.slip.ch4SlipTonnes)} × ${GWP.GWP100}) = ${fmt.co2eHorizon(totalGhgCo2e100yr, 100)}`,
              ]}
            />
          </ResultCard>
        </>
      )}
    </div>
  )
}
