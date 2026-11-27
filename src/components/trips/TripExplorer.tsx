'use client'

import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { Company, Destination, Service, Trip } from '@/payload-types'
import { tripAvailability } from '@/lib/trip-availability'
import { TripCard } from './TripCard'

type Locale = 'ar' | 'en'
type Filters = { query: string; country: string; type: string; travelClass: string; company: string; service: string; from: string; to: string; availability: string; sort: string }

const EMPTY: Filters = { query: '', country: '', type: '', travelClass: '', company: '', service: '', from: '', to: '', availability: '', sort: 'departure' }
const TYPES = ['bus', 'flight', 'umrah', 'package'] as const
const CLASSES = ['normal', 'vip', 'other'] as const
const STORAGE_KEY = 'easy-visa:trip-filters:v1'

const copy = {
  ar: {
    search: 'ابحث باسم الرحلة أو المدينة أو الشركة', filters: 'تصفية وفرز', clear: 'مسح الفلاتر', results: 'رحلة مطابقة',
    country: 'كل البلدان', type: 'كل الأنواع', class: 'كل الفئات', company: 'كل الشركات', service: 'كل الخدمات', from: 'من أي مدينة', to: 'إلى أي مدينة', availability: 'كل حالات الحجز',
    departure: 'الأقرب موعداً', priceLow: 'السعر: الأقل أولاً', priceHigh: 'السعر: الأعلى أولاً', seats: 'الأكثر مقاعد متاحة',
    normal: 'عادي', vip: 'VIP', other: 'أخرى', open: 'متاح للحجز', few: 'مقاعد قليلة', full: 'مكتملة', closed: 'الحجز مغلق',
    bus: 'باصات', flight: 'طيران', umrah: 'باقات عمرة', package: 'باقات سياحية', noResults: 'لم نجد رحلة بهذه المواصفات.', resetHint: 'جرّب إزالة بعض الفلاتر أو البحث باسم مختلف.',
  },
  en: {
    search: 'Search by trip, city or company', filters: 'Filter & sort', clear: 'Clear filters', results: 'matching trips',
    country: 'All countries', type: 'All types', class: 'All classes', company: 'All companies', service: 'All services', from: 'Any departure city', to: 'Any destination city', availability: 'Any booking status',
    departure: 'Soonest departure', priceLow: 'Price: low to high', priceHigh: 'Price: high to low', seats: 'Most seats available',
    normal: 'Normal', vip: 'VIP', other: 'Other', open: 'Open for booking', few: 'Few seats left', full: 'Full', closed: 'Booking closed',
    bus: 'Buses', flight: 'Flights', umrah: 'Umrah packages', package: 'Holiday packages', noResults: 'No trips match these filters.', resetHint: 'Try clearing a filter or searching for another term.',
  },
} as const

function relatedName(value: number | Company | Service | Destination | null | undefined): string {
  if (!value || typeof value !== 'object') return ''
  return 'name' in value ? value.name : value.title
}

function priceAmount(trip: Trip): number | null {
  return trip.price?.mode && ['fixed', 'from', 'range'].includes(trip.price.mode) && trip.price.amount != null ? trip.price.amount : null
}

