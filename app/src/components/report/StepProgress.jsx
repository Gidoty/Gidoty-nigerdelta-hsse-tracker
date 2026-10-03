import { t } from '../../data/translations.js'

const TOTAL_STEPS = 5

export default function StepProgress({ language, currentStep, percent }) {
  return (
    <div className="sticky top-20 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span>{t(language, 'stepLabel', { n: currentStep, total: TOTAL_STEPS })}</span>
          <span>
            {t(language, 'progressLabel')}: {percent}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-teal transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
