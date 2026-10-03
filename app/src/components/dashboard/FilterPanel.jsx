import { Search, RotateCcw } from 'lucide-react'
import { t } from '../../data/translations.js'
import { INCIDENT_TYPE_LIST, SEVERITY_LIST, STATUS_OPTIONS } from '../../utils/dashboardUtils.js'

function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

const QUICK_RANGES = [
  {
    label: 'Today',
    apply: () => {
      const today = toISODate(new Date())
      return { dateFrom: today, dateTo: today }
    },
  },
  {
    label: 'This Week',
    apply: () => {
      const to = new Date()
      const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { dateFrom: toISODate(from), dateTo: toISODate(to) }
    },
  },
  {
    label: 'This Month',
    apply: () => {
      const to = new Date()
      const from = new Date(to.getFullYear(), to.getMonth(), 1)
      return { dateFrom: toISODate(from), dateTo: toISODate(to) }
    },
  },
  { label: 'All Time', apply: () => ({ dateFrom: '', dateTo: '' }) },
]

export default function FilterPanel({ filters, onChange, onReset }) {
  const toggleSetValue = (setKey, value) => {
    const next = new Set(filters[setKey])
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange({ [setKey]: next })
  }

  return (
    <div className="space-y-5 border-b border-border bg-panel p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search by location, type..."
          className="min-h-[44px] w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-text placeholder:text-muted focus:border-teal focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Incident Type</p>
        <div className="grid grid-cols-2 gap-1.5">
          {INCIDENT_TYPE_LIST.map((type) => (
            <label key={type} className="flex min-h-[32px] cursor-pointer items-center gap-2 text-xs text-text">
              <input
                type="checkbox"
                checked={filters.types.has(type)}
                onChange={() => toggleSetValue('types', type)}
                className="h-3.5 w-3.5 accent-teal"
              />
              {t('en', 'incidentTypes')[type]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Severity</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SEVERITY_LIST.map((severity) => (
            <label key={severity} className="flex min-h-[32px] cursor-pointer items-center gap-2 text-xs text-text">
              <input
                type="checkbox"
                checked={filters.severities.has(severity)}
                onChange={() => toggleSetValue('severities', severity)}
                className="h-3.5 w-3.5 accent-teal"
              />
              {t('en', 'severityLevels')[severity].label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted" htmlFor="status-filter">
          Status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value })}
          className="min-h-[40px] w-full rounded-lg border border-border bg-card px-3 text-sm text-text focus:border-teal focus:outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Date Range</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="min-h-[40px] w-1/2 rounded-lg border border-border bg-card px-2 text-xs text-text focus:border-teal focus:outline-none"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="min-h-[40px] w-1/2 rounded-lg border border-border bg-card px-2 text-xs text-text focus:border-teal focus:outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => onChange(range.apply())}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:border-teal/40 hover:text-text"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-bold text-muted hover:text-text"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset Filters
      </button>
    </div>
  )
}
