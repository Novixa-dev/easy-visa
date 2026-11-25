import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { getFaqs } from '@/lib/queries'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return pageMeta(locale, '/faq', t('faq'))
}

export default async function FaqPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const tn = await getTranslations('nav')
  const faqs = await getFaqs(locale)
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHeader title={tn('faq')} crumbs={[{ href: '/', label: tn('home') }, { label: tn('faq') }]} />
      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.id} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-navy-900">
                {f.question}
                <span aria-hidden className="text-2xl text-gold-600 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[65ch] leading-8 text-ink/85">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}
