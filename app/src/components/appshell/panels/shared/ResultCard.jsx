export default function ResultCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-b from-card to-panel p-5">
      {title && <h3 className="text-sm font-bold text-text">{title}</h3>}
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      <div className={title ? 'mt-3' : ''}>{children}</div>
    </div>
  )
}
