import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { TripExplorer } from '@/components/trips/TripExplorer'
import { getTrips } from '@/lib/queries'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'trips' })
  return pageMeta(locale, '/trips', t('title'), t('intro'))
}

export default async function TripsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('trips')
  const tn = await getTranslations('nav')
  const trips = await getTrips(locale, undefined, 300)

  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page py-10 sm:py-14">
        <TripExplorer trips={trips} locale={locale} />
      </div>
    </>
  )
}
