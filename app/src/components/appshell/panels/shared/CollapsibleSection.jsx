import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left"
      >
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span className="flex-1 text-sm font-bold text-text">{title}</span>
        {open ? <ChevronUp className="h-5 w-5 text-muted" /> : <ChevronDown className="h-5 w-5 text-muted" />}
      </button>
      {open && <div className="space-y-4 border-t border-border px-4 py-4 text-sm leading-normal text-muted">{children}</div>}
    </div>
  )
}
