import { Link } from 'react-router-dom'
import { Droplet } from 'lucide-react'

const FOOTER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report Incident' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-panel">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/15 ring-1 ring-teal/40">
            <Droplet className="h-5 w-5 text-teal" fill="currentColor" fillOpacity={0.25} />
          </span>
          <span className="text-sm font-bold text-text">NigerDelta HSSE Tracker</span>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {FOOTER_LINKS.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition-colors hover:text-teal">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted">© 2026 Gideon Owhonda</p>
      </div>

      <div className="border-t border-border py-4">
        <p className="text-center text-xs tracking-wide text-muted">
          Community data. Independent verification. Environmental justice.
        </p>
      </div>
    </footer>
  )
}
