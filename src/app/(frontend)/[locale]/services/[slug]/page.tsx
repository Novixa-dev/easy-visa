import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Link } from '@/i18n/routing'
import { DeparturesBoard } from '@/components/home/DeparturesBoard'
import { PageHeader } from '@/components/site/PageHeader'
import { CheckIcon, ServiceIcon, WhatsAppIcon } from '@/components/icons'
import { getCategories, getService, getServices, getSettings } from '@/lib/queries'
import { formatPrice } from '@/lib/format'
import { waLink } from '@/lib/misc'
import { jsonLd, pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'
import type { Media, Service, ServiceCategory } from '@/payload-types'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const cat = (await getCategories(locale)).find((c) => c.slug === slug)
  if (cat) return pageMeta(locale, `/services/${slug}`, cat.seo?.title || cat.title, cat.seo?.description || cat.intro || undefined)
  const s = await getService(locale, slug)
  if (!s) return {}
  const img = typeof s.image === 'object' ? (s.image as Media | null) : null
  return pageMeta(locale, `/services/${slug}`, s.seo?.title || s.title, s.seo?.description || s.summary, img?.sizes?.card?.url || img?.url)
}

export default async function ServiceOrCategory({ params }: Params) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const categories = await getCategories(locale)
  const cat = categories.find((c) => c.slug === slug)
  if (cat) return <CategoryView locale={locale} category={cat} categories={categories} />
  const service = await getService(locale, slug)
  if (!service) notFound()
  return <ServiceView locale={locale} service={service} />
}

async function CategoryView({ locale, category, categories }: { locale: Locale; category: ServiceCategory; categories: ServiceCategory[] }) {
  const t = await getTranslations('services')
  const tn = await getTranslations('nav')
  const services = await getServices(locale, category.slug)
  return (
    <>
      <PageHeader title={category.title} intro={category.intro} crumbs={[{ href: '/', label: tn('home') }, { href: '/services', label: t('title') }, { label: category.title }]} />
      <div className="container-page py-12 sm:py-16">
        {services.length ? <DeparturesBoard services={services} categories={categories.filter((c) => c.id === category.id)} heading={false} /> : <p className="text-muted">{t('empty')}</p>}
      </div>
    </>
  )
}

async function ServiceView({ locale, service }: { locale: Locale; service: Service }) {
  const t = await getTranslations('services')
  const tc = await getTranslations('common')
  const tn = await getTranslations('nav')
  const settings = await getSettings(locale)
  const cat = typeof service.category === 'object' ? (service.category as ServiceCategory) : null
  const price = formatPrice(service.price, locale)
  const wa = service.whatsappNumber || settings.primaryWhatsapp
  const waText = locale === 'ar' ? `مرحباً Easy Visa، أريد الاستفسار عن خدمة: ${service.title}` : `Hello Easy Visa, I have a question about: ${service.title}`
  const img = typeof service.image === 'object' ? (service.image as Media | null) : null
  const related = (service.related ?? []).filter((r): r is Service => typeof r === 'object' && r?.status === 'published')

  const faqLd = service.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }
    : null

  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqLd) }} />}
      <PageHeader
        title={service.title}
        intro={service.summary}
        crumbs={[{ href: '/', label: tn('home') }, ...(cat ? [{ href: `/services/${cat.slug}`, label: cat.title }] : []), { label: service.title }]}
      >
        {/* Phones: act immediately instead of scrolling past the details */}
        <div className="mt-6 flex gap-2 lg:hidden">
          {service.available !== false && (
            <Link href={`/request/${service.slug}`} className="btn-primary flex-1">
              {tc('request')}
            </Link>
          )}
          <a href={waLink(wa, waText)} target="_blank" rel="noopener noreferrer" className="btn-outline px-4" aria-label={tc('chatWhatsapp')}>
            <WhatsAppIcon className="text-wa" />
          </a>
        </div>
      </PageHeader>
      <div className="container-page grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          {img?.url && (
            <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-[var(--radius-ticket)] bg-navy-50">
              <Image src={img.sizes?.card?.url || img.url} alt={img.alt ?? ''} fill sizes="(min-width:1024px) 700px, 100vw" className="object-cover" priority />
            </div>
          )}
          {service.body && (
            <div className="prose-ev">
              <RichText data={service.body} />
            </div>
          )}

          {service.audience && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">{t('forWho')}</h2>
              <p className="prose-ev mt-3">{service.audience}</p>
            </section>
          )}

          {service.requirements && service.requirements.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">{t('requirements')}</h2>
              <ul className="mt-4 space-y-3">
                {service.requirements.map((r) => (
                  <li key={r.id} className="flex gap-3">
                    <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                      <CheckIcon size={16} />
                    </span>
                    <span>
                      <span className="font-medium text-navy-900">{r.item}</span>
                      {r.note && <span className="block text-sm text-muted">{r.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">{t('requirementsNote')}</p>
            </section>
          )}

          {service.notes && (
            <section className="mt-10 rounded-xl border border-gold-500/30 bg-gold-50 p-5">
              <h2 className="text-lg font-semibold">{t('notes')}</h2>
              <p className="mt-2 leading-7">{service.notes}</p>
            </section>
          )}

          {service.faqs && service.faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold">{t('faq')}</h2>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {service.faqs.map((f) => (
                  <details key={f.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy-900">
                      {f.question}
                      <span aria-hidden className="text-xl text-gold-600 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 leading-7 text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <p className="mt-10 text-sm leading-6 text-muted">{t('disclaimer')}</p>
        </article>

        <aside className="ticket-wrap lg:sticky lg:top-24 lg:self-start">
          <div className="ticket p-6 [--notch-at:58%]">
            <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
              <ServiceIcon name={service.icon} size={28} />
            </span>
            <h2 className="mt-4 text-xl font-semibold">{t('requestTitle')}</h2>
            <p className="mt-1 text-[0.95rem] leading-7 text-muted">{t('requestText')}</p>
            {price && (
              <div className="mt-4">
                <p className="text-sm text-muted">{t('price')}</p>
                <p className="font-display text-2xl font-bold text-navy-800">{price}</p>
                {service.price?.indicative && service.price.mode !== 'quote' && <p className="text-xs text-muted">{tc('priceNote')}</p>}
              </div>
            )}
            <div className="ticket-tear" aria-hidden />
            <div className="mt-14 space-y-3">
              {service.available === false ? (
                <p className="rounded-lg bg-navy-50 p-3 text-sm font-medium text-navy-900">{service.unavailableNote || tc('unavailable')}</p>
              ) : (
                <Link href={`/request/${service.slug}`} className="btn-primary w-full">
                  {tc('request')}
                </Link>
              )}
              <a href={waLink(wa, waText)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
                <WhatsAppIcon className="text-wa" /> {tc('chatWhatsapp')}
              </a>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-navy-50">
          <div className="container-page py-12">
            <h2 className="text-2xl font-semibold">{t('related')}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/services/${r.slug}`} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-line hover:ring-navy-700/30">
                    <ServiceIcon name={r.icon} className="text-navy-800" />
                    <span className="font-semibold text-navy-900">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
