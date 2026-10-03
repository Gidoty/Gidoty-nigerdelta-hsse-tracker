import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { formatElapsed, hoursSince } from '../../utils/trackerUtils.js'
import { t } from '../../data/translations.js'

export default function NotificationBell({ overdueReports }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications: ${overdueReports.length} overdue`}
        className="relative flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-card hover:text-text"
      >
        <Bell className="h-5 w-5" />
        {overdueReports.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {overdueReports.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[110] mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            Overdue Operator Response
          </p>
          {overdueReports.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted">No overdue incidents.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {overdueReports.map((report) => (
                <li key={report.id} className="rounded-lg border border-danger/30 bg-danger/10 p-2.5 text-xs">
                  <p className="font-bold text-text">{report.referenceNumber}</p>
                  <p className="mt-0.5 text-muted">
                    {t('en', 'incidentTypes')[report.incident.type] ?? report.incident.type}
                  </p>
                  <p className="mt-0.5 text-danger">
                    {formatElapsed(hoursSince(report.regulatory.nosdraNotifiedAt))} since notification
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
