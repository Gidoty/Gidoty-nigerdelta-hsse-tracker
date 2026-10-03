import { Scale } from 'lucide-react'

export default function LegalBasisBadge({ text }) {
  return (
    <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-[11px] text-muted">
      <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
      <span>
        <span className="font-bold text-text">Legal basis:</span> {text}
      </span>
    </div>
  )
}
