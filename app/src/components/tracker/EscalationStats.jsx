import { ClipboardList, Bell, AlarmClockOff, CheckCircle2 } from 'lucide-react'
import { computeEscalationStats } from '../../utils/trackerUtils.js'

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

export default function EscalationStats({ reports }) {
  const stats = computeEscalationStats(reports)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={ClipboardList} label="Total Reports Tracked" value={stats.total} accent="text-teal" />
      <StatCard icon={Bell} label="NOSDRA Notified" value={stats.nosdraNotified} accent="text-amber" />
      <StatCard
        icon={AlarmClockOff}
        label="Awaiting Operator Response"
        value={stats.awaitingResponse}
        accent="text-danger"
      />
      <StatCard icon={CheckCircle2} label="Resolved / Cleaned Up" value={stats.resolved} accent="text-safe" />
    </div>
  )
}
