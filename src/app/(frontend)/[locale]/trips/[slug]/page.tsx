import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { AvailabilityBadge, TRIP_ICON } from '@/components/trips/TripCard'
import { BookTripForm } from '@/components/trips/BookTripForm'
import { BusIcon, CheckIcon, WhatsAppIcon } from '@/components/icons'
import { tripAvailability } from '@/collections/Trips'
import { getSettings, getTrip } from '@/lib/queries'
import { formatDate, formatMoney, formatPrice } from '@/lib/format'
import { siteUrl, waLink } from '@/lib/misc'
import { pageMeta } from '@/lib/seo'
import type { Currency, Locale } from '@/lib/constants'
import type { Company, Media } from '@/payload-types'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const trip = await getTrip(locale, slug)
  if (!trip) return {}
  const img = typeof trip.image === 'object' ? (trip.image as Media | null) : null
  return pageMeta(locale, `/trips/${slug}`, trip.title, `${trip.from} – ${trip.to} · ${formatDate(trip.departureAt, locale, true)}`, img?.sizes?.card?.url || img?.url)
}

export default async function TripPage({ params }: Params) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const trip = await getTrip(locale, slug)
  if (!trip) notFound()
  const t = await getTranslations('trips')
  const tn = await getTranslations('nav')
  const tc = await getTranslations('common')
  const ts = await getTranslations('services')
  const settings = await getSettings(locale)
  const a = tripAvailability(trip)
  const company = typeof trip.company === 'object' ? (trip.company as Company | null) : null
  const img = typeof trip.image === 'object' ? (trip.image as Media | null) : null
  const price = formatPrice(trip.price, locale)
  const unit = trip.price?.mode && ['fixed', 'from'].includes(trip.price.mode) ? (trip.price.amount ?? null) : null
  const currency = (trip.price?.currency ?? 'SAR') as Currency
  const Icon = TRIP_ICON[(trip.type ?? 'bus') as keyof typeof TRIP_ICON] ?? BusIcon
  const canBook = a.state === 'open' || a.state === 'few'
  const maxSeats = Math.max(1, Math.min(trip.maxSeatsPerBooking ?? 10, a.seatsLeft ?? 99))
  const waText = locale === 'ar' ? `مرحباً Easy Visa، أريد الاستفسار عن رحلة: ${trip.title} (${formatDate(trip.departureAt, locale)})` : `Hello Easy Visa, I have a question about the trip: ${trip.title} (${formatDate(trip.departureAt, locale)})`
  const stateLabel = a.state === 'few' && a.seatsLeft != null && trip.showSeatsLeft !== false ? t('seatsLeft', { count: a.seatsLeft }) : t(a.state)

  const ld = {
    '@context': 'https://schema.org',
    '@type': trip.type === 'flight' ? 'Flight' : 'Trip',
    name: trip.title,
    url: `${siteUrl()}/${locale}/trips/${trip.slug}`,
    ...(trip.type === 'flight' ? { departureTime: trip.departureAt } : { departureTime: trip.departureAt, arrivalTime: trip.returnAt ?? undefined }),
    provider: company ? { '@type': 'Organization', name: company.name } : undefined,
    offers: unit
      ? { '@type': 'Offer', price: unit, priceCurrency: currency, availability: canBook ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut' }
      : undefined,
  }

  const row = (label: string, value?: string | null) =>
    value ? (
      <div className="flex justify-between gap-4 border-b border-line py-3 last:border-0">
        <dt className="text-muted">{label}</dt>
        <dd className="text-end font-semibold text-navy-900">{value}</dd>
      </div>
    ) : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHeader title={`${trip.from} ${locale === 'ar' ? '←' : '→'} ${trip.to}`} intro={trip.title} crumbs={[{ href: '/', label: tn('home') }, { href: '/trips', label: t('title') }, { label: trip.title }]}>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AvailabilityBadge state={a.state} label={stateLabel} />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Icon size={18} className="text-gold-600" /> {t(trip.type ?? 'bus')}
          </span>
        </div>
        {canBook && (
          <a href="#book" className="btn-primary mt-5 w-full lg:hidden">
            {t('book')}
          </a>
        )}
      </PageHeader>
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {img?.url && (
            <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-[var(--radius-ticket)] bg-navy-50">
              <Image src={img.sizes?.card?.url || img.url} alt={img.alt ?? ''} fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" priority />
            </div>
          )}
          <dl className="rounded-[var(--radius-ticket)] border border-line px-5">
            {row(t('departure'), formatDate(trip.departureAt, locale, true))}
            {row(t('return'), trip.returnAt ? formatDate(trip.returnAt, locale, true) : null)}
            {row(t('duration'), trip.duration)}
            {row(t('meeting'), trip.meetingPoint)}
            {row(t('company'), company?.name)}
            {row(ts('price'), price ? `${price}${trip.price?.mode !== 'quote' ? ` · ${t('perPerson')}` : ''}` : null)}
            {row(t('child'), trip.childPrice ? formatMoney(trip.childPrice, currency, locale) : null)}
          </dl>
          {trip.features && trip.features.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">{t('features')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {trip.features.map((f) => (
                  <li key={f.id} className="flex gap-3">
                    <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                      <CheckIcon size={16} />
                    </span>
                    {f.item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {trip.details && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">{t('details')}</h2>
              <p className="prose-ev mt-3 whitespace-pre-line">{trip.details}</p>
            </section>
          )}
          {company?.description && <p className="mt-10 text-sm leading-6 text-muted">{company.description}</p>}
        </div>

        <aside className="ticket-wrap scroll-mt-24 lg:sticky lg:top-24 lg:self-start" id="book">
          <div className="ticket p-6 [--notch-at:16%]">
            <h2 className="text-xl font-semibold">{t('bookTitle')}</h2>
            {price && <p className="mt-1 font-display text-2xl font-bold text-navy-800">{price}</p>}
            <div className="ticket-tear" aria-hidden />
            <div className="mt-10">
              {canBook ? (
                <BookTripForm tripSlug={trip.slug} tripTitle={trip.title} maxSeats={maxSeats} unitPrice={unit} currency={currency} />
              ) : (
                <p className="rounded-lg bg-navy-50 p-4 text-sm leading-6 text-navy-900">{a.state === 'departed' ? t('departedText') : t('fullText')}</p>
              )}
              <a href={waLink(settings.primaryWhatsapp, waText)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3 w-full">
                <WhatsAppIcon className="text-wa" /> {tc('chatWhatsapp')}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
