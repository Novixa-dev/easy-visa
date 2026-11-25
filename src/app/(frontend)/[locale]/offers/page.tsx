import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { OfferCard } from '@/components/site/OfferCard'
import { getOffers } from '@/lib/queries'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'offers' })
  return pageMeta(locale, '/offers', t('title'), t('intro'))
}

export default async function OffersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('offers')
  const tn = await getTranslations('nav')
  const { active, past } = await getOffers(locale)
  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page py-12 sm:py-16">
        <h2 className="text-2xl font-bold">{t('active')}</h2>
        {active.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        ) : (
          <p className="mt-4 max-w-xl text-muted">{t('none')}</p>
        )}
        {past.length > 0 && (
          <>
            <h2 className="mt-16 text-2xl font-bold">{t('past')}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((o) => (
                <OfferCard key={o.id} offer={o} past />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
