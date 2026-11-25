import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/site/PageHeader'
import { RequestWizard } from '@/components/request/RequestWizard'
import { WhatsAppIcon } from '@/components/icons'
import { getDestinations, getService, getSettings } from '@/lib/queries'
import { waLink } from '@/lib/misc'
import type { Locale } from '@/lib/constants'
import type { DocumentSlotDef, FormFieldDef } from '@/lib/form-schema'

type Params = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const s = await getService(locale, slug)
  const t = await getTranslations({ locale, namespace: 'request' })
  // Form pages are not useful search results; the service page is.
  return { title: s ? t('title', { service: s.title }) : undefined, robots: { index: false, follow: true } }
}

export default async function RequestPage({ params }: Params) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const [service, destinations, settings] = await Promise.all([getService(locale, slug), getDestinations(locale), getSettings(locale)])
  if (!service) notFound()
  const t = await getTranslations('request')
  const tc = await getTranslations('common')
  const tn = await getTranslations('nav')

  const fields: FormFieldDef[] = (service.formFields ?? []).map((f) => ({
    name: f.name,
    type: f.type as FormFieldDef['type'],
    label: f.label,
    placeholder: f.placeholder,
    help: f.help,
    required: f.required,
    width: f.width,
    min: f.min,
    max: f.max,
    options: f.options?.map((o) => ({ value: o.value, label: o.label })) ?? null,
    showWhen: f.showWhen,
    showHijri: f.showHijri,
    futureOnly: f.futureOnly,
    afterField: f.afterField,
  }))
  const slots: DocumentSlotDef[] = (service.documentSlots ?? []).map((s) => ({ key: s.key, label: s.label, help: s.help, required: s.required }))

  return (
    <>
      <PageHeader
        title={t('title', { service: service.title })}
        intro={t('intro')}
        crumbs={[{ href: '/', label: tn('home') }, { href: `/services/${service.slug}`, label: service.title }, { label: t('stepReview') }]}
      />
      <div className="container-page py-10 sm:py-14">
        {service.available === false ? (
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold">{t('unavailableTitle')}</h2>
            <p className="mt-3 text-muted">{service.unavailableNote || t('unavailableText')}</p>
            <a href={waLink(service.whatsappNumber || settings.primaryWhatsapp)} target="_blank" rel="noopener noreferrer" className="btn-wa mt-6">
              <WhatsAppIcon /> {tc('chatWhatsapp')}
            </a>
          </div>
        ) : (
          <RequestWizard
            serviceSlug={service.slug}
            serviceTitle={service.title}
            fields={fields}
            slots={slots}
            destinations={destinations}
            consentText={settings.consentText}
          />
        )}
      </div>
    </>
  )
}
