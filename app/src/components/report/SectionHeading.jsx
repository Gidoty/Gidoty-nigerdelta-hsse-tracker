export default function SectionHeading({ icon: Icon, title, stepNumber }) {
  return (
    <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-muted">
          Section {stepNumber}
        </span>
        <h2 className="text-lg font-bold text-text">{title}</h2>
      </div>
    </div>
  )
}
