'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { DocumentSlotDef } from '@/lib/form-schema'
import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_BYTES } from '@/lib/constants'
import { cn } from '@/lib/misc'
import { FileIcon, UploadIcon } from '../icons'

/** Shrinks phone photos (often 3–6 MB) before upload to save mobile data. */
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size < 700 * 1024) return file
  try {
    const { default: imageCompression } = await import('browser-image-compression')
    const out = await imageCompression(file, { maxSizeMB: 0.7, maxWidthOrHeight: 2200, useWebWorker: true, fileType: 'image/jpeg', initialQuality: 0.85 })
    return new File([out], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)

export function DocumentInput({ slot, file, error, onChange }: { slot: DocumentSlotDef; file?: File; error?: string; onChange: (f?: File) => void }) {
  const t = useTranslations('request')
  const tc = useTranslations('common')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string>()
  const id = `doc-${slot.key}`
  const err = localError || error
  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null

  return (
    <div>
      <p className="field-label" id={`${id}-label`}>
        {slot.label}
        {!slot.required && <span className="ms-1.5 text-sm font-normal text-muted">({tc('optional')})</span>}
      </p>
      {slot.help && <p className="-mt-1 mb-2 text-sm text-muted">{slot.help}</p>}

      <label
        htmlFor={id}
        className={cn(
          'flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-gold-500',
          file ? 'border-navy-700/30 bg-navy-50' : 'border-line bg-white hover:border-navy-700/40 hover:bg-navy-50/50',
          err && 'border-danger',
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-16 shrink-0 rounded-lg object-cover" onLoad={() => URL.revokeObjectURL(preview)} />
        ) : (
          <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">{file ? <FileIcon size={28} /> : <UploadIcon size={28} />}</span>
        )}
        <span className="min-w-0 flex-1">
          {busy ? (
            <span className="text-navy-900">{t('compressing')}</span>
          ) : file ? (
            <>
              <span className="block truncate font-medium text-navy-900" dir="ltr">
                {file.name}
              </span>
              <span className="text-sm text-muted">
                {kb(file.size)} · {t('replaceFile')}
              </span>
            </>
          ) : (
            <>
              <span className="block font-medium text-navy-900">{t('chooseFile')}</span>
              <span className="text-sm text-muted">{t('fileTypes')}</span>
            </>
          )}
        </span>
        <input
          id={id}
          type="file"
          accept={DOCUMENT_MIME_TYPES.join(',')}
          className="sr-only"
          aria-describedby={err ? `${id}-err` : undefined}
          aria-invalid={err ? true : undefined}
          onChange={async (e) => {
            const picked = e.target.files?.[0]
            e.target.value = ''
            if (!picked) return
            setLocalError(undefined)
            if (!DOCUMENT_MIME_TYPES.includes(picked.type) && !/\.(jpe?g|png|webp|pdf)$/i.test(picked.name)) {
              setLocalError(t('fileTypes'))
              return
            }
            setBusy(true)
            const ready = await compress(picked)
            setBusy(false)
            if (ready.size > MAX_DOCUMENT_BYTES) {
              setLocalError(t('fileTypes'))
              return
            }
            onChange(ready)
          }}
        />
      </label>
      {file && (
        <button type="button" onClick={() => onChange(undefined)} className="mt-2 text-sm font-medium text-danger hover:underline">
          {t('removeFile')}
        </button>
      )}
      {err && (
        <p id={`${id}-err`} className="field-error">
          {err}
        </p>
      )}
    </div>
  )
}
