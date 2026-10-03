export default function PanelHeader({ icon: Icon, color, title, badges = [] }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}22`, color }}
        >
          <Icon className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-bold text-text">{title}</h1>
      </div>
      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: `${color}66`, color }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
