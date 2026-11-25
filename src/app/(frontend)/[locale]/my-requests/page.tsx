import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { MyRequests } from '@/components/track/MyRequests'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'my' })
  return { title: t('title'), robots: { index: false, follow: true } }
}

export default async function MyRequestsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('my')
  const tn = await getTranslations('nav')
  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <MyRequests />
        </div>
      </div>
    </>
  )
}
