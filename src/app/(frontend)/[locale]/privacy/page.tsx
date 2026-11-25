import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { LegalView } from '@/components/site/LegalView'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'footer' })
  return pageMeta(locale, '/privacy', t('privacy'))
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LegalView locale={locale} which="privacy" />
}
