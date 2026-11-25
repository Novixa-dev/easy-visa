import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { PageHeader } from '@/components/site/PageHeader'
import { TripCard } from '@/components/trips/TripCard'
import { WhatsAppIcon } from '@/components/icons'
import { getSettings, getTrips } from '@/lib/queries'
import { cn, waLink } from '@/lib/misc'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

const TYPES = ['bus', 'flight', 'umrah', 'package'] as const

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'trips' })
  return pageMeta(locale, '/trips', t('title'), t('intro'))
}

export default async function TripsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ type?: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { type } = await searchParams
  const active = TYPES.includes(type as (typeof TYPES)[number]) ? type : undefined
  const t = await getTranslations('trips')
  const tn = await getTranslations('nav')
  const tc = await getTranslations('common')
  const [trips, all, settings] = await Promise.all([getTrips(locale, active), getTrips(locale), getSettings(locale)])
  const present = new Set(all.map((x) => x.type))

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page py-10 sm:py-14">
        <nav aria-label={t('filter')} className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none]">
          <ul className="flex w-max gap-2">
            {[undefined, ...TYPES.filter((x) => present.has(x))].map((k) => (
              <li key={k ?? 'all'}>
                <Link
                  href={k ? { pathname: '/trips', query: { type: k } } : '/trips'}
                  aria-current={active === k ? 'page' : undefined}
                  scroll={false}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
                    active === k ? 'border-navy-800 bg-navy-800 text-white' : 'border-line bg-white text-navy-900 hover:border-navy-700/40',
                  )}
                >
                  {k ? t(k) : t('all')}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {trips.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md py-10 text-center">
            <p className="text-lg text-muted">{t('none')}</p>
            <a href={waLink(settings.primaryWhatsapp)} target="_blank" rel="noopener noreferrer" className="btn-wa mt-6">
              <WhatsAppIcon /> {tc('chatWhatsapp')}
            </a>
          </div>
        )}
      </div>
    </>
  )
}
