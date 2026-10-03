import { Stethoscope, Info } from 'lucide-react'
import { t } from '../../data/translations.js'
import { SYMPTOM_OPTIONS, AFFECTED_COUNT_OPTIONS } from '../../data/incidentTypes.js'
import SectionHeading from './SectionHeading.jsx'

export default function HealthSection({ sectionRef, language, value, onChange }) {
  const toggleSymptom = (symptom) => {
    const has = value.symptoms.includes(symptom)
    onChange({
      ...value,
      symptoms: has ? value.symptoms.filter((s) => s !== symptom) : [...value.symptoms, symptom],
    })
  }

  return (
    <section ref={sectionRef} id="section-health" className="scroll-mt-36">
      <SectionHeading icon={Stethoscope} title={t(language, 'sectionHealth')} stepNumber={4} />

      <p className="mb-3 text-sm font-medium text-text">{t(language, 'healthQuestion')}</p>
      <div className="flex gap-3">
        {[
          { id: true, label: t(language, 'healthYes') },
          { id: false, label: t(language, 'healthNo') },
        ].map((option) => (
          <button
            key={String(option.id)}
            type="button"
            onClick={() => onChange({ ...value, healthImpact: option.id })}
            className={`min-h-[48px] flex-1 rounded-lg border text-sm font-bold transition-colors ${
              value.healthImpact === option.id
                ? 'border-teal bg-teal/15 text-teal'
                : 'border-border bg-card text-muted hover:border-teal/40'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {value.healthImpact && (
        <>
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-text">{t(language, 'symptoms')}</p>
            <div className="space-y-2">
              {SYMPTOM_OPTIONS.map((symptom) => (
                <label
                  key={symptom}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 text-sm text-text has-[:checked]:border-teal has-[:checked]:bg-teal/10"
                >
                  <input
                    type="checkbox"
                    checked={value.symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="h-4 w-4 accent-teal"
                  />
                  {t(language, 'symptomsList')[symptom]}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-text">{t(language, 'affectedCountLabel')}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {AFFECTED_COUNT_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-border bg-card px-2 text-center text-xs font-medium text-text has-[:checked]:border-teal has-[:checked]:bg-teal/10"
                >
                  <input
                    type="radio"
                    name="affectedCount"
                    className="sr-only"
                    checked={value.affectedCount === option}
                    onChange={() => onChange({ ...value, affectedCount: option })}
                  />
                  {t(language, 'affectedCount')[option]}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-6 flex gap-3 rounded-lg border border-border bg-panel px-4 py-3">
        <Info className="h-5 w-5 shrink-0 text-teal" />
        <div>
          <p className="text-xs leading-normal text-muted">{t(language, 'whoNoteText')}</p>
          <p className="mt-1 text-[11px] italic text-muted">{t(language, 'whoNoteSource')}</p>
        </div>
      </div>
    </section>
  )
}
