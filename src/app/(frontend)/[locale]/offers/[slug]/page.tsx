import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Link } from '@/i18n/routing'
import { PageHeader } from '@/components/site/PageHeader'
import { CheckIcon, WhatsAppIcon } from '@/components/icons'
import { getOffer, getSettings } from '@/lib/queries'
import { formatDate, formatPrice } from '@/lib/format'
import { waLink } from '@/lib/misc'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'
import type { Media, Service } from '@/payload-types'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const o = await getOffer(locale, slug)
  if (!o) return {}
  return pageMeta(locale, `/offers/${slug}`, o.title, o.summary)
}

export default async function OfferPage({ params }: Params) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const offer = await getOffer(locale, slug)
  if (!offer || offer.state === 'scheduled') notFound()
  const t = await getTranslations('offers')
  const tc = await getTranslations('common')
  const tn = await getTranslations('nav')
  const settings = await getSettings(locale)
  const price = formatPrice(offer.price, locale)
  const img = typeof offer.image === 'object' ? (offer.image as Media | null) : null
  const service = typeof offer.service === 'object' ? (offer.service as Service | null) : null
  const expired = offer.state === 'expired'
  const waText = locale === 'ar' ? `مرحباً Easy Visa، أريد الاستفسار عن العرض: ${offer.title}` : `Hello Easy Visa, I would like to ask about the offer: ${offer.title}`

  return (
    <>
      <PageHeader title={offer.title} intro={offer.summary} crumbs={[{ href: '/', label: tn('home') }, { href: '/offers', label: t('title') }, { label: offer.title }]}>
        <p className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-gold-700 ring-1 ring-gold-500/30">
          {expired ? t('ended', { date: formatDate(offer.endDate!, locale) }) : offer.endDate ? t('validUntil', { date: formatDate(offer.endDate, locale) }) : ''}
        </p>
      </PageHeader>
      <div className="container-page grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {img?.url && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-ticket)]">
              <Image src={img.url} alt={img.alt ?? ''} fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" />
            </div>
          )}
          {offer.body && (
            <div className="prose-ev">
              <RichText data={offer.body} />
            </div>
          )}
          {offer.includes && offer.includes.length > 0 && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold">{t('includes')}</h2>
              <ul className="mt-4 space-y-3">
                {offer.includes.map((i) => (
                  <li key={i.id} className="flex gap-3">
                    <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                      <CheckIcon size={16} />
                    </span>
                    {i.item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {offer.terms && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">{t('terms')}</h2>
              <p className="mt-2 text-[0.95rem] leading-7 whitespace-pre-line text-muted">{offer.terms}</p>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-ticket)] border border-line p-6">
            {price && <p className="font-display text-2xl font-bold text-navy-800">{price}</p>}
            {offer.price?.indicative && offer.price.mode !== 'quote' && <p className="text-xs text-muted">{tc('priceNote')}</p>}
            <div className="mt-5 space-y-3">
              {!expired && service && (
                <Link href={`/request/${service.slug}`} className="btn-primary w-full">
                  {t('requestOffer')}
                </Link>
              )}
              <a href={waLink(settings.primaryWhatsapp, waText)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
                <WhatsAppIcon className="text-wa" /> {tc('chatWhatsapp')}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
