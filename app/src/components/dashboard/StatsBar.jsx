import { Database, Droplet, Flame, Clock, ShieldCheck } from 'lucide-react'
import { fmt } from '../../utils/formatters.js'
import { evidenceStatusLevel, EVIDENCE_STATUS } from '../../utils/evidenceStatus.js'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className={`text-xl font-bold leading-tight ${accent}`}>{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

export default function StatsBar({ reports, lastUpdated }) {
  const total = reports.length
  const oilSpills = reports.filter((r) => r.incident.type === 'oil_spill').length
  const gasFlares = reports.filter((r) => r.incident.type === 'gas_flare').length
  const awaitingResponse = reports.filter((r) => r.regulatory?.operatorResponse === null).length
  const evidenceUpgraded = reports.filter((r) => evidenceStatusLevel(r) !== EVIDENCE_STATUS.COMMUNITY_OBSERVED).length

  return (
    <div className="border-b border-border bg-panel px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Database} label="Total Reports" value={total} accent="text-teal" />
        <StatCard icon={Droplet} label="Oil Spills" value={oilSpills} accent="text-danger" />
        <StatCard icon={Flame} label="Gas Flares" value={gasFlares} accent="text-amber" />
        <StatCard icon={Clock} label="Awaiting Response" value={awaitingResponse} accent="text-warning" />
        <StatCard icon={ShieldCheck} label="Evidence Status Upgraded" value={evidenceUpgraded} accent="text-safe" />
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
        </span>
        <span>Last updated: {fmt.datetime(lastUpdated)}</span>
        <span>·</span>
        <span>Data source: Community submissions via NigerDelta HSSE Tracker</span>
        <span>·</span>
        <span>All reports labelled by evidence status — community observed by default</span>
      </p>
    </div>
  )
}
