'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import type { Company, Trip } from '@/payload-types'
import { tripAvailability } from '@/lib/trip-availability'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/misc'
import type { Locale } from '@/lib/constants'
import { BusIcon, KaabaIcon, PlaneIcon, GlobeIcon } from '../icons'

export const TRIP_ICON = { bus: BusIcon, flight: PlaneIcon, umrah: KaabaIcon, package: GlobeIcon } as const

export function AvailabilityBadge({ state, label }: { state: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        state === 'open' && 'bg-wa/10 text-wa',
        state === 'few' && 'bg-gold-100 text-gold-700',
        ['full', 'closed', 'departed'].includes(state) && 'bg-line text-muted',
      )}
    >
      <span className={cn('size-1.5 rounded-full', state === 'open' ? 'bg-wa' : state === 'few' ? 'bg-gold-500' : 'bg-muted')} aria-hidden />
      {label}
    </span>
  )
}

/** One departure, laid out like a ticket stub: date block, route, price, seats. */
export function TripCard({ trip }: { trip: Trip }) {
  const locale = useLocale() as Locale
  const t = useTranslations('trips')
  const a = tripAvailability(trip)
  const d = new Date(trip.departureAt)
  const tz = { timeZone: 'Asia/Aden' }
  const day = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', { day: 'numeric', ...tz }).format(d)
  const month = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE' : 'en-GB', { month: 'short', ...tz }).format(d)
  const weekday = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE' : 'en-GB', { weekday: 'long', ...tz }).format(d)
  const time = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', { hour: 'numeric', minute: '2-digit', ...tz }).format(d)
  const price = formatPrice(trip.price, locale)
  const company = typeof trip.company === 'object' ? (trip.company as Company | null) : null
  const Icon = TRIP_ICON[(trip.type ?? 'bus') as keyof typeof TRIP_ICON] ?? BusIcon
  const stateLabel = a.state === 'few' && a.seatsLeft != null && trip.showSeatsLeft !== false ? t('seatsLeft', { count: a.seatsLeft }) : t(a.state)
  const travelClass = trip.travelClass ?? 'normal'
  const classLabel = travelClass === 'vip' ? 'VIP' : travelClass === 'other' ? (locale === 'ar' ? 'أخرى' : 'Other') : locale === 'ar' ? 'عادي' : 'Normal'

  return (
    <article className={cn('group relative grid grid-cols-[4.5rem_1fr] overflow-hidden rounded-[var(--radius-ticket)] border border-line bg-white transition-colors hover:border-navy-700/35', a.state === 'full' && 'opacity-80')}>
      <div className="flex flex-col items-center justify-center border-e-2 border-dashed border-line bg-navy-50 py-4 text-center">
        <span className="ltr-nums font-display text-3xl leading-none font-bold text-navy-800">{day}</span>
        <span className="mt-1 text-sm font-semibold text-navy-900">{month}</span>
        <span className="mt-2 text-xs text-muted tabular-nums">{time}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <Icon size={16} className="text-gold-600" /> {weekday}
              {company && <span>· {company.name}</span>}
            </p>
            <span className={cn('mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold', travelClass === 'vip' ? 'bg-gold-100 text-gold-700' : 'bg-navy-50 text-navy-700')}>{classLabel}</span>
            <h3 className="mt-1 text-lg leading-snug font-semibold">
              <Link href={`/trips/${trip.slug}`} className="after:absolute after:inset-0">
                {trip.from} <span className="text-gold-600" aria-hidden>{locale === 'ar' ? '←' : '→'}</span>
                <span className="sr-only">{locale === 'ar' ? ' إلى ' : ' to '}</span> {trip.to}
              </Link>
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted">{trip.title}</p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          {price ? (
            trip.price?.mode === 'quote' ? (
              <p className="text-sm text-muted">{price}</p>
            ) : (
              <p className="font-display font-semibold text-navy-800">
                {price}
                <span className="ms-1 text-xs font-normal text-muted">{t('perPerson')}</span>
              </p>
            )
          ) : (
            <span />
          )}
          <AvailabilityBadge state={a.state} label={stateLabel} />
        </div>
      </div>
    </article>
  )
}
