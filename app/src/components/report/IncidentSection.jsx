import { Flame } from 'lucide-react'
import { t } from '../../data/translations.js'
import { INCIDENT_TYPES, SEVERITY_LEVELS, DURATION_OPTIONS } from '../../data/incidentTypes.js'
import SectionHeading from './SectionHeading.jsx'
import FieldError from './FieldError.jsx'

const SEVERITY_STYLES = {
  safe: { active: 'border-safe bg-safe/15 text-safe', dot: 'bg-safe' },
  warning: { active: 'border-warning bg-warning/15 text-warning', dot: 'bg-warning' },
  amber: { active: 'border-amber bg-amber/15 text-amber', dot: 'bg-amber' },
  danger: { active: 'border-danger bg-danger/15 text-danger', dot: 'bg-danger' },
}

export default function IncidentSection({
  sectionRef,
  language,
  value,
  onChange,
  typeError,
  severityError,
}) {
  const selectedType = INCIDENT_TYPES.find((item) => item.id === value.type)

  return (
    <section ref={sectionRef} id="section-incident" className="scroll-mt-36">
      <SectionHeading icon={Flame} title={t(language, 'sectionIncident')} stepNumber={2} />

      <p className="mb-3 text-sm font-medium text-text">
        {t(language, 'incidentType')} <span className="text-danger">*</span>
      </p>
      <div
        className={`grid grid-cols-2 gap-3 rounded-xl ${
          typeError ? 'ring-2 ring-danger/60 ring-offset-2 ring-offset-bg' : ''
        }`}
      >
        {INCIDENT_TYPES.map((item) => {
          const Icon = item.icon
          const active = value.type === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...value, type: item.id, subType: '' })}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center text-sm font-medium transition-colors ${
                active
                  ? 'border-teal bg-teal/15 text-teal'
                  : 'border-border bg-card text-muted hover:border-teal/40'
              }`}
            >
              <Icon className="h-6 w-6" />
              {t(language, 'incidentTypes')[item.id]}
            </button>
          )
        })}
      </div>
      <FieldError message={typeError} />

      {selectedType && selectedType.subTypes.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-text">{t(language, 'subTypeLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {selectedType.subTypes.map((subTypeId) => {
              const active = value.subType === subTypeId
              return (
                <button
                  key={subTypeId}
                  type="button"
                  onClick={() => onChange({ ...value, subType: subTypeId })}
                  className={`min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors ${
                    active
                      ? 'border-teal bg-teal/15 text-teal'
                      : 'border-border bg-card text-muted hover:border-teal/40'
                  }`}
                >
                  {t(language, 'subTypes')[subTypeId]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-7">
        <p className="mb-3 text-sm font-medium text-text">
          {t(language, 'severity')} <span className="text-danger">*</span>
        </p>
        <div
          className={`grid grid-cols-1 gap-3 rounded-xl sm:grid-cols-4 ${
            severityError ? 'ring-2 ring-danger/60 ring-offset-2 ring-offset-bg' : ''
          }`}
        >
          {SEVERITY_LEVELS.map((level) => {
            const active = value.severity === level.id
            const styles = SEVERITY_STYLES[level.color]
            const info = t(language, 'severityLevels')[level.id]
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => onChange({ ...value, severity: level.id })}
                className={`flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                  active ? styles.active : 'border-border bg-card text-muted hover:border-teal/40'
                }`}
              >
                <span className="text-sm font-bold">{info.label}</span>
                <span className="text-[11px] leading-tight opacity-90">{info.help}</span>
              </button>
            )
          })}
        </div>
        <FieldError message={severityError} />
      </div>

      <div className="mt-7">
        <p className="mb-3 text-sm font-medium text-text">{t(language, 'durationLabel')}</p>
        <div className="space-y-2">
          {DURATION_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 text-sm text-text has-[:checked]:border-teal has-[:checked]:bg-teal/10"
            >
              <input
                type="radio"
                name="duration"
                value={option}
                checked={value.duration === option}
                onChange={(e) => onChange({ ...value, duration: e.target.value })}
                className="h-4 w-4 accent-teal"
              />
              {t(language, 'duration')[option]}
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
