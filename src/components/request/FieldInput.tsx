'use client'
import { useLocale, useTranslations } from 'next-intl'
import type { FormFieldDef, Option } from '@/lib/form-schema'
import { formatHijri } from '@/lib/format'
import { cn } from '@/lib/misc'
import type { Locale } from '@/lib/constants'

type Props = {
  field: FormFieldDef
  value: unknown
  error?: string
  destinations: Option[]
  onChange: (v: unknown) => void
}

export function FieldInput({ field: f, value, error, destinations, onChange }: Props) {
  const locale = useLocale() as Locale
  const t = useTranslations('request')
  const tc = useTranslations('common')
  const id = `f-${f.name}`
  const helpId = f.help ? `${id}-help` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [helpId, errId].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name: f.name,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': f.required ? true : undefined,
  }
  const str = value == null ? '' : String(value)

  const label = (
    <label htmlFor={f.type === 'radio' ? undefined : id} id={`${id}-label`} className="field-label">
      {f.label}
      {!f.required && <span className="ms-1.5 text-sm font-normal text-muted">({tc('optional')})</span>}
    </label>
  )

  let control: React.ReactNode
  switch (f.type) {
    case 'textarea':
      control = <textarea {...common} rows={4} value={str} placeholder={f.placeholder ?? undefined} onChange={(e) => onChange(e.target.value)} className="field-input py-3" />
      break
    case 'number':
      control = (
        <input
          {...common}
          type="text"
          inputMode="numeric"
          pattern="[0-9٠-٩]*"
          dir="ltr"
          value={str}
          placeholder={f.placeholder ?? (f.min != null ? String(f.min) : undefined)}
          onChange={(e) => onChange(e.target.value)}
          className="field-input text-start rtl:text-end"
        />
      )
      break
    case 'date': {
      const today = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10)
      control = (
        <>
          <input {...common} type="date" value={str} min={f.futureOnly ? today : undefined} onChange={(e) => onChange(e.target.value)} className="field-input" />
          {f.showHijri && str && !Number.isNaN(Date.parse(str)) && <p className="field-help text-gold-700">{t('hijri', { date: formatHijri(str + 'T12:00:00Z', locale) })}</p>}
        </>
      )
      break
    }
    case 'select':
    case 'destination': {
      const opts = f.type === 'destination' ? destinations : (f.options ?? [])
      control = (
        <div className="relative">
          <select {...common} value={str} onChange={(e) => onChange(e.target.value)} className="field-input appearance-none pe-10">
            <option value="">{f.placeholder || (locale === 'ar' ? 'اختر…' : 'Choose…')}</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-navy-800" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )
      break
    }
    case 'radio':
      control = (
        <div role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy} className="flex flex-wrap gap-2">
          {(f.options ?? []).map((o) => {
            const checked = str === o.value
            return (
              <label
                key={o.value}
                className={cn(
                  'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-[10px] border px-4 text-[0.95rem] font-medium transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-gold-500',
                  checked ? 'border-navy-800 bg-navy-800 text-white' : 'border-line bg-white text-navy-900 hover:border-navy-700/40',
                )}
              >
                <input type="radio" name={f.name} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
                {o.label}
              </label>
            )
          })}
        </div>
      )
      break
    case 'checkbox':
      return (
        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input {...common} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 accent-navy-800" />
            <span className="font-medium text-navy-900">{f.label}</span>
          </label>
          {error && <p id={errId} className="field-error">{error}</p>}
        </div>
      )
    case 'tel':
      control = <input {...common} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" value={str} placeholder={f.placeholder ?? undefined} onChange={(e) => onChange(e.target.value)} className="field-input text-start rtl:text-end" />
      break
    case 'email':
      control = <input {...common} type="email" inputMode="email" autoComplete="email" dir="ltr" value={str} placeholder={f.placeholder ?? undefined} onChange={(e) => onChange(e.target.value)} className="field-input text-start rtl:text-end" />
      break
    default:
      control = <input {...common} type="text" value={str} placeholder={f.placeholder ?? undefined} onChange={(e) => onChange(e.target.value)} className="field-input" />
  }

  return (
    <div>
      {label}
      {control}
      {f.help && (
        <p id={helpId} className="field-help">
          {f.help}
        </p>
      )}
      {error && (
        <p id={errId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
