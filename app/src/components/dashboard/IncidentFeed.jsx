import IncidentCard from './IncidentCard.jsx'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'severity', label: 'Severity' },
]

export default function IncidentFeed({ reports, totalCount, sortBy, onSortChange, onSelectReport }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted">Sort by:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSortChange(option.id)}
              className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
                sortBy === option.id ? 'bg-teal text-white' : 'text-muted hover:text-text'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="px-4 py-2 text-xs text-muted">
        Showing {reports.length} of {totalCount} reports
      </p>

      <div className="space-y-3 px-4 pb-4">
        {reports.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No reports match your filters.</p>
        )}
        {reports.map((report) => (
          <IncidentCard key={report.id} report={report} onClick={() => onSelectReport(report.id)} />
        ))}
      </div>
    </div>
  )
}
