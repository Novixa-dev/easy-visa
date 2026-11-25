'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { formatDate } from '@/lib/format'
import { toLatinDigits } from '@/lib/digits'
import { cn } from '@/lib/misc'
import type { Locale, RequestStatus } from '@/lib/constants'
import { CheckIcon, LockIcon } from '../icons'
import { PaymentPanel, type Invoice } from './PaymentPanel'
import { loadMyRequests, saveMyRequest } from '@/lib/my-requests'
import { normalizeReference } from '@/lib/reference'

type Result = {
  reference: string
  service: { title: string; slug: string } | null
  submittedAt: string
  updatedAt: string
  status: RequestStatus
  statusLabel: string
  message: string
  timeline: { status: RequestStatus; label: string; at: string; message: string | null }[]
  trip: { title: string; slug: string; departureAt: string; from: string; to: string; seats: number } | null
  invoice: Invoice | null
}

const PATH: RequestStatus[] = ['new', 'under_review', 'in_progress', 'completed']

export function TrackForm({ initialRef }: { initialRef?: string }) {
  const t = useTranslations('track')
  const ts = useTranslations('status')
  const tsx = useTranslations('success')
  const locale = useLocale() as Locale
  const [reference, setReference] = useState(initialRef ?? '')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  const lookup = async (ref: string, last4: string, quiet = false) => {
    setError(null)
    if (!quiet) setLoading(true)
    try {
      const res = await fetch('/api/requests/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, phone: last4, locale }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setResult(data)
        // Remember it on this device so it appears under "My requests".
        if (!loadMyRequests().some((x) => x.reference === data.reference))
          saveMyRequest({ reference: data.reference, last4, title: data.trip?.title ?? data.service?.title ?? '', at: data.submittedAt })
        if (!quiet) requestAnimationFrame(() => resultRef.current?.focus())
      } else {
        setResult(null)
        setError(data.message || t('help'))
      }
    } catch {
      setError(locale === 'ar' ? 'تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.' : 'Connection failed. Check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Opened from "My requests" or a saved link: fill the phone digits and look it up straight away.
  useEffect(() => {
    if (!initialRef) return
    const ref = normalizeReference(initialRef)
    const saved = ref ? loadMyRequests().find((x) => x.reference === ref) : undefined
    if (ref && saved) {
      setReference(ref)
      setPhone(saved.last4)
      lookup(ref, saved.last4)
    } else phoneRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    lookup(reference, phone)
  }

  if (result) {
    const terminal = ['rejected', 'cancelled'].includes(result.status)
    const path: RequestStatus[] = result.status === 'awaiting_customer' ? ['new', 'under_review', 'awaiting_customer', 'in_progress', 'completed'] : terminal ? ['new', 'under_review', result.status] : PATH
    const currentIdx = path.indexOf(result.status)
    return (
      <div ref={resultRef} tabIndex={-1} className="outline-none" aria-live="polite">
        <div className="ticket-wrap">
        <div className="ticket px-6 pt-6 pb-7 sm:px-8 [--notch-at:44%]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{t('reference')}</p>
              <p className="ltr-nums font-display text-2xl font-bold tracking-wider text-navy-800">{result.reference}</p>
              {result.trip ? (
                <p className="mt-1 font-semibold text-navy-900">
                  {result.trip.title}
                  <span className="block text-sm font-normal text-muted">
                    {formatDate(result.trip.departureAt, locale, true)} · {tsx('seats')}: <span className="ltr-nums">{result.trip.seats}</span>
                  </span>
                </p>
              ) : (
                result.service && <p className="mt-1 font-semibold text-navy-900">{result.service.title}</p>
              )}
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-semibold',
                result.status === 'completed' ? 'bg-wa/10 text-wa' : terminal ? 'bg-danger/10 text-danger' : result.status === 'awaiting_customer' ? 'bg-gold-100 text-gold-700' : 'bg-navy-50 text-navy-800',
              )}
            >
              {result.statusLabel}
            </span>
          </div>
          <div className="ticket-tear" aria-hidden />
          <dl className="mt-14 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">{t('submitted')}</dt>
              <dd className="font-semibold text-navy-900">{formatDate(result.submittedAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t('updated')}</dt>
              <dd className="font-semibold text-navy-900">{formatDate(result.updatedAt, locale, true)}</dd>
            </div>
          </dl>
        </div>
        </div>

        <div className="mt-6 rounded-xl border border-gold-500/30 bg-gold-50 p-5">
          <p className="text-sm font-semibold text-gold-700">{t('message')}</p>
          <p className="mt-1 leading-7 text-navy-900">{result.message}</p>
        </div>

        <h2 className="mt-10 text-xl font-semibold">{t('timeline')}</h2>
        <ol className="mt-5">
          {path.map((s, i) => {
            const done = i < currentIdx || (i === currentIdx && s === 'completed')
            const current = i === currentIdx && s !== 'completed'
            const event = [...result.timeline].reverse().find((e) => e.status === s)
            return (
              <li key={s} className="relative flex gap-4 pb-7 last:pb-0">
                {i < path.length - 1 && <span aria-hidden className={cn('absolute start-[15px] top-8 bottom-0 w-0.5', i < currentIdx ? 'bg-navy-800' : 'bg-line')} />}
                <span
                  className={cn(
                    'relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2',
                    done ? 'border-navy-800 bg-navy-800 text-white' : current ? 'border-gold-500 bg-white text-gold-600' : 'border-line bg-white text-line',
                  )}
                >
                  {done ? <CheckIcon size={16} /> : <span className={cn('size-2.5 rounded-full', current ? 'bg-gold-500' : 'bg-line')} />}
                </span>
                <div className="pt-0.5">
                  <p className={cn('font-semibold', done || current ? 'text-navy-900' : 'text-muted')} aria-current={current ? 'step' : undefined}>
                    {ts(s)}
                  </p>
                  {event && <p className="text-sm text-muted">{formatDate(event.at, locale, true)}</p>}
                  {event?.message && <p className="mt-1 text-[0.95rem] leading-6 text-navy-900">{event.message}</p>}
                </div>
              </li>
            )
          })}
        </ol>

        {result.invoice && <PaymentPanel invoice={result.invoice} reference={result.reference} phone={phone} onSent={() => lookup(result.reference, phone, true)} />}

        <button
          type="button"
          className="btn-outline mt-10"
          onClick={() => {
            setResult(null)
            setPhone('')
          }}
        >
          {t('another')}
        </button>
      </div>
    )
  }

  return (
    <div className="ticket-wrap">
    <form onSubmit={submit} className="ticket px-6 pt-7 pb-8 sm:px-8 [--notch-at:58%]" noValidate>
      <div className="grid gap-5">
        <div>
          <label htmlFor="trk-ref" className="field-label">
            {t('reference')}
          </label>
          <input
            id="trk-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('referencePh')}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            dir="ltr"
            required
            className="field-input font-display tracking-wider uppercase placeholder:normal-case"
          />
        </div>
        <div>
          <label htmlFor="trk-phone" className="field-label">
            {t('phone')}
          </label>
          <input
            ref={phoneRef}
            id="trk-phone"
            value={phone}
            onChange={(e) => setPhone(toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 4))}
            placeholder={t('phonePh')}
            inputMode="numeric"
            autoComplete="off"
            dir="ltr"
            maxLength={4}
            required
            className="field-input ltr-nums w-40 font-display text-lg tracking-[0.4em]"
          />
        </div>
      </div>
      <div className="ticket-tear" aria-hidden />
      <div className="mt-16">
        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading || !reference || phone.length !== 4} aria-busy={loading}>
          {loading ? t('checking') : t('submit')}
        </button>
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <LockIcon size={16} className="mt-1 shrink-0" />
          {t('privacy')}
        </p>
      </div>
    </form>
    </div>
  )
}
