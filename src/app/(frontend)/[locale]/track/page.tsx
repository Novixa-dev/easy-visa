import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { TrackForm } from '@/components/track/TrackForm'
import { WhatsAppIcon } from '@/components/icons'
import { getSettings } from '@/lib/queries'
import { waLink } from '@/lib/misc'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'track' })
  return pageMeta(locale, '/track', t('title'), t('intro'))
}

export default async function TrackPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ ref?: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const { ref } = await searchParams
  const t = await getTranslations('track')
  const tc = await getTranslations('common')
  const tn = await getTranslations('nav')
  const settings = await getSettings(locale)
  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-lg">
          <TrackForm initialRef={typeof ref === 'string' ? ref.slice(0, 20) : undefined} />
          <div className="mt-10 rounded-xl border border-line p-5 text-center">
            <p className="text-muted">{t('help')}</p>
            <a href={waLink(settings.primaryWhatsapp)} target="_blank" rel="noopener noreferrer" className="btn-wa mt-4">
              <WhatsAppIcon /> {tc('chatWhatsapp')}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
