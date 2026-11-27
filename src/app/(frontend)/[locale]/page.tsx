import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { absoluteUrl, jsonLd, pageMeta } from '@/lib/seo'
import { Link } from '@/i18n/routing'
import { Hero } from '@/components/home/Hero'
import { DeparturesBoard } from '@/components/home/DeparturesBoard'
import { OfferCard } from '@/components/site/OfferCard'
import { PILLAR_ICON, WhatsAppIcon, PhoneIcon } from '@/components/icons'
import { getCategories, getHomepage, getOffers, getServices, getSettings, getTrips } from '@/lib/queries'
import { TripCard } from '@/components/trips/TripCard'
import { formatPhone } from '@/lib/phone'
import { waLink } from '@/lib/misc'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return { ...pageMeta(locale, '/', t('title'), t('description')), title: { absolute: t('title') } }
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const tt = await getTranslations('trips')
  const [home, settings, services, categories, offers, allTrips] = await Promise.all([
    getHomepage(locale),
    getSettings(locale),
    getServices(locale),
    getCategories(locale),
    getOffers(locale),
    getTrips(locale, undefined, 12),
  ])
  // Soonest departures that can still be booked; featured trips fill any gap.
  const bookable = allTrips.filter((x) => !x.manualFull && x.bookingOpen !== false)
  const trips = [...bookable.slice(0, 3), ...allTrips.filter((x) => x.featured && !bookable.slice(0, 3).includes(x))].slice(0, 3)

  const businessLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': absoluteUrl(`/${locale}/#organization`),
    name: 'Easy Visa',
    alternateName: 'إيزي فيزا',
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl('/brand/icon-512.png'),
    image: absoluteUrl('/brand/og.jpg'),
    telephone: settings.primaryWhatsapp,
    ...(settings.email ? { email: settings.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(settings.address ? { streetAddress: settings.address } : {}),
      addressLocality: settings.city || 'Mukalla',
      addressRegion: 'Hadhramaut',
      addressCountry: 'YE',
    },
    contactPoint: [{ '@type': 'ContactPoint', telephone: settings.primaryWhatsapp, contactType: 'customer service', availableLanguage: ['Arabic', 'English'] }],
    sameAs: [settings.instagram, settings.facebook, settings.tiktok, settings.snapchat].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(businessLd) }} />
      <Hero title={home.hero.title} subtitle={home.hero.subtitle} whatsapp={settings.primaryWhatsapp} city={t('eyebrowCity')} />

      {home.pillars && home.pillars.length > 0 && (
        <section aria-label={t('boardTitle')} className="border-b border-line bg-white">
          <ul className="container-page grid grid-cols-2 gap-px py-2 md:grid-cols-4">
            {home.pillars.map((p) => {
              const Icon = PILLAR_ICON[(p.icon ?? 'passport') as keyof typeof PILLAR_ICON]
              return (
                <li key={p.id} className="flex items-start gap-3 px-2 py-5 sm:px-4">
                  <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-500/50 text-gold-600">
                    <Icon size={22} />
                  </span>
                  <span>
                    <span className="block font-display font-semibold text-navy-900">{p.title}</span>
                    {p.text && <span className="mt-0.5 block text-sm leading-6 text-muted">{p.text}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="container-page py-16 sm:py-20">
        <DeparturesBoard services={services} categories={categories} />
      </section>

      {trips.length > 0 && (
        <section className="border-t border-line bg-navy-50">
          <div className="container-page py-16 sm:py-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">{t('tripsTitle')}</h2>
                <p className="mt-2 text-lg text-muted">{t('tripsText')}</p>
              </div>
              <Link href="/trips" className="font-semibold text-navy-700 underline decoration-gold-500 decoration-2 underline-offset-8 hover:text-navy-900">
                {tt('allTrips')}
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trips.slice(0, 3).map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        </section>
      )}

      {home.steps && home.steps.length > 0 && (
        <section className="bg-navy-900 text-white">
          <div className="container-page py-16 sm:py-20">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('stepsTitle')}</h2>
            <ol className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {home.steps.map((s, i) => (
                <li key={s.id} className="relative flex gap-4 lg:block">
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="ltr-nums inline-flex size-10 items-center justify-center rounded-full bg-gold-500 font-display text-lg font-bold text-navy-950">{i + 1}</span>
                    {i < home.steps!.length - 1 && <span aria-hidden className="hidden h-px flex-1 border-t-2 border-dashed border-white/20 lg:block" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white lg:mt-4">{s.title}</h3>
                    {s.text && <p className="mt-1 text-[0.95rem] leading-7 text-white/70">{s.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {offers.active.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">{t('offersTitle')}</h2>
            <Link href="/offers" className="font-semibold text-navy-700 underline decoration-gold-500 decoration-2 underline-offset-8 hover:text-navy-900">
              {t('offersAll')}
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.active.slice(0, 3).map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line bg-navy-50">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {home.promises && home.promises.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">{t('promisesTitle')}</h2>
              <dl className="mt-8 space-y-6">
                {home.promises.map((p) => (
                  <div key={p.id} className="border-s-[3px] border-gold-500 ps-5">
                    <dt className="font-display text-lg font-semibold text-navy-900">{p.title}</dt>
                    {p.text && <dd className="mt-1 text-[0.98rem] leading-7 text-muted">{p.text}</dd>}
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">{t('aboutTitle')}</h2>
            {home.aboutTeaser && <p className="mt-6 text-lg leading-9 text-ink/85">{home.aboutTeaser}</p>}
            <Link href="/about" className="btn-outline mt-6">
              {t('aboutMore')}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid items-center gap-8 rounded-[var(--radius-ticket)] bg-navy-800 p-8 text-white sm:p-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('contactTitle')}</h2>
            <p className="mt-3 max-w-[48ch] text-lg leading-8 text-white/75">{t('contactText')}</p>
          </div>
          <ul className="space-y-3">
            {(settings.contacts ?? []).map((c) => (
              <li key={c.id ?? c.phone} className="flex flex-wrap items-center gap-2">
                {c.whatsapp && (
                  <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" className="btn-wa min-h-12 flex-1">
                    <WhatsAppIcon />
                    <span className="ltr-nums">{formatPhone(c.phone)}</span>
                  </a>
                )}
                {c.calls && (
                  <a href={`tel:${c.phone}`} className="btn min-h-12 border border-white/25 px-4 text-white hover:bg-white/10" aria-label={`Call ${formatPhone(c.phone)}`}>
                    <PhoneIcon />
                  </a>
                )}
                {c.label && <span className="basis-full text-sm text-white/60">{c.label}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
