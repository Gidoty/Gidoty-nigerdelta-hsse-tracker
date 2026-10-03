import { useState } from 'react'
import {
  FilePlus,
  Bell,
  Calendar,
  CheckSquare,
  Recycle,
  AlertTriangle,
} from 'lucide-react'
import { t } from '../../data/translations.js'
import { formatTimeAgo } from '../../utils/dashboardUtils.js'
import { SEVERITY_BADGE_CLASSES } from '../../data/markerColors.js'
import { hoursSince, formatElapsed, notificationTimerLevel } from '../../utils/trackerUtils.js'
import { fmt } from '../../utils/formatters.js'

const CLEANUP_OPTIONS = [
  { id: 'pending', label: 'Pending', color: 'text-muted' },
  { id: 'in_progress', label: 'In Progress', color: 'text-amber' },
  { id: 'completed', label: 'Completed', color: 'text-safe' },
  { id: 'disputed', label: 'Disputed', color: 'text-danger' },
]

const CLEANUP_TEXT = {
  pending: 'Cleanup not yet begun',
  in_progress: 'Cleanup underway',
  completed: 'Site remediated',
  disputed: 'Operator disputes responsibility',
}

function StageCircle({ complete, colorClass, icon: Icon }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
        complete ? `${colorClass} bg-current/15` : 'border-border text-muted'
      }`}
      style={complete ? { borderColor: 'currentColor' } : undefined}
    >
      <Icon className={`h-4.5 w-4.5 ${complete ? colorClass : 'text-muted'}`} />
    </span>
  )
}

export default function TimelineCard({ report, onNotifyClick, onMarkJivCompleted, onCleanupStatusChange }) {
  const [jivDateInput, setJivDateInput] = useState(new Date().toISOString().slice(0, 10))

  const typeLabel = t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type
  const severityInfo = t('en', 'severityLevels')[report.incident.severity]
  const location = [report.location.state, report.location.lga].filter(Boolean).join(' · ')

  const notified = Boolean(report.regulatory?.nosdraNotified)
  const jivScheduled = Boolean(report.regulatory?.jivScheduled)
  const jivCompleted = Boolean(report.regulatory?.jivCompleted)
  const cleanupStatus = report.regulatory?.cleanupStatus ?? 'pending'

  const notifiedHours = hoursSince(report.regulatory?.nosdraNotifiedAt)
  const timerLevel = notifiedHours === null ? null : notificationTimerLevel(notifiedHours)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            SEVERITY_BADGE_CLASSES[report.incident.severity]
          }`}
        >
          {severityInfo?.label ?? report.incident.severity}
        </span>
        <span className="text-sm font-bold text-text">{typeLabel}</span>
        <span className="text-xs text-muted">{report.referenceNumber}</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {location && <span>{location} · </span>}
        Reported: {formatTimeAgo(report.submittedAt)}
      </p>

      <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start">
        {/* Stage 1: Submitted */}
        <div className="flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
          <StageCircle complete colorClass="text-teal" icon={FilePlus} />
          <div className="md:mt-1">
            <p className="text-xs font-bold text-text">Submitted</p>
            <p className="text-[11px] text-muted">{fmt.datetime(report.submittedAt)}</p>
          </div>
        </div>

        <div className="hidden h-0.5 flex-1 self-center bg-border md:block" />

        {/* Stage 2: NOSDRA Notified */}
        <div className="flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
          <StageCircle complete={notified} colorClass="text-amber" icon={Bell} />
          <div className="md:mt-1">
            <p className="text-xs font-bold text-text">NOSDRA Notified</p>
            {notified ? (
              <p className="text-[11px] text-muted">{fmt.datetime(report.regulatory.nosdraNotifiedAt)}</p>
            ) : (
              <button
                type="button"
                onClick={() => onNotifyClick(report)}
                className="mt-1 rounded-full bg-teal px-3 py-1 text-[11px] font-bold text-white hover:bg-teal/90"
              >
                Notify NOSDRA Now
              </button>
            )}
          </div>
        </div>

        <div className="hidden h-0.5 flex-1 self-center bg-border md:block" />

        {/* Stage 3: JIV Scheduled */}
        <div className="flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
          <StageCircle complete={jivScheduled} colorClass="text-[#3A86FF]" icon={Calendar} />
          <div className="md:mt-1">
            <p className="text-xs font-bold text-text">JIV Scheduled</p>
            {jivScheduled ? (
              <p className="text-[11px] text-muted">{report.regulatory.jivDate ?? '—'}</p>
            ) : (
              <p className="text-[11px] text-muted">
                {notified ? 'Awaiting JIV scheduling' : 'Pending NOSDRA notification'}
              </p>
            )}
          </div>
        </div>

        <div className="hidden h-0.5 flex-1 self-center bg-border md:block" />

        {/* Stage 4: JIV Completed */}
        <div className="flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
          <StageCircle complete={jivCompleted} colorClass="text-safe" icon={CheckSquare} />
          <div className="md:mt-1">
            <p className="text-xs font-bold text-text">JIV Completed</p>
            {jivCompleted ? (
              <p className="text-[11px] text-muted">
                {report.regulatory.jivCompletedAt
                  ? fmt.datetime(report.regulatory.jivCompletedAt)
                  : report.regulatory.jivDate}
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-1">
                <input
                  type="date"
                  value={jivDateInput}
                  onChange={(e) => setJivDateInput(e.target.value)}
                  className="min-h-[32px] w-28 rounded-md border border-border bg-panel px-1.5 text-[11px] text-text focus:border-teal focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onMarkJivCompleted(report.id, jivDateInput)}
                  className="rounded-full bg-safe px-2.5 py-1 text-[11px] font-bold text-white hover:bg-safe/90"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden h-0.5 flex-1 self-center bg-border md:block" />

        {/* Stage 5: Cleanup */}
        <div className="flex flex-1 gap-3 md:flex-col md:items-center md:text-center">
          <StageCircle
            complete
            colorClass={CLEANUP_OPTIONS.find((o) => o.id === cleanupStatus)?.color ?? 'text-muted'}
            icon={Recycle}
          />
          <div className="md:mt-1">
            <p className="text-xs font-bold text-text">Cleanup Status</p>
            <p className={`text-[11px] ${CLEANUP_OPTIONS.find((o) => o.id === cleanupStatus)?.color ?? 'text-muted'}`}>
              {CLEANUP_TEXT[cleanupStatus]}
            </p>
            <select
              value={cleanupStatus}
              onChange={(e) => onCleanupStatusChange(report.id, e.target.value)}
              className="mt-1 min-h-[32px] rounded-md border border-border bg-panel px-1.5 text-[11px] text-text focus:border-teal focus:outline-none"
            >
              {CLEANUP_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {notified && (
        <div
          className={`mt-5 rounded-lg border px-4 py-3 text-xs ${
            timerLevel === 'ok'
              ? 'border-safe/40 bg-safe/10 text-safe'
              : timerLevel === 'warning'
                ? 'border-amber/40 bg-amber/10 text-amber'
                : 'animate-pulse border-danger bg-danger/10 text-danger'
          }`}
        >
          <p className="font-bold">
            Time since you recorded notifying NOSDRA: {formatElapsed(notifiedHours)}
            {' — '}
            {timerLevel === 'ok' && 'Within 24-hour legal window'}
            {timerLevel === 'warning' && '⚠ 24-hour window elapsed — operator response overdue'}
            {timerLevel === 'critical' && '🚨 3 days elapsed — operator in potential violation of NOSDRA Act 2006'}
          </p>
          <p className="mt-1 flex items-start gap-1.5 text-[11px] opacity-90">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            This measures time since you clicked "notify," not since the spill occurred. Under
            NOSDRA Act 2006, s.6(2), operators face ₦500,000 for each day of failure to report a
            spill.
          </p>
        </div>
      )}
    </div>
  )
}
