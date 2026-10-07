import { Link } from 'react-router-dom'
import { CheckCircle2, Download, AlertTriangle } from 'lucide-react'
import { t } from '../../data/translations.js'
import { downloadSubmissionExport } from '../../utils/integrity.js'

export default function ResultScreen({ language, referenceNumber, report, onSubmitAnother }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-safe/15 text-safe">
        <CheckCircle2 className="h-10 w-10" />
      </span>

      <h1 className="mt-6 text-2xl font-bold text-text">{t(language, 'successTitle')}</h1>

      <p className="mt-3 text-sm leading-normal text-muted">{t(language, 'successText')}</p>

      <p className="mt-4 text-2xl font-bold tracking-wide text-teal">{referenceNumber}</p>

      <p className="mt-4 text-xs text-muted">{t(language, 'shareWithNosdra')}</p>

      {report && (
        <div className="mt-6 flex w-full items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 p-4 text-left text-xs text-text">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
          <span>
            This report lives only on this device. Export a copy now and keep it somewhere else — a browser
            can clear local storage, and only an export made before any later change lets anyone (including
            you) notice if this record is ever altered.
          </span>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-3">
        {report && (
          <button
            type="button"
            onClick={() => downloadSubmissionExport(report)}
            className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-lg border border-amber px-6 text-sm font-bold text-amber transition-colors hover:bg-amber/10"
          >
            <Download className="h-4 w-4" />
            Export This Report Now
          </button>
        )}
        <button
          type="button"
          onClick={onSubmitAnother}
          className="flex min-h-[56px] w-full items-center justify-center rounded-lg bg-teal px-6 text-sm font-bold text-white transition-colors hover:bg-teal/90"
        >
          {t(language, 'submitAnother')}
        </button>
        <Link
          to="/dashboard"
          className="flex min-h-[56px] w-full items-center justify-center rounded-lg border border-teal px-6 text-sm font-bold text-text transition-colors hover:bg-teal/10"
        >
          {t(language, 'viewDashboard')}
        </Link>
      </div>
    </div>
  )
}
