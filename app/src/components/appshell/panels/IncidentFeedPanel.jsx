import { useCallback, useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import FilterPanel from '../../dashboard/FilterPanel.jsx'
import IncidentFeed from '../../dashboard/IncidentFeed.jsx'
import ReportDetailModal from '../ReportDetailModal.jsx'
import { useReportsWithDemo } from '../../../hooks/useReportsWithDemo.js'
import { defaultFilters, filterReports, sortReports } from '../../../utils/dashboardUtils.js'
import LegalBasisBadge from './shared/LegalBasisBadge.jsx'

export default function IncidentFeedPanel() {
  const { combinedReports } = useReportsWithDemo()
  const [filters, setFilters] = useState(defaultFilters())
  const [sortBy, setSortBy] = useState('newest')
  const [viewingId, setViewingId] = useState(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filtered = useMemo(() => filterReports(combinedReports, filters), [combinedReports, filters])
  const sorted = useMemo(() => sortReports(filtered, sortBy), [filtered, sortBy])
  const viewing = combinedReports.find((r) => r.id === viewingId)

  const handleFilterChange = useCallback((patch) => setFilters((prev) => ({ ...prev, ...patch })), [])
  const handleResetFilters = useCallback(() => setFilters(defaultFilters()), [])

  return (
    <div className="flex h-full flex-col lg:flex-row">
      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="m-4 flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-bold text-text lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <div className="hidden lg:block lg:w-[280px] lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-border">
        <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <IncidentFeed
          reports={sorted}
          totalCount={combinedReports.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectReport={setViewingId}
        />
        <div className="px-4 pb-4">
          <LegalBasisBadge text="NOSDRA Act 2006" />
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[1500] flex items-end lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-panel">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-panel px-4 py-3">
              <span className="text-sm font-bold text-text">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
          </div>
        </div>
      )}

      {viewing && <ReportDetailModal report={viewing} onClose={() => setViewingId(null)} />}
    </div>
  )
}
