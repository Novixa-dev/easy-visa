import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { SuccessActions } from '@/components/request/SuccessActions'
import { CheckIcon } from '@/components/icons'
import { getService, getSettings, getTrip } from '@/lib/queries'
import { normalizeReference } from '@/lib/reference'
import { formatDate } from '@/lib/format'
import type { Locale } from '@/lib/constants'

export const metadata: Metadata = { robots: { index: false, follow: false } }

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ ref?: string; s?: string; t?: string }> }

export default async function SuccessPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const reference = normalizeReference(sp.ref ?? '')
  const t = await getTranslations('success')
  const tn = await getTranslations('nav')
  const [service, trip, settings] = await Promise.all([sp.s ? getService(locale, sp.s) : null, sp.t ? getTrip(locale, sp.t) : null, getSettings(locale)])

  if (!reference)
    return (
      <div className="container-page py-20 text-center">
        <Link href="/track" className="btn-primary">
          {tn('track')}
        </Link>
      </div>
    )

  const wa = service?.whatsappNumber || settings.primaryWhatsapp
  const template = settings.whatsappTemplates?.afterSubmit || t.raw('waMessage')

  return (
    <div className="bg-navy-50">
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-wa text-white">
              <CheckIcon size={30} />
            </span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl" tabIndex={-1}>
              {t('title')}
            </h1>
            <p className="mt-2 text-lg text-muted">{t('text')}</p>
          </div>

          {/* Boarding-pass receipt */}
          <div className="ticket-wrap">
          <section aria-label={t('refLabel')} className="ticket px-6 pt-6 pb-7 sm:px-8 [--notch-at:50%]">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-navy-900">Easy Visa</span>
              <span className="rounded-full bg-gold-100 px-3 py-1 text-sm font-semibold text-gold-700">{t('statusNew')}</span>
            </div>
            <p className="mt-6 text-sm text-muted">{t('refLabel')}</p>
            <p className="ltr-nums font-display text-3xl font-bold tracking-wider text-navy-800 sm:text-4xl">{reference}</p>
            <div className="ticket-tear" aria-hidden />
            <dl className="mt-14 grid grid-cols-2 gap-4 text-sm">
              {service && !trip && (
                <div className="col-span-2">
                  <dt className="text-muted">{t('service')}</dt>
                  <dd className="font-semibold text-navy-900">{service.title}</dd>
                </div>
              )}
              {trip && (
                <div className="col-span-2">
                  <dt className="text-muted">{t('tripLabel')}</dt>
                  <dd className="font-semibold text-navy-900">
                    {trip.title} · {formatDate(trip.departureAt, locale, true)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted">{t('date')}</dt>
                <dd className="font-semibold text-navy-900">{formatDate(new Date(), locale)}</dd>
              </div>
              <div>
                <dt className="text-muted">{t('status')}</dt>
                <dd className="font-semibold text-navy-900">{t('statusNew')}</dd>
              </div>
            </dl>
          </section>
          </div>

          <SuccessActions reference={reference} whatsapp={wa} template={template} serviceTitle={trip?.title ?? service?.title ?? ''} />
          <p className="no-print mt-3 text-center text-sm text-muted">
            {t('saved')}{' '}
            <Link href="/my-requests" className="font-semibold text-navy-700 underline decoration-gold-500 underline-offset-4">
              {tn('myRequests')}
            </Link>
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">{t('nextTitle')}</h2>
            <ol className="mt-4 space-y-4">
              {[t('next1'), t('next2'), t('next3')].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="ltr-nums inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}
