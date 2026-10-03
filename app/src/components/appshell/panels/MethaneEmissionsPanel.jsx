import { useMemo, useState } from 'react'
import { Flame, BookOpen, CheckCircle2, Download, AlertTriangle } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import CollapsibleSection from './shared/CollapsibleSection.jsx'
import ResultCard from './shared/ResultCard.jsx'
import FormulaBlock from './shared/FormulaBlock.jsx'
import { updateReportInStorage } from '../../../utils/dashboardUtils.js'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import {
  REFERENCE_CONDITIONS,
  DEFAULT_REFERENCE_CONDITION_ID,
  VOLUME_SOURCE_OPTIONS,
  COMBUSTION_EFFICIENCY_OPTIONS,
  GWP,
  ch4Density,
  calculateCH4Slip,
  calculateCH4Sensitivity,
  calculateCO2FromMethaneCombustion,
  calculateCO2Equivalent,
} from '../../../utils/methaneCalc.js'
import { fmt } from '../../../utils/formatters.js'

export default function MethaneEmissionsPanel() {
  const [tab, setTab] = useState('report')
  const [allReports] = useLiveReports()
  const reports = useMemo(() => allReports.filter((r) => r.incident.type === 'gas_flare'), [allReports])
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? '')

  const [volumeInput, setVolumeInput] = useState('50000')
  const [volumeSource, setVolumeSource] = useState('')
  const [referenceConditionId, setReferenceConditionId] = useState(DEFAULT_REFERENCE_CONDITION_ID)
  const [ch4Fraction, setCh4Fraction] = useState(0.9)
  const [efficiencyOptionId, setEfficiencyOptionId] = useState('design_98')
  const [customEfficiency, setCustomEfficiency] = useState('0.9')
  const [saved, setSaved] = useState(false)

  const selectedEfficiencyOption = COMBUSTION_EFFICIENCY_OPTIONS.find((o) => o.id === efficiencyOptionId)
  const combustionEfficiency =
    efficiencyOptionId === 'custom' ? Number(customEfficiency) : selectedEfficiencyOption?.value

  const volumeM3 = Number(volumeInput)
  const inputErrors = useMemo(() => {
    const errs = []
    if (volumeInput.trim() === '' || Number.isNaN(volumeM3)) errs.push('Enter a numeric gas volume.')
    else if (volumeM3 <= 0) errs.push('Gas volume must be greater than zero.')
    if (!volumeSource) errs.push('Select a volume source.')
    if (ch4Fraction < 0 || ch4Fraction > 1) errs.push('CH₄ fraction must be between 0 and 1.')
    if (Number.isNaN(combustionEfficiency)) errs.push('Enter a numeric combustion efficiency.')
    else if (combustionEfficiency < 0.5 || combustionEfficiency > 1) errs.push('Combustion efficiency must be between 0.5 and 1.0.')
    return errs
  }, [volumeInput, volumeM3, volumeSource, ch4Fraction, combustionEfficiency])

  const results = useMemo(() => {
    if (inputErrors.length > 0) return null
    try {
      const slip = calculateCH4Slip({ volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId, volumeSource })
      const sensitivity = calculateCH4Sensitivity({ volumeM3, ch4Fraction, referenceConditionId, volumeSource })
      const co2Combustion = calculateCO2FromMethaneCombustion({ volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId, volumeSource })
      const co2e = calculateCO2Equivalent(slip.ch4SlipTonnes)
      return { slip, sensitivity, co2Combustion, co2e }
    } catch {
      return null
    }
  }, [volumeM3, ch4Fraction, combustionEfficiency, referenceConditionId, volumeSource, inputErrors.length])

  const handleSaveToReport = () => {
    if (!selectedReportId || !results) return
    updateReportInStorage(selectedReportId, (report) => ({
      ...report,
      methane: {
        calculated: true,
        calculatedAt: new Date().toISOString(),
        method: 'Mass balance',
        methodVersion: results.slip.methodVersion,
        inputs: {
          volumeM3,
          volumeSource,
          referenceConditionId,
          ch4Fraction,
          combustionEfficiency,
          combustionEfficiencySourceId: efficiencyOptionId,
        },
        results: {
          ch4SlipTonnes: results.slip.ch4SlipTonnes,
          co2FromCombustionTonnes: results.co2Combustion.co2Tonnes,
          co2e20yrTonnes: results.co2e.co2e20yrTonnes,
          co2e100yrTonnes: results.co2e.co2e100yrTonnes,
        },
      },
    }))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3000)
  }

  const selectedReport = reports.find((r) => r.id === selectedReportId)
  const densityKgM3 = ch4Density(referenceConditionId)

  return (
    <div className="mx-auto max-w-4xl">
      <PanelHeader
        icon={Flame}
        color="#F4A261"
        title="Methane Emission Estimator"
        badges={['Mass balance', 'IPCC AR6 GWP']}
      />

      <CollapsibleSection title="Scientific Methodology" icon={BookOpen} defaultOpen>
        <p>
          This calculator estimates the mass of methane (CH₄) that escapes combustion from a gas flare,
          using a direct mass balance rather than a fixed volumetric emission factor:
        </p>
        <FormulaBlock lines={['m_CH4_slip = V_g × x_CH4 × ρ_CH4(T_ref, P_ref) × (1 − η_f)']} />
        <p>
          <strong className="text-text">You must supply the flared gas volume (V_g)</strong>, expressed at
          the reference temperature and pressure you select below — this app does not estimate volume from
          flame appearance or stack height. <strong className="text-text">CH₄ density (ρ_CH4)</strong> is
          computed from the ideal gas law (ρ = P·M/(R·T), M = 16.043 g/mol, R = 8.314462 J/(mol·K)), not a
          fixed constant. <strong className="text-text">Combustion efficiency (η_f)</strong> is selectable
          between a conventional design assumption and a field-measured value — each cited separately below
          — or a custom value you supply.
        </p>
        <p className="text-xs text-muted">
          GWP conversion: {GWP.source}. All estimates are indicative and intended to support community
          documentation, not to substitute for operator-measured emissions data.
        </p>
      </CollapsibleSection>

      <div className="mt-6 flex gap-2 rounded-lg border border-border bg-panel p-1">
        <button
          type="button"
          onClick={() => setTab('report')}
          className={`min-h-[40px] flex-1 rounded-md text-sm font-bold transition-colors ${
            tab === 'report' ? 'bg-amber text-bg' : 'text-muted hover:text-text'
          }`}
        >
          Attach to a Gas Flare Report
        </button>
        <button
          type="button"
          onClick={() => setTab('manual')}
          className={`min-h-[40px] flex-1 rounded-md text-sm font-bold transition-colors ${
            tab === 'manual' ? 'bg-amber text-bg' : 'text-muted hover:text-text'
          }`}
        >
          Standalone Calculation
        </button>
      </div>

      {tab === 'report' && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="methane-report-select">
            Select Gas Flare Report
          </label>
          {reports.length === 0 ? (
            <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted">
              No gas flare reports found yet. Submit one from the Report tab, or use the standalone
              calculation.
            </p>
          ) : (
            <select
              id="methane-report-select"
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-amber focus:outline-none"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.referenceNumber} · {r.location.state ?? 'Unknown state'} · {fmt.datetime(r.submittedAt)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-text">Flared Gas Volume (V_g)</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="0"
              step="1"
              value={volumeInput}
              onChange={(e) => setVolumeInput(e.target.value)}
              className="min-h-[44px] w-48 rounded-lg border border-border bg-card px-3 text-sm text-text focus:border-amber focus:outline-none"
              aria-label="Flared gas volume in cubic metres"
            />
            <span className="text-sm text-muted">m³, at the reference conditions selected below</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-text">Volume Source</h3>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {VOLUME_SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setVolumeSource(opt.id)}
                className={`min-h-[44px] rounded-lg border px-3 text-left text-xs font-bold transition-colors ${
                  volumeSource === opt.id ? 'border-amber bg-amber/10 text-amber' : 'border-border bg-card text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-text">Reference Conditions for V_g</h3>
          <select
            value={referenceConditionId}
            onChange={(e) => setReferenceConditionId(e.target.value)}
            className="mt-2 min-h-[44px] w-full rounded-lg border border-border bg-card px-3 text-sm text-text focus:border-amber focus:outline-none sm:w-auto"
          >
            {Object.values(REFERENCE_CONDITIONS).map((ref) => (
              <option key={ref.id} value={ref.id}>
                {ref.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted">CH₄ density at these conditions: {densityKgM3.toFixed(4)} kg/m³</p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text">CH₄ Fraction of Associated Gas (x_CH4)</h3>
            <span className="text-sm font-bold text-amber">{Math.round(ch4Fraction * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={ch4Fraction}
            onChange={(e) => setCh4Fraction(Number(e.target.value))}
            className="mt-2 w-full accent-amber"
          />
          <p className="mt-1 text-[11px] text-muted">
            Default 90% is <strong>assumed, not measured</strong> — adjust if a Niger Delta associated-gas
            composition figure is available.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-text">Combustion Efficiency (η_f)</h3>
          <div className="mt-2 space-y-2">
            {COMBUSTION_EFFICIENCY_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className="flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-lg border border-border px-3 py-2 text-sm text-text has-[:checked]:border-amber has-[:checked]:bg-amber/10"
              >
                <input
                  type="radio"
                  name="efficiency"
                  checked={efficiencyOptionId === opt.id}
                  onChange={() => setEfficiencyOptionId(opt.id)}
                  className="mt-0.5 h-3.5 w-3.5 accent-amber"
                />
                <span>
                  <span className="block font-bold">{opt.label}</span>
                  <span className="block text-[11px] text-muted">{opt.source}</span>
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
                className="min-h-[40px] w-40 rounded-lg border border-border bg-card px-3 text-xs text-text focus:border-amber focus:outline-none"
                aria-label="Custom combustion efficiency"
              />
            )}
          </div>
        </div>
      </div>

      {inputErrors.length > 0 && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="list-disc space-y-1 pl-4">
            {inputErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {results && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-text">Results</h2>

          <ResultCard title="CH₄ Slip" subtitle={`At η_f = ${fmt.pct(combustionEfficiency)} · ${REFERENCE_CONDITIONS[referenceConditionId].label}`}>
            <p className="text-2xl font-bold text-text">{fmt.tonnes(results.slip.ch4SlipTonnes)} CH₄</p>
            <FormulaBlock
              citation="Mass balance"
              lines={[
                'm_CH4_slip = V_g × x_CH4 × ρ_CH4 × (1 − η_f)',
                `m_CH4_slip = ${fmt.volume(volumeM3)} × ${ch4Fraction} × ${densityKgM3.toFixed(4)} kg/m³ × ${(1 - combustionEfficiency).toFixed(3)} = ${fmt.tonnes(results.slip.ch4SlipTonnes)}`,
              ]}
            />
          </ResultCard>

          <ResultCard title="Sensitivity to Combustion Efficiency" subtitle="Same inputs, three η_f values">
            <div className="grid gap-2 sm:grid-cols-3">
              {results.sensitivity.map((row) => (
                <div key={row.combustionEfficiency} className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs font-bold text-muted">η_f = {fmt.pct(row.combustionEfficiency)}</p>
                  <p className="mt-1 text-sm font-bold text-text">{fmt.tonnes(row.ch4SlipTonnes)} CH₄</p>
                </div>
              ))}
            </div>
          </ResultCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="CO₂ Equivalent (20-yr horizon)" subtitle={`GWP₂₀ = ${GWP.GWP20}`}>
              <p className="text-2xl font-bold text-teal">{fmt.co2eHorizon(results.co2e.co2e20yrTonnes, 20)}</p>
              <FormulaBlock citation={GWP.source} lines={[`CO2e(20-yr) = ${fmt.tonnes(results.slip.ch4SlipTonnes)} × ${GWP.GWP20} = ${fmt.co2eHorizon(results.co2e.co2e20yrTonnes, 20)}`]} />
            </ResultCard>
            <ResultCard title="CO₂ Equivalent (100-yr horizon)" subtitle={`GWP₁₀₀ = ${GWP.GWP100}`}>
              <p className="text-2xl font-bold text-teal">{fmt.co2eHorizon(results.co2e.co2e100yrTonnes, 100)}</p>
              <FormulaBlock citation={GWP.source} lines={[`CO2e(100-yr) = ${fmt.tonnes(results.slip.ch4SlipTonnes)} × ${GWP.GWP100} = ${fmt.co2eHorizon(results.co2e.co2e100yrTonnes, 100)}`]} />
            </ResultCard>
          </div>

          <ResultCard title="CO₂ from Combustion" subtitle={results.co2Combustion.label}>
            <p className="text-2xl font-bold text-text">{fmt.tonnes(results.co2Combustion.co2Tonnes)} CO₂</p>
            <FormulaBlock
              citation="Stoichiometric"
              lines={results.co2Combustion.sources}
            />
          </ResultCard>
        </div>
      )}

      <div className="mt-6 print:hidden">
        {tab === 'report' ? (
          <button
            type="button"
            onClick={handleSaveToReport}
            disabled={!selectedReportId || !results}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-amber text-sm font-bold text-bg hover:bg-amber/90 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save to Report
          </button>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!results}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-amber text-sm font-bold text-amber hover:bg-amber/10 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download Calculation (PDF)
          </button>
        )}
        {saved && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-safe">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved to report {selectedReport?.referenceNumber}
          </p>
        )}
      </div>
    </div>
  )
}
