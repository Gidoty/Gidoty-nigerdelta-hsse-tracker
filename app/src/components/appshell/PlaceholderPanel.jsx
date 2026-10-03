export default function PlaceholderPanel({ parameter, category }) {
  const Icon = parameter.icon

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
        style={{ backgroundColor: `${category.color}22`, color: category.color }}
      >
        <Icon className="h-9 w-9" />
      </span>

      <h1 className="mt-6 text-2xl font-bold text-text">{parameter.label}</h1>

      <p className="mt-4 max-w-lg text-base text-muted">{parameter.description}</p>

      <span
        className="mt-5 rounded-full border px-3 py-1 text-xs font-medium"
        style={{ borderColor: `${category.color}66`, color: category.color }}
      >
        {parameter.reference}
      </span>

      <span className="mt-4 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">
        Building in next prompt
      </span>
    </div>
  )
}
