import { useRef, useState } from 'react'
import { Camera, Trash2, Loader2, Calendar } from 'lucide-react'
import { t } from '../../data/translations.js'
import { compressImage, isPhotoTooLarge, dataUrlByteSize } from '../../utils/reportStorage.js'
import SectionHeading from './SectionHeading.jsx'
import FieldError from './FieldError.jsx'

const MAX_PHOTOS = 3

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function EvidenceSection({
  sectionRef,
  language,
  value,
  onChange,
  onDescriptionBlur,
  descriptionError,
}) {
  const fileInputRef = useRef(null)
  const [processing, setProcessing] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const handleFiles = async (fileList) => {
    setPhotoError('')
    const files = Array.from(fileList)
    const remainingSlots = MAX_PHOTOS - value.photos.length
    if (remainingSlots <= 0) {
      setPhotoError(t(language, 'photoMaxReached'))
      return
    }

    const accepted = []
    for (const file of files.slice(0, remainingSlots)) {
      if (isPhotoTooLarge(file)) {
        setPhotoError(t(language, 'photoTooBig'))
        continue
      }
      accepted.push(file)
    }
    if (files.length > remainingSlots) {
      setPhotoError(t(language, 'photoMaxReached'))
    }
    if (accepted.length === 0) return

    setProcessing(true)
    const compressed = await Promise.all(
      accepted.map(async (file) => {
        const dataUrl = await compressImage(file)
        return {
          id: crypto.randomUUID(),
          name: file.name,
          size: dataUrlByteSize(dataUrl),
          dataUrl,
        }
      }),
    )
    setProcessing(false)
    onChange({ ...value, photos: [...value.photos, ...compressed].slice(0, MAX_PHOTOS) })
  }

  const removePhoto = (id) => {
    onChange({ ...value, photos: value.photos.filter((photo) => photo.id !== id) })
  }

  return (
    <section ref={sectionRef} id="section-evidence" className="scroll-mt-36">
      <SectionHeading icon={Camera} title={t(language, 'sectionEvidence')} stepNumber={3} />

      <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="description">
        {t(language, 'description')} <span className="text-danger">*</span>
      </label>
      <textarea
        id="description"
        rows={5}
        maxLength={1000}
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        onBlur={onDescriptionBlur}
        placeholder={t(language, 'descriptionPlaceholder')}
        className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none ${
          descriptionError ? 'border-danger focus:border-danger' : 'border-border focus:border-teal'
        }`}
      />
      <div className="mt-1 flex items-center justify-between">
        <FieldError message={descriptionError} />
        <span className="ml-auto text-xs text-muted">
          {value.description.length} / 1000 {t(language, 'charactersSuffix')}
        </span>
      </div>

      <div className="mt-6">
        <p className="mb-1.5 text-sm font-medium text-text">{t(language, 'uploadPhoto')}</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={value.photos.length >= MAX_PHOTOS || processing}
          className="flex min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted transition-colors hover:border-teal/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? (
            <Loader2 className="h-7 w-7 animate-spin text-teal" />
          ) : (
            <Camera className="h-7 w-7" />
          )}
          <span className="text-sm font-medium">{t(language, 'uploadPhotoHint')}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <p className="mt-2 text-xs text-muted">{t(language, 'photoHelp')}</p>
        {photoError && <p className="mt-1 text-xs font-medium text-danger">{photoError}</p>}

        {value.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {value.photos.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-lg border border-border">
                <img src={photo.dataUrl} alt={photo.name} className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <span className="absolute bottom-0 w-full bg-black/60 px-1.5 py-0.5 text-center text-[10px] text-white">
                  {formatSize(photo.size)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 rounded-lg bg-amber/10 px-4 py-3 text-xs font-medium text-amber">
          {t(language, 'photoPrivacyNote')}
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text" htmlFor="incidentDate">
            <Calendar className="h-4 w-4 text-teal" />
            {t(language, 'dateLabel')}
          </label>
          <input
            id="incidentDate"
            type="date"
            value={value.incidentDate}
            onChange={(e) => onChange({ ...value, incidentDate: e.target.value })}
            className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 text-sm text-text focus:border-teal focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text" htmlFor="incidentTime">
            {t(language, 'timeLabel')}
          </label>
          <input
            id="incidentTime"
            type="time"
            value={value.incidentTime}
            onChange={(e) => onChange({ ...value, incidentTime: e.target.value })}
            className="min-h-[48px] w-full rounded-lg border border-border bg-card px-4 text-sm text-text focus:border-teal focus:outline-none"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">{t(language, 'dateTimeHelp')}</p>
    </section>
  )
}
