import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { PageHeader } from '@/components/site/PageHeader'
import { ContactForm } from '@/components/site/ContactForm'
import { FacebookIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '@/components/icons'
import { getSettings } from '@/lib/queries'
import { formatPhone } from '@/lib/phone'
import { waLink } from '@/lib/misc'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  return pageMeta(locale, '/contact', t('title'), t('intro'))
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')
  const tn = await getTranslations('nav')
  const tf = await getTranslations('contactForm')
  const s = await getSettings(locale)
  const block = 'rounded-[var(--radius-ticket)] border border-line p-6'
  return (
    <>
      <PageHeader title={t('title')} intro={t('intro')} crumbs={[{ href: '/', label: tn('home') }, { label: t('title') }]} />
      <div className="container-page grid gap-6 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr]">
        <section className={block}>
          <h2 className="text-xl font-semibold">{t('numbers')}</h2>
          <ul className="mt-5 space-y-5">
            {(s.contacts ?? []).map((c) => (
              <li key={c.id ?? c.phone} className="border-b border-line pb-5 last:border-0 last:pb-0">
                {c.label && <p className="mb-2 text-sm font-medium text-muted">{c.label}</p>}
                <p className="ltr-nums font-display text-2xl font-semibold text-navy-900">{formatPhone(c.phone)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.whatsapp && (
                    <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" className="btn-wa min-h-11">
                      <WhatsAppIcon /> WhatsApp
                    </a>
                  )}
                  {c.calls && (
                    <a href={`tel:${c.phone}`} className="btn-outline min-h-11">
                      <PhoneIcon /> {locale === 'ar' ? 'اتصال' : 'Call'}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid content-start gap-6">
          {(s.city || s.address) && (
            <section className={block}>
              <h2 className="text-xl font-semibold">{t('location')}</h2>
              <p className="mt-3 flex items-start gap-2 text-lg">
                <PinIcon className="mt-1 shrink-0 text-gold-600" />
                <span>
                  {s.city}
                  {s.address && <span className="block text-base text-muted">{s.address}</span>}
                </span>
              </p>
              {s.mapUrl && (
                <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-navy-700 underline decoration-gold-500 underline-offset-4">
                  Google Maps
                </a>
              )}
            </section>
          )}
          {s.hours && (
            <section className={block}>
              <h2 className="text-xl font-semibold">{t('hours')}</h2>
              <p className="mt-3 whitespace-pre-line">{s.hours}</p>
            </section>
          )}
          {s.email && (
            <section className={block}>
              <h2 className="text-xl font-semibold">{t('email')}</h2>
              <a href={`mailto:${s.email}`} className="ltr-nums mt-3 block text-lg text-navy-700 underline">
                {s.email}
              </a>
            </section>
          )}
          {(s.instagram || s.facebook) && (
            <section className={block}>
              <h2 className="text-xl font-semibold">{t('social')}</h2>
              <div className="mt-4 flex gap-2">
                {s.instagram && (
                  <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11">
                    <InstagramIcon /> Instagram
                  </a>
                )}
                {s.facebook && (
                  <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-11">
                    <FacebookIcon /> Facebook
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
        <section id="message" className="scroll-mt-24 rounded-[var(--radius-ticket)] border border-line p-6 sm:p-8 lg:col-span-2" aria-labelledby="form-title">
          <div className="mb-6 max-w-2xl">
            <h2 id="form-title" className="text-2xl font-semibold">
              {tf('title')}
            </h2>
            <p className="mt-2 text-muted">{tf('text')}</p>
          </div>
          <ContactForm />
          <p className="mt-6 text-sm text-muted">
            {t('formText')}{' '}
            <Link href="/request/travel-consultation" className="font-semibold text-navy-700 underline decoration-gold-500 underline-offset-4">
              {t('askCta')}
            </Link>
          </p>
        </section>
      </div>
    </>
  )
}
