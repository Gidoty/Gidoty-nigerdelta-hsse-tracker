import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Droplet, Menu, X, Search } from 'lucide-react'
import { CATEGORIES, TOTAL_PARAMETER_COUNT } from '../data/parameters.js'
import { storage } from '../utils/storage.js'

// Top-level pages shown above the full tool list in the menu. The hamburger
// menu below is the ONE navigation surface for every screen size — desktop
// included — so every tool is always one click away, no matter the device.
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
]

function Logo() {
  return (
    <NavLink to="/" className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/15 ring-1 ring-teal/40">
        <Droplet className="h-5 w-5 text-teal" fill="currentColor" fillOpacity={0.25} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-bold text-text">NigerDelta HSSE Tracker</span>
        <span className="text-xs text-muted">Community Environmental Monitoring</span>
      </span>
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CATEGORIES
    return CATEGORIES.map((category) => ({
      ...category,
      parameters: category.parameters.filter((p) => p.label.toLowerCase().includes(q)),
    })).filter((category) => category.parameters.length > 0)
  }, [query])

  const closeMenu = () => {
    setOpen(false)
    setQuery('')
  }

  const handleSelectParameter = (categoryId, parameterId) => {
    if (parameterId === 'submit-new-incident') {
      navigate('/report')
      closeMenu()
      return
    }
    storage.setLastParam({ category: categoryId, parameter: parameterId })
    navigate('/dashboard')
    closeMenu()
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text hover:bg-card"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
      >
        <div
          className={`ml-auto flex h-full w-80 max-w-[85vw] flex-col bg-panel shadow-2xl transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <span className="text-sm font-bold text-text">Menu</span>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:text-text"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col gap-1 px-4 pt-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-teal/15 text-teal' : 'text-muted hover:bg-card hover:text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border px-6 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              All tools
            </span>
            <span className="text-[11px] text-muted">{TOTAL_PARAMETER_COUNT} total</span>
          </div>

          <div className="px-4 pb-2 pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all tools..."
                className="min-h-[40px] w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-text placeholder:text-muted focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-2 px-5 pb-2 pt-4 first:pt-1">
                    <CategoryIcon className="h-3.5 w-3.5" style={{ color: category.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                      {category.label}
                    </span>
                  </div>
                  {category.parameters.map((parameter) => {
                    const ParamIcon = parameter.icon
                    return (
                      <button
                        key={parameter.id}
                        type="button"
                        onClick={() => handleSelectParameter(category.id, parameter.id)}
                        className="flex min-h-[44px] w-full items-center gap-3 border-l-[3px] border-transparent py-2 pl-5 pr-4 text-left text-sm text-muted transition-colors hover:border-teal hover:bg-white/[0.04] hover:text-text"
                      >
                        <ParamIcon className="h-[18px] w-[18px] shrink-0" style={{ color: category.color }} />
                        <span className="truncate">{parameter.label}</span>
                        {parameter.status === 'placeholder' && (
                          <span className="ml-auto shrink-0 text-[9px] font-bold uppercase text-warning">
                            soon
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
            {filteredCategories.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-muted">No tools match “{query}”.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
