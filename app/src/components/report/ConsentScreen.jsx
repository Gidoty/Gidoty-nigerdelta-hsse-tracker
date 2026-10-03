import { ShieldCheck } from 'lucide-react'
import { t } from '../../data/translations.js'

export default function ConsentScreen({ language, onAccept, onAnonymous }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-bg px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15">
          <ShieldCheck className="h-9 w-9 text-teal" />
        </span>

        <h1 className="mt-5 text-center text-2xl font-bold text-text">
          {t(language, 'consentTitle')}
        </h1>

        <p className="mt-4 text-sm leading-normal text-muted">{t(language, 'consentIntro')}</p>
        <p className="mt-3 text-sm leading-normal text-muted">{t(language, 'consentProtected')}</p>
        <p className="mt-3 text-sm font-medium leading-normal text-text">{t(language, 'consentStorage')}</p>

        <p className="mt-4 text-sm font-bold text-text">{t(language, 'consentCollectTitle')}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          {t(language, 'consentCollect').map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-teal">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm font-bold text-text">{t(language, 'consentNotCollectTitle')}</p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          {t(language, 'consentNotCollect').map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-danger">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm font-medium text-text">{t(language, 'consentClosing')}</p>

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="flex min-h-[56px] w-full items-center justify-center rounded-lg bg-teal px-6 text-sm font-bold text-white shadow-lg shadow-teal/20 transition-colors hover:bg-teal/90"
          >
            {t(language, 'consentPrimary')}
          </button>
          <button
            type="button"
            onClick={onAnonymous}
            className="flex min-h-[56px] w-full items-center justify-center rounded-lg border border-teal px-6 text-sm font-bold text-text transition-colors hover:bg-teal/10"
          >
            {t(language, 'consentSecondary')}
          </button>
        </div>
      </div>
    </div>
  )
}
