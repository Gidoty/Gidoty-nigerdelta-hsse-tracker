export default function PanelSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-card" />
        <div className="h-7 w-64 rounded bg-card" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded bg-card" />
        <div className="h-4 w-5/6 rounded bg-card" />
        <div className="h-4 w-2/3 rounded bg-card" />
      </div>
      <p className="mt-6 text-xs text-muted">Loading...</p>
    </div>
  )
}
