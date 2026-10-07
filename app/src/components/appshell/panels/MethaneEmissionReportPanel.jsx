import { useMemo, useState } from 'react'
import { FileBarChart, Download } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'
import ResultCard from './shared/ResultCard.jsx'
import FormulaBlock from './shared/FormulaBlock.jsx'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { REFERENCE_CONDITIONS, GWP, RESULT_LABELS, CH4_FRACTION_SOURCE_OPTIONS } from '../../../utils/methaneCalc.js'
import { t } from '../../../data/translations.js'
import { fmt } from '../../../utils/formatters.js'

const VOLUME_SOURCE_LABELS = {
  operator_data: 'Operator-reported data',
  satellite_estimate: 'NOSDRA/SDN Gas Flare Tracker satellite estimate',
  user_assumption: 'User assumption',
}

export default function MethaneEmissionReportPanel() {
  const [allReports] = useLiveReports()
  const reports = useMemo(() => allReports.filter((r) => r.methane?.calculated), [allReports])
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? '')
  const report = reports.find((r) => r.id === selectedId)

  if (reports.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PanelHeader icon={FileBarChart} color="#06B6D4" title="Methane Emission Report" badges={['Mass balance']} />
        <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-border bg-card px-4 text-center text-sm text-muted">
          No saved methane calculations yet. Run the Methane Emissions calculator under Calculate and save
          a result to a report to generate a printable summary here.
        </div>
      </div>
    )
  }

  const { inputs, results } = report.methane
  const referenceCondition = REFERENCE_CONDITIONS[inputs.referenceConditionId] ?? REFERENCE_CONDITIONS['15C']
  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type

  return (
    <div className="mx-auto max-w-3xl">
      <PanelHeader icon={FileBarChart} color="#06B6D4" title="Methane Emission Report" badges={['Mass balance', 'Full Record Summary']} />

      <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="mer-select">Select Report</label>
      <select
        id="mer-select"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-generate focus:outline-none print:hidden"
      >
        {reports.map((r) => (
          <option key={r.id} value={r.id}>
            {r.referenceNumber} · {fmt.datetime(r.methane.calculatedAt)}
          </option>
        ))}
      </select>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 print:border-0">
        <h2 className="text-lg font-bold text-text">Report {report.referenceNumber}</h2>
        <p className="mt-1 text-sm text-muted">
          {typeLabel} · {report.location.state ?? 'Unknown state'}
          {report.location.lga ? `, ${report.location.lga}` : ''} · Calculated{' '}
          {fmt.datetime(report.methane.calculatedAt)}
        </p>

        <h3 className="mt-5 text-sm font-bold text-text">Inputs</h3>
        <table className="mt-2 w-full text-left text-xs">
          <tbody>
            <tr className="border-t border-border">
              <td className="py-2 text-muted">Flared Volume (V_g)</td>
              <td className="py-2 text-text">{fmt.volume(inputs.volumeM3)} at {referenceCondition.label}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-2 text-muted">Volume Source</td>
              <td className="py-2 text-text">{VOLUME_SOURCE_LABELS[inputs.volumeSource] ?? inputs.volumeSource}</td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-2 text-muted">CH₄ Fraction (x_CH4)</td>
              <td className="py-2 text-text">
                {Math.round(inputs.ch4Fraction * 100)}%
                {inputs.ch4FractionSource
                  ? ` (${CH4_FRACTION_SOURCE_OPTIONS.find((o) => o.id === inputs.ch4FractionSource)?.label ?? inputs.ch4FractionSource})`
                  : ' (source not recorded — predates the required source field)'}
              </td>
            </tr>
            <tr className="border-t border-border">
              <td className="py-2 text-muted">Combustion Efficiency (η_f)</td>
              <td className="py-2 text-text">{fmt.pct(inputs.combustionEfficiency)}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-5 text-sm font-bold text-text">Results</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <ResultCard title="CH₄ Slip">
            <p className="text-lg font-bold text-text">{fmt.tonnes(results.ch4SlipTonnes)}</p>
          </ResultCard>
          <ResultCard title={RESULT_LABELS.co2}>
            <p className="text-lg font-bold text-text">{fmt.tonnes(results.co2FromCombustionTonnes)}</p>
          </ResultCard>
          <ResultCard title={`${RESULT_LABELS.co2e} (20-yr horizon)`}>
            <p className="text-lg font-bold text-amber">{fmt.co2eHorizon(results.co2e20yrTonnes, 20)}</p>
          </ResultCard>
          <ResultCard title={`${RESULT_LABELS.co2e} (100-yr horizon)`}>
            <p className="text-lg font-bold text-safe">{fmt.co2eHorizon(results.co2e100yrTonnes, 100)}</p>
          </ResultCard>
        </div>

        <h3 className="mt-5 text-sm font-bold text-text">Formulas Applied</h3>
        <FormulaBlock
          citation="Mass balance + IPCC AR6 WGI"
          lines={[
            'm_CH4_slip = V_g × x_CH4 × ρ_CH4(T_ref,P_ref) × (1 − η_f)',
            'CO2_combustion = V_g × x_CH4 × ρ_CH4 × η_f × (44.009/16.043)',
            `CO2e(20-yr) = m_CH4_slip × ${GWP.GWP20}`,
            `CO2e(100-yr) = m_CH4_slip × ${GWP.GWP100}`,
          ]}
        />

        <p className="mt-5 text-[11px] text-muted">
          Methodology: mass-balance methane slip using CH₄ density from the ideal gas law (gas treated as
          ideal); the CO₂ figure is {RESULT_LABELS.co2} and the CO₂e figures are {RESULT_LABELS.co2e} — C2+
          hydrocarbons and any CO₂ already present in the gas are excluded throughout; {GWP.source}.
          Generated by the NigerDelta HSSE Tracker on {fmt.datetime(new Date().toISOString())}. Indicative
          estimate for community documentation, not a substitute for operator-measured emissions data.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-generate text-sm font-bold text-generate hover:bg-generate/10 print:hidden"
      >
        <Download className="h-4 w-4" />
        Download Full Report (PDF)
      </button>

      <LegalBasisBadge text="Tamper-evident fingerprint. Detects later changes to the saved record. Does not establish that the report is true, who made it, or legal admissibility." />
    </div>
  )
}
