import { useState } from 'react'
import { MapPin, Crosshair, CheckCircle2, Loader2 } from 'lucide-react'
import { t } from '../../data/translations.js'
import { NIGER_DELTA_STATES } from '../../data/incidentTypes.js'
import SectionHeading from './SectionHeading.jsx'
import FieldError from './FieldError.jsx'

export default function LocationSection({ sectionRef, language, value, onChange, onLandmarkBlur, error }) {
  const [locating, setLocating] = useState(false)

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      onChange({ ...value, locationError: 'Geolocation is not supported on this device.' })
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        onChange({
          ...value,
          gps: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          },
          display: {
            lat: Math.round(pos.coords.latitude * 100) / 100,
            lng: Math.round(pos.coords.longitude * 100) / 100,
          },
          locationError: null,
        })
      },
      (err) => {
        setLocating(false)
        onChange({ ...value, locationError: err.message })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <section ref={sectionRef} id="section-location" className="scroll-mt-36">
      <SectionHeading icon={MapPin} title={t(language, 'sectionLocation')} stepNumber={1} />

      <button
        type="button"
        onClick={handleGetLocation}
        disabled={locating}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-lg border border-teal bg-teal/10 px-6 text-sm font-bold text-teal transition-colors hover:bg-teal/20 disabled:opacity-60"
      >
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crosshair className="h-5 w-5" />}
        {t(language, 'getLocation')}
      </button>
      <p className="mt-2 text-xs text-muted">{t(language, 'locationHelp')}</p>

      {value.display && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-safe/10 px-4 py-3 text-sm font-medium text-safe">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t(language, 'locationCaptured', {
            lat: value.display.lat,
            lng: value.display.lng,
            accuracy: Math.round(value.gps.accuracy),
          })}
        </p>
      )}
      {value.locationError && (
        <p className="mt-3 text-sm font-medium text-warning">{t(language, 'locationDenied')}</p>
      )}

      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="landmark">
          {t(language, 'landmarkLabel')}
        </label>
        <input
          id="landmark"
          type="text"
          value={value.landmark}
          onChange={(e) => onChange({ ...value, landmark: e.target.value })}
          onBlur={onLandmarkBlur}
          placeholder={t(language, 'landmarkPlaceholder')}
          className={`min-h-[48px] w-full rounded-lg border bg-card px-4 text-sm text-text placeholder:text-muted focus:outline-none ${
            error ? 'border-danger focus:border-danger' : 'border-border focus:border-teal'
          }`}
        />
        <FieldError message={error} />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="state">
            {t(language, 'stateLabel')}
          </label>
          <select
            id="state"
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 text-sm text-text focus:border-teal focus:outline-none"
          >
            <option value="">{t(language, 'stateSelect')}</option>
            {NIGER_DELTA_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="lga">
            {t(language, 'lgaLabel')}
          </label>
          <input
            id="lga"
            type="text"
            value={value.lga}
            onChange={(e) => onChange({ ...value, lga: e.target.value })}
            placeholder={t(language, 'lgaPlaceholder')}
            className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 text-sm text-text placeholder:text-muted focus:border-teal focus:outline-none"
          />
        </div>
      </div>
    </section>
  )
}
