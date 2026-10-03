import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, Droplet } from 'lucide-react'
import { CATEGORIES, TOTAL_PARAMETER_COUNT } from '../../data/parameters.js'

export default function Drawer({ open, onClose, activeParameterId, onSelectParameter, reportsCount }) {
  const [query, setQuery] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const searchRef = useRef(null)

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CATEGORIES
    return CATEGORIES.map((category) => ({
      ...category,
      parameters: category.parameters.filter((p) => p.label.toLowerCase().includes(q)),
    })).filter((category) => category.parameters.length > 0)
  }, [query])

  const flatParameters = useMemo(
    () => filteredCategories.flatMap((category) => category.parameters.map((p) => ({ ...p, categoryId: category.id }))),
    [filteredCategories],
  )

  useEffect(() => {
    if (open) searchRef.current?.focus()
    setHighlightIndex(-1)
  }, [open])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, flatParameters.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (event.key === 'Enter' && highlightIndex >= 0) {
      const target = flatParameters[highlightIndex]
      if (target) onSelectParameter(target.categoryId, target.id)
    }
  }

  return (
    <nav
      role="navigation"
      aria-label="Parameter Navigation"
      aria-expanded={open}
      onKeyDown={handleKeyDown}
      className={`fixed bottom-0 left-0 top-14 z-[200] flex w-full flex-col border-r border-border bg-bg transition-transform duration-300 ease-in-out print:hidden md:w-[300px] ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/15 ring-1 ring-teal/40">
            <Droplet className="h-4 w-4 text-teal" fill="currentColor" fillOpacity={0.25} />
          </span>
          <div>
            <p className="text-sm font-bold text-text">NigerDelta HSSE Tracker</p>
            <p className="text-[11px] text-muted">{TOTAL_PARAMETER_COUNT} Parameters · Community Monitoring</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close drawer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-text"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parameters..."
            className="min-h-[40px] w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-text placeholder:text-muted focus:border-teal focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-3">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon
          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 px-5 pb-2 pt-5 first:pt-2">
                <CategoryIcon className="h-3.5 w-3.5" style={{ color: category.color }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                  {category.label}
                </span>
              </div>
              {category.parameters.map((parameter) => {
                const ParamIcon = parameter.icon
                const active = parameter.id === activeParameterId
                const flatIndex = flatParameters.findIndex((p) => p.id === parameter.id)
                const highlighted = flatIndex === highlightIndex
                return (
                  <button
                    key={parameter.id}
                    type="button"
                    onClick={() => onSelectParameter(category.id, parameter.id)}
                    className={`flex min-h-[44px] w-full items-center gap-3 border-l-[3px] py-2 pl-5 pr-4 text-left text-sm transition-colors ${
                      active
                        ? 'border-teal bg-teal/[0.08] font-bold text-text'
                        : 'border-transparent text-muted hover:bg-white/[0.04]'
                    } ${highlighted ? 'ring-1 ring-inset ring-teal/60' : ''}`}
                  >
                    <ParamIcon className="h-[18px] w-[18px] shrink-0" style={{ color: category.color }} />
                    <span className="truncate">{parameter.label}</span>
                    {parameter.status === 'placeholder' && (
                      <span className="ml-auto shrink-0 text-[9px] font-bold uppercase text-warning">soon</span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
        {flatParameters.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-muted">No parameters match “{query}”.</p>
        )}
      </div>

      <div className="border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <p className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-safe" />
          {reportsCount} report{reportsCount === 1 ? '' : 's'} saved on this device
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          <Link to="/about" className="hover:text-text">
            About
          </Link>
          <span>·</span>
          <Link to="/about" className="hover:text-text">
            Privacy
          </Link>
          <span>·</span>
          <Link to="/about" className="hover:text-text">
            Legal
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-muted">v1.0 · HSSE Tracker</p>
        <p className="mt-1 text-[11px] text-muted">Built by Gideon Owhonda</p>
      </div>
    </nav>
  )
}