export function TripExplorer({ trips, locale }: { trips: Trip[]; locale: Locale }) {
  const t = copy[locale]
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const deferredQuery = useDeferredValue(filters.query.trim().toLocaleLowerCase(locale))
  const hasFilters = Object.entries(filters).some(([key, value]) => key !== 'sort' && Boolean(value))

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setFilters({ ...EMPTY, ...JSON.parse(saved) })
    } catch {
      // Filtering remains fully functional when local storage is unavailable.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && !(key === 'sort' && value === 'departure')) params.set(key, value)
      })
      window.history.replaceState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`)
    } catch {}
  }, [filters])

  const options = useMemo(() => {
    const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, locale))
    return {
      countries: unique(trips.flatMap((trip) => [relatedName(trip.fromCountry), relatedName(trip.toCountry)])),
      companies: unique(trips.map((trip) => relatedName(trip.company))),
      services: unique(trips.map((trip) => relatedName(trip.service))),
      from: unique(trips.map((trip) => trip.from)),
      to: unique(trips.map((trip) => trip.to)),
      types: TYPES.filter((type) => trips.some((trip) => trip.type === type)),
      classes: CLASSES.filter((travelClass) => trips.some((trip) => (trip.travelClass ?? 'normal') === travelClass)),
    }
  }, [locale, trips])

  const results = useMemo(() => {
    const matches = trips.filter((trip) => {
      const availability = tripAvailability(trip)
      const company = relatedName(trip.company)
      const service = relatedName(trip.service)
      const countries = [relatedName(trip.fromCountry), relatedName(trip.toCountry)]
      const searchText = [trip.title, trip.from, trip.to, company, service, ...countries].join(' ').toLocaleLowerCase(locale)
      return (
        (!deferredQuery || searchText.includes(deferredQuery)) &&
        (!filters.country || countries.includes(filters.country)) &&
        (!filters.type || trip.type === filters.type) &&
        (!filters.travelClass || (trip.travelClass ?? 'normal') === filters.travelClass) &&
        (!filters.company || company === filters.company) &&
        (!filters.service || service === filters.service) &&
        (!filters.from || trip.from === filters.from) &&
        (!filters.to || trip.to === filters.to) &&
        (!filters.availability || availability.state === filters.availability)
      )
    })
    return [...matches].sort((a, b) => {
      if (filters.sort === 'price-low') return (priceAmount(a) ?? Number.POSITIVE_INFINITY) - (priceAmount(b) ?? Number.POSITIVE_INFINITY)
      if (filters.sort === 'price-high') return (priceAmount(b) ?? -1) - (priceAmount(a) ?? -1)
      if (filters.sort === 'seats') return (tripAvailability(b).seatsLeft ?? Number.POSITIVE_INFINITY) - (tripAvailability(a).seatsLeft ?? Number.POSITIVE_INFINITY)
      return new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime()
    })
  }, [deferredQuery, filters, locale, trips])

  const update = (key: keyof Filters) => (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setFilters((current) => ({ ...current, [key]: event.target.value }))
  const select = (key: keyof Filters, label: string, values: readonly string[] | string[]) => (
    <label className="block text-sm font-medium text-navy-900">
      <span className="sr-only">{label}</span>
      <select value={filters[key]} onChange={update(key)} className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-navy-700 focus:ring-4 focus:ring-navy-100">
        <option value="">{label}</option>
        {values.map((value) => <option key={value} value={value}>{(['bus', 'flight', 'umrah', 'package', 'normal', 'vip', 'other', 'open', 'few', 'full', 'closed'] as string[]).includes(value) ? t[value as keyof typeof t] : value}</option>)}
      </select>
    </label>
  )

  return (
    <div>
      <div className="rounded-[var(--radius-ticket)] border border-line bg-navy-50/70 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">{t.search}</span>
            <SearchIcon className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={19} aria-hidden />
            <input value={filters.query} onChange={update('query')} placeholder={t.search} type="search" className="min-h-12 w-full rounded-xl border border-line bg-white py-2 pe-4 ps-10 text-base outline-none transition placeholder:text-muted focus:border-navy-700 focus:ring-4 focus:ring-navy-100" />
          </label>
          <label className="block sm:w-56">
            <span className="sr-only">{t.departure}</span>
            <select value={filters.sort} onChange={update('sort')} className="min-h-12 w-full rounded-xl border border-line bg-white px-3 text-sm font-medium text-navy-900 outline-none focus:border-navy-700 focus:ring-4 focus:ring-navy-100">
              <option value="departure">{t.departure}</option><option value="price-low">{t.priceLow}</option><option value="price-high">{t.priceHigh}</option><option value="seats">{t.seats}</option>
            </select>
          </label>
        </div>
        <details className="group mt-3" open>
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-lg px-1 text-sm font-semibold text-navy-800">
            <span className="inline-flex items-center gap-2"><SlidersHorizontalIcon size={17} aria-hidden />{t.filters}</span>
            <span className="text-xs text-muted group-open:hidden">+</span>
          </summary>
          <div className="grid gap-2 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {select('country', t.country, options.countries)} {select('type', t.type, options.types)} {select('travelClass', t.class, options.classes)} {select('company', t.company, options.companies)}
            {select('service', t.service, options.services)} {select('from', t.from, options.from)} {select('to', t.to, options.to)} {select('availability', t.availability, ['open', 'few', 'full', 'closed'])}
          </div>
        </details>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted"><span className="ltr-nums text-navy-900">{results.length}</span> {t.results}</p>
        {hasFilters && <button type="button" onClick={() => setFilters(EMPTY)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy-800 hover:bg-navy-50"><XIcon size={16} aria-hidden />{t.clear}</button>}
      </div>

      {results.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{results.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div> : <div className="mx-auto max-w-md py-14 text-center"><p className="text-lg font-semibold text-navy-900">{t.noResults}</p><p className="mt-2 text-muted">{t.resetHint}</p>{hasFilters && <button type="button" onClick={() => setFilters(EMPTY)} className="btn-outline mt-6">{t.clear}</button>}</div>}
    </div>
  )
}
