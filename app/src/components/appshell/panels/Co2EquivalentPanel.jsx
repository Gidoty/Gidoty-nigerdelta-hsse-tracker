import { useMemo, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import PanelHeader from './shared/PanelHeader.jsx'
import ResultCard from './shared/ResultCard.jsx'
import FormulaBlock from './shared/FormulaBlock.jsx'
import { useLiveReports } from '../../../hooks/useLiveReports.js'
import { GWP, RESULT_LABELS, calculateCO2Equivalent } from '../../../utils/methaneCalc.js'
import { fmt } from '../../../utils/formatters.js'

export default function Co2EquivalentPanel() {
  const [allReports] = useLiveReports()
  const reports = useMemo(() => allReports.filter((r) => r.methane?.calculated), [allReports])
  const [source, setSource] = useState('manual')
  const [ch4Mass, setCh4Mass] = useState('1')

  const effectiveMass = useMemo(() => {
    if (source === 'manual') return Number(ch4Mass) || 0
    const report = reports.find((r) => r.id === source)
    return report?.methane?.results?.ch4SlipTonnes ?? 0
  }, [source, ch4Mass, reports])

  const massInvalid = source === 'manual' && (ch4Mass.trim() === '' || Number.isNaN(Number(ch4Mass)) || Number(ch4Mass) < 0)

  const result = useMemo(() => {
    if (massInvalid) return null
    return calculateCO2Equivalent(effectiveMass)
  }, [effectiveMass, massInvalid])

  const difference = result ? result.co2e20yrTonnes - result.co2e100yrTonnes : 0
  const ratio = result && result.co2e100yrTonnes > 0 ? result.co2e20yrTonnes / result.co2e100yrTonnes : 0

  const chartData = result
    ? [
        { name: `20-year (GWP₂₀ = ${GWP.GWP20})`, value: Number(result.co2e20yrTonnes.toFixed(1)), fill: '#F4A261' },
        { name: `100-year (GWP₁₀₀ = ${GWP.GWP100})`, value: Number(result.co2e100yrTonnes.toFixed(1)), fill: '#2DC653' },
      ]
    : []

  return (
    <div className="mx-auto max-w-3xl">
      <PanelHeader
        icon={Globe2}
        color="#2DC653"
        title="CO₂ Equivalent Calculator"
        badges={[`GWP₂₀ = ${GWP.GWP20}`, `GWP₁₀₀ = ${GWP.GWP100}`, 'IPCC AR6 WGI, fossil CH₄']}
      />

      <p className="rounded-lg border border-border bg-card p-4 text-sm leading-normal text-muted">
        Global Warming Potential (GWP) expresses the warming impact of a mass of methane relative to the
        same mass of CO₂ over a given time horizon. Methane traps far more heat than CO₂ in the short
        term but breaks down in the atmosphere within roughly a decade, so the 20-year horizon captures
        its outsized near-term climate impact, while the 100-year horizon is the conventional basis for
        long-term national inventories. Always read a CO₂e figure together with its horizon — a bare
        "CO₂e" number is not meaningful on its own. Every figure below is{' '}
        <strong className="text-text">{RESULT_LABELS.co2e}</strong>: it converts the unburned-methane
        mass to CO₂-equivalent and does not include CO₂ from the combusted fraction of the gas.
      </p>

      <div className="mt-6">
        <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="co2e-source">
          CH₄ Mass Source
        </label>
        <select
          id="co2e-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-safe focus:outline-none"
        >
          <option value="manual">Manual entry</option>
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              Load from {r.referenceNumber} ({fmt.tonnes(r.methane.results.ch4SlipTonnes)} CH₄)
            </option>
          ))}
        </select>

        {source === 'manual' && (
          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-text" htmlFor="co2e-mass">
              CH₄ Mass (tonnes)
            </label>
            <input
              id="co2e-mass"
              type="number"
              min="0"
              step="0.001"
              value={ch4Mass}
              onChange={(e) => setCh4Mass(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-border bg-panel px-3 text-sm text-text focus:border-safe focus:outline-none"
            />
            {massInvalid && <p className="mt-1 text-xs font-medium text-danger">Enter a non-negative number.</p>}
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ResultCard title={`${RESULT_LABELS.co2e} (20-yr)`} subtitle={`GWP₂₀ = ${GWP.GWP20}`}>
              <p className="text-2xl font-bold text-amber">{fmt.co2eHorizon(result.co2e20yrTonnes, 20)}</p>
              <FormulaBlock citation={GWP.source} lines={[`CO2e(20-yr) = ${fmt.tonnes(effectiveMass)} × ${GWP.GWP20} = ${fmt.co2eHorizon(result.co2e20yrTonnes, 20)}`]} />
            </ResultCard>
            <ResultCard title={`${RESULT_LABELS.co2e} (100-yr)`} subtitle={`GWP₁₀₀ = ${GWP.GWP100}`}>
              <p className="text-2xl font-bold text-safe">{fmt.co2eHorizon(result.co2e100yrTonnes, 100)}</p>
              <FormulaBlock citation={GWP.source} lines={[`CO2e(100-yr) = ${fmt.tonnes(effectiveMass)} × ${GWP.GWP100} = ${fmt.co2eHorizon(result.co2e100yrTonnes, 100)}`]} />
            </ResultCard>
          </div>

          <ResultCard title="Difference Between Horizons" subtitle="Why the time frame you choose matters">
            <p className="text-lg font-bold text-text">
              {fmt.tonnes(difference)} CO₂e more counted at the 20-year horizon than the 100-year horizon
              ({ratio.toFixed(2)}× the 100-year figure)
            </p>
          </ResultCard>

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold text-text">20-Year vs 100-Year Comparison</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 20, right: 12, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="name" tick={{ fill: '#8B9EB7', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8B9EB7', fontSize: 11 }} label={{ value: 't CO₂e', fill: '#8B9EB7', fontSize: 11, angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ backgroundColor: '#162840', border: '1px solid #1E3A5F', borderRadius: 8, color: '#F0F4F8', fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" fill="#F0F4F8" fontSize={12} />
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
