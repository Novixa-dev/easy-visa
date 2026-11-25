import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { DeparturesBoard } from '@/components/home/DeparturesBoard'
import { PageHeader } from '@/components/site/PageHeader'
import { getCategories, getServices } from '@/lib/queries'
import type { Locale } from '@/lib/constants'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'services' })
  return pageMeta(locale, '/services', t('title'), t('intro'))
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('services')
  const tn = await getTranslations('nav')
  const [services, categories] = await Promise.all([getServices(locale), getCategories(locale)])
  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page py-12 sm:py-16">
        <DeparturesBoard services={services} categories={categories} heading={false} />
      </div>
    </>
  )
}
