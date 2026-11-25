'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { contactSchema } from '@/lib/form-schema'
import { formatMoney } from '@/lib/format'
import { lastFour, normalizePhone } from '@/lib/phone'
import { saveMyRequest } from '@/lib/my-requests'
import type { Currency, Locale } from '@/lib/constants'
import { FieldInput } from '../request/FieldInput'

type Props = {
  tripSlug: string
  tripTitle: string
  maxSeats: number
  unitPrice: number | null
  currency: Currency
}

export function BookTripForm({ tripSlug, tripTitle, maxSeats, unitPrice, currency }: Props) {
  const t = useTranslations('trips')
  const tr = useTranslations('request')
  const locale = useLocale() as Locale
  const router = useRouter()
  const [seats, setSeats] = useState(1)
  const [c, setC] = useState({ fullName: '', phone: '', sameWhatsapp: true, whatsapp: '', notes: '', consent: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [banner, setBanner] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const key = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()))
  const honeypot = useRef<HTMLInputElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = contactSchema(locale).safeParse(c)
    const errs: Record<string, string> = {}
    if (!r.success) for (const i of r.error.issues) errs[`contact.${i.path.join('.')}`] = i.message
    setErrors(errs)
    if (Object.keys(errs).length) {
      setBanner(tr('errorFix'))
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus())
      return
    }
    setSending(true)
    setBanner(null)
    try {
      const res = await fetch('/api/requests/book-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripSlug, seats, locale, idempotencyKey: key.current, contact: c, website: honeypot.current?.value || '' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.reference) {
        const p = normalizePhone(c.phone)
        if (p.ok) saveMyRequest({ reference: data.reference, last4: lastFour(p.e164), title: tripTitle, at: new Date().toISOString() })
        try {
          sessionStorage.setItem('ev-last', JSON.stringify({ reference: data.reference, name: c.fullName, service: tripTitle }))
        } catch {}
        router.push({ pathname: '/request/success', query: { ref: data.reference, t: tripSlug } })
        return
      }
      if (data.errors) setErrors(data.errors)
      setBanner(data.message || tr('errorGeneric'))
    } catch {
      setBanner(tr('errorGeneric'))
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -start-[9999px] size-px opacity-0" />
      <div>
        <p className="field-label" id="seats-label">
          {t('seats')}
        </p>
        <div className="flex items-center gap-3" role="group" aria-labelledby="seats-label">
          <button type="button" className="btn-outline size-12 p-0 text-xl" onClick={() => setSeats((s) => Math.max(1, s - 1))} disabled={seats <= 1} aria-label="−1">
            −
          </button>
          <output className="ltr-nums w-10 text-center font-display text-2xl font-bold text-navy-900" aria-live="polite">
            {seats}
          </output>
          <button type="button" className="btn-outline size-12 p-0 text-xl" onClick={() => setSeats((s) => Math.min(maxSeats, s + 1))} disabled={seats >= maxSeats} aria-label="+1">
            +
          </button>
        </div>
        {errors.seats && <p className="field-error">{errors.seats}</p>}
        {unitPrice != null && (
          <p className="mt-3 text-sm text-muted">
            {t('total')}: <strong className="font-display text-base text-navy-800">{formatMoney(unitPrice * seats, currency, locale)}</strong>
          </p>
        )}
      </div>

      <FieldInput field={{ name: 'fullName', type: 'text', label: tr('fullName'), required: true }} value={c.fullName} error={errors['contact.fullName']} destinations={[]} onChange={(v) => setC((s) => ({ ...s, fullName: String(v) }))} />
      <FieldInput
        field={{ name: 'phone', type: 'tel', label: tr('phone'), placeholder: tr('phonePh'), required: true }}
        value={c.phone}
        error={errors['contact.phone']}
        destinations={[]}
        onChange={(v) => setC((s) => ({ ...s, phone: String(v) }))}
      />
      <FieldInput field={{ name: 'notes', type: 'textarea', label: tr('notes'), placeholder: tr('notesPh') }} value={c.notes} destinations={[]} onChange={(v) => setC((s) => ({ ...s, notes: String(v) }))} />

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={c.consent}
          onChange={(e) => setC((s) => ({ ...s, consent: e.target.checked }))}
          aria-invalid={errors['contact.consent'] ? true : undefined}
          className="mt-1 size-5 shrink-0 accent-navy-800"
        />
        <span className="text-sm leading-6 text-navy-900">
          {tr('consent')}{' '}
          <Link href="/privacy" target="_blank" className="font-semibold underline decoration-gold-500 underline-offset-4">
            {tr('privacyLink')}
          </Link>
        </span>
      </label>
      {errors['contact.consent'] && <p className="field-error">{errors['contact.consent']}</p>}

      <div role="alert" aria-live="assertive" className={banner ? 'rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger' : 'sr-only'}>
        {banner}
      </div>
      <button type="submit" className="btn-gold w-full" disabled={sending} aria-busy={sending}>
        {sending ? tr('sending') : t('book')}
      </button>
      <p className="text-center text-xs text-muted">{t('bookNote')}</p>
    </form>
  )
}
