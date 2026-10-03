import { Users, Lock } from 'lucide-react'
import { t } from '../../data/translations.js'
import SectionHeading from './SectionHeading.jsx'

export default function ContactSection({
  sectionRef,
  language,
  value,
  onChange,
  anonymousMode,
  onChangeAnonymousMode,
}) {
  return (
    <section ref={sectionRef} id="section-contact" className="scroll-mt-36">
      <SectionHeading icon={Users} title={t(language, 'sectionContact')} stepNumber={5} />

      <p className="mb-5 rounded-lg bg-amber/10 px-4 py-3 text-sm font-medium text-amber">
        {t(language, 'contactNote')}
      </p>

      {anonymousMode ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4">
          <Lock className="h-5 w-5 shrink-0 text-teal" />
          <div>
            <p className="text-sm text-text">{t(language, 'anonymousNotice')}</p>
            <button
              type="button"
              onClick={() => onChangeAnonymousMode(false)}
              className="mt-1 text-sm font-bold text-teal underline underline-offset-2"
            >
              {t(language, 'changeToStandard')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="contactName">
                {t(language, 'yourName')}
              </label>
              <input
                id="contactName"
                type="text"
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                placeholder={t(language, 'yourNamePlaceholder')}
                className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 text-sm text-text placeholder:text-muted focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="contactPhone">
                {t(language, 'yourPhone')}
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={value.phone}
                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                placeholder={t(language, 'yourPhonePlaceholder')}
                className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 text-sm text-text placeholder:text-muted focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {[
              { key: 'willingToContact', label: t(language, 'contactWillingToContact') },
              { key: 'willingToWitness', label: t(language, 'contactWillingToWitness') },
              { key: 'wantsNotification', label: t(language, 'contactWantsNotification') },
            ].map((item) => (
              <label
                key={item.key}
                className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-text has-[:checked]:border-teal has-[:checked]:bg-teal/10"
              >
                <input
                  type="checkbox"
                  checked={value[item.key]}
                  onChange={(e) => onChange({ ...value, [item.key]: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-teal"
                />
                {item.label}
              </label>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
