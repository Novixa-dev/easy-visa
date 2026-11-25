import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { SiteSetting } from '@/payload-types'
import { getServices } from '@/lib/queries'
import { formatPhone } from '@/lib/phone'
import { waLink } from '@/lib/misc'
import type { Locale } from '@/lib/constants'
import { FacebookIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../icons'

export async function SiteFooter({ settings }: { settings: SiteSetting }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('footer')
  const tn = await getTranslations('nav')
  const services = await getServices(locale)
  const year = new Date().getFullYear()
  const head = 'mb-4 font-display text-base font-semibold text-gold-400'
  const link = 'text-white/75 transition-colors hover:text-white'

  return (
    <footer className="mt-auto bg-navy-950 text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-horizontal-light.webp" alt="Easy Visa" width={466} height={120} className="h-11 w-auto" />
          {settings.footerAbout && <p className="mt-5 max-w-sm text-[0.95rem] leading-7 text-white/70">{settings.footerAbout}</p>}
          {settings.tagline && <p className="mt-4 font-display text-lg text-gold-400">{settings.tagline}</p>}
        </div>
        <div>
          <h2 className={head}>{t('services')}</h2>
          <ul className="space-y-2.5 text-[0.95rem]">
            {services.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link href={`/services/${s.slug}`} className={link}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={head}>{t('company')}</h2>
          <ul className="space-y-2.5 text-[0.95rem]">
            {(
              [
                ['/trips', 'trips'],
                ['/offers', 'offers'],
                ['/track', 'track'],
                ['/my-requests', 'myRequests'],
                ['/about', 'about'],
                ['/faq', 'faq'],
                ['/contact', 'contact'],
              ] as const
            ).map(([href, k]) => (
              <li key={k}>
                <Link href={href} className={link}>
                  {tn(k)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={head}>{t('contact')}</h2>
          <ul className="space-y-3 text-[0.95rem]">
            {(settings.contacts ?? []).map((c) => (
              <li key={c.id ?? c.phone}>
                <a href={c.whatsapp ? waLink(c.phone) : `tel:${c.phone}`} className={`${link} flex items-center gap-2`} target={c.whatsapp ? '_blank' : undefined} rel="noopener noreferrer">
                  {c.whatsapp ? <WhatsAppIcon size={17} /> : <PhoneIcon size={17} />}
                  <span className="ltr-nums">{formatPhone(c.phone)}</span>
                  {c.label && <span className="text-white/45">· {c.label}</span>}
                </a>
              </li>
            ))}
            {settings.city && (
              <li className="flex items-center gap-2 text-white/75">
                <PinIcon size={17} /> {settings.city}
              </li>
            )}
          </ul>
          <div className="mt-5 flex gap-2">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex size-10 items-center justify-center rounded-lg bg-white/8 hover:bg-white/15">
                <InstagramIcon size={20} />
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex size-10 items-center justify-center rounded-lg bg-white/8 hover:bg-white/15">
                <FacebookIcon size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('rights', { year })}</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              {t('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-white">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
