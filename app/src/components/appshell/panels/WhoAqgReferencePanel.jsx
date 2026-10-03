import { ShieldCheck, AlertTriangle } from 'lucide-react'
import PanelHeader from './shared/PanelHeader.jsx'
import { WHO_AQG_POLLUTANTS, OTHER_PETROLEUM_SUBSTANCES, WHO_EXCEEDANCE_SUMMARY } from '../../../data/whoAqgData.js'

export default function WhoAqgReferencePanel() {
  return (
    <div className="mx-auto max-w-4xl">
      <PanelHeader icon={ShieldCheck} color="#00A8CC" title="WHO Air Quality Guidelines" badges={['WHO 2021 AQG', 'Global Update']} />

      <div className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/5 p-4 text-sm leading-normal text-text">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
        <p>
          This app does not measure pollutant concentrations. Reported symptoms are not diagnoses or
          exposure measurements. The reference cards below are WHO guideline values, not readings from
          any device.
        </p>
      </div>

      <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm leading-normal text-muted">
        The World Health Organization's 2021 Global Air Quality Guidelines set science-based limits for
        the six criteria pollutants most associated with gas flaring and oil industry activity. The
        reference cards below pair each guideline with documented findings from communities in the
        Niger Delta.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {WHO_AQG_POLLUTANTS.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-bold text-teal">{p.name}</h3>
              <span className="text-xs text-muted">{p.fullName}</span>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">WHO Guideline</p>
            <p className="mt-1 text-sm text-text">{p.guideline}</p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">Niger Delta Context</p>
            <p className="mt-1 text-sm text-text">{p.nigerDeltaContext}</p>
            <p className="mt-1 text-[11px] italic text-muted">{p.source}</p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">Health Effects</p>
            <p className="mt-1 text-sm text-muted">{p.healthEffects}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-danger/40 bg-danger/5 p-4 text-sm leading-normal text-text">
        <strong className="text-danger">Exceedance summary:</strong> {WHO_EXCEEDANCE_SUMMARY.text}
        <p className="mt-2 text-[11px] italic text-muted">{WHO_EXCEEDANCE_SUMMARY.source}</p>
      </div>

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-muted">
        Other Petroleum-Related Substances
      </h2>
      <p className="mt-1 text-xs text-muted">
        Not part of the WHO 2021 Air Quality Guidelines — listed separately because the cited figure is
        a water concentration, not an air concentration.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {OTHER_PETROLEUM_SUBSTANCES.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-bold text-amber">{s.name}</h3>
              <span className="text-xs text-muted">{s.fullName}</span>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">Drinking-Water Context</p>
            <p className="mt-1 text-sm text-text">{s.context}</p>
            <p className="mt-1 text-[11px] italic text-muted">{s.source}</p>

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted">Health Effects</p>
            <p className="mt-1 text-sm text-muted">{s.healthEffects}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
