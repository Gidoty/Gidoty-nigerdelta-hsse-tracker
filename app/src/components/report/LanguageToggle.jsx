export default function LanguageToggle({ language, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-panel p-1">
      {[
        { id: 'en', label: 'English' },
        { id: 'pidgin', label: 'Pidgin' },
      ].map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`min-h-[44px] rounded-md px-4 text-sm font-bold transition-colors ${
            language === option.id ? 'bg-teal text-white' : 'text-muted hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
