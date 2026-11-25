'use client'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Link } from '@/i18n/routing'
import { loadMyRequests, removeMyRequest, saveMyRequest, type SavedRequest } from '@/lib/my-requests'
import { normalizeReference } from '@/lib/reference'
import { toLatinDigits } from '@/lib/digits'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/misc'
import type { Currency, Locale, RequestStatus } from '@/lib/constants'
import { LockIcon } from '../icons'

type Live = {
  found: boolean
  reference: string
  title?: string
  status?: RequestStatus
  statusLabel?: string
  message?: string
  updatedAt?: string
  due?: { amount: number; currency: Currency } | null
}

const tone = (s?: RequestStatus) =>
  s === 'completed' ? 'bg-wa/10 text-wa' : s === 'rejected' || s === 'cancelled' ? 'bg-danger/10 text-danger' : s === 'awaiting_customer' ? 'bg-gold-100 text-gold-700' : 'bg-navy-50 text-navy-800'

export function MyRequests() {
  const t = useTranslations('my')
  const tt = useTranslations('track')
  const locale = useLocale() as Locale
  const [items, setItems] = useState<SavedRequest[] | null>(null)
  const [live, setLive] = useState<Record<string, Live>>({})
  const [loading, setLoading] = useState(false)
  const [ref, setRef] = useState('')
  const [last4, setLast4] = useState('')
  const [addError, setAddError] = useState<string | null>(null)

  const refresh = useCallback(
    async (list: SavedRequest[]) => {
      if (!list.length) return
      setLoading(true)
      try {
        const res = await fetch('/api/requests/track-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, items: list.map((i) => ({ reference: i.reference, phone: i.last4 })) }),
        })
        const data = await res.json()
        const map: Record<string, Live> = {}
        for (const r of data.results ?? []) if (r.reference) map[r.reference] = r
        setLive(map)
        return map
      } catch {
        return null
      } finally {
        setLoading(false)
      }
    },
    [locale],
  )

  useEffect(() => {
    const list = loadMyRequests()
    setItems(list)
    refresh(list)
  }, [refresh])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)
    const r = normalizeReference(ref)
    const p = toLatinDigits(last4).replace(/\D/g, '')
    if (!r || p.length !== 4) {
      setAddError(tt('intro'))
      return
    }
    const entry = { reference: r, last4: p, title: '', at: new Date().toISOString() }
    const map = await refresh([entry, ...(items ?? [])])
    if (!map?.[r]?.found) {
      setAddError(t('notFound'))
      return
    }
    saveMyRequest({ ...entry, title: map[r].title ?? '' })
    setItems(loadMyRequests())
    setRef('')
    setLast4('')
  }

  if (items === null) return <div className="h-40 animate-pulse rounded-[var(--radius-ticket)] bg-navy-50" aria-busy />

  return (
    <div>
      {items.length === 0 ? (
        <p className="rounded-[var(--radius-ticket)] border border-dashed border-line p-8 text-center text-muted">{t('empty')}</p>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button type="button" onClick={() => refresh(items)} className="btn-ghost min-h-10 text-sm" disabled={loading} aria-busy={loading}>
              {t('refresh')}
            </button>
          </div>
          <ul className="space-y-4" aria-busy={loading}>
            {items.map((i) => {
              const l = live[i.reference]
              return (
                <li key={i.reference} className="rounded-[var(--radius-ticket)] border border-line bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="ltr-nums font-display text-lg font-bold tracking-wider text-navy-800">{i.reference}</p>
                      <p className="font-semibold text-navy-900">{l?.title || i.title}</p>
                      <p className="text-sm text-muted">{formatDate(i.at, locale)}</p>
                    </div>
                    {l?.found ? (
                      <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', tone(l.status))}>{l.statusLabel}</span>
                    ) : l && !l.found ? (
                      <span className="rounded-full bg-line px-3 py-1 text-sm text-muted">{t('notFound')}</span>
                    ) : (
                      <span className="h-7 w-24 animate-pulse rounded-full bg-navy-50" />
                    )}
                  </div>
                  {l?.message && <p className="mt-3 text-[0.95rem] leading-7 text-navy-900">{l.message}</p>}
                  {l?.due && l.due.amount > 0 && (
                    <p className="mt-3 inline-flex rounded-lg bg-gold-50 px-3 py-1.5 text-sm font-semibold text-gold-700 ring-1 ring-gold-500/30">
                      {t('due', { amount: formatMoney(l.due.amount, l.due.currency, locale) })}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <Link href={{ pathname: '/track', query: { ref: i.reference } }} className="btn-primary min-h-10 px-4 text-sm">
                      {t('open')}
                    </Link>
                    <button
                      type="button"
                      className="text-sm font-medium text-muted hover:text-danger"
                      onClick={() => {
                        removeMyRequest(i.reference)
                        setItems(loadMyRequests())
                      }}
                    >
                      {t('remove')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <form onSubmit={add} className="mt-10 rounded-[var(--radius-ticket)] bg-navy-50 p-5" noValidate>
        <h2 className="text-lg font-semibold">{t('add')}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_9rem_auto]">
          <label className="sr-only" htmlFor="my-ref">
            {tt('reference')}
          </label>
          <input id="my-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder={tt('referencePh')} dir="ltr" autoComplete="off" className="field-input font-display tracking-wider uppercase placeholder:normal-case" />
          <label className="sr-only" htmlFor="my-last4">
            {tt('phone')}
          </label>
          <input
            id="my-last4"
            value={last4}
            onChange={(e) => setLast4(toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 4))}
            placeholder={tt('phonePh')}
            inputMode="numeric"
            dir="ltr"
            className="field-input ltr-nums tracking-[0.3em]"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {t('addCta')}
          </button>
        </div>
        {addError && (
          <p role="alert" className="field-error">
            {addError}
          </p>
        )}
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <LockIcon size={16} className="mt-1 shrink-0" /> {t('privacy')}
        </p>
      </form>
    </div>
  )
}
