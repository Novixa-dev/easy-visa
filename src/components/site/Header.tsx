import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { SiteSetting } from '@/payload-types'
import { waLink } from '@/lib/misc'
import { WhatsAppIcon } from '../icons'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileMenu } from './MobileMenu'
import { NavLink } from './NavLink'

export const NAV = [
  { href: '/services/visas', key: 'visas' },
  { href: '/services/travel', key: 'travel' },
  { href: '/trips', key: 'trips' },
  { href: '/offers', key: 'offers' },
  { href: '/track', key: 'track' },
  { href: '/contact', key: 'contact' },
] as const

/** Extra links that only appear in the phone menu. */
const MENU_EXTRA = [
  { href: '/my-requests', key: 'myRequests' },
  { href: '/about', key: 'about' },
  { href: '/faq', key: 'faq' },
] as const

export async function SiteHeader({ settings }: { settings: SiteSetting }) {
  const t = await getTranslations('nav')
  const tc = await getTranslations('common')
  const locale = await getLocale()
  const ann = settings.announcement

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/92 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      {ann?.enabled && ann.text && (
        <div className="bg-navy-900 text-center text-sm text-white">
          <div className="container-page py-2">
            {ann.link ? (
              <a href={ann.link} className="underline decoration-gold-400 underline-offset-4">
                {ann.text}
              </a>
            ) : (
              ann.text
            )}
          </div>
        </div>
      )}
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" className="shrink-0" aria-label="Easy Visa">
          <Image src="/brand/logo-horizontal.webp" alt="Easy Visa" width={466} height={120} priority className="h-10 w-auto lg:h-11" />
        </Link>

        <nav aria-label={t('menu')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.key}>
                <NavLink href={n.href}>{t(n.key)}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/my-requests" className="hidden min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy-800 hover:bg-navy-50 xl:inline-flex">
            {t('myRequests')}
          </Link>
          <LanguageSwitch label={t('switchLang')} ariaLabel={t('switchLangLabel')} />
          <a
            href={waLink(settings.primaryWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa hidden min-h-10 px-4 text-sm sm:inline-flex"
          >
            <WhatsAppIcon size={18} />
            {tc('whatsapp')}
          </a>
          <MobileMenu
            locale={locale}
            labels={{ menu: t('menu'), close: t('close') }}
            items={[...NAV, ...MENU_EXTRA].map((n) => ({ href: n.href, label: t(n.key) }))}
            whatsapp={waLink(settings.primaryWhatsapp)}
            whatsappLabel={tc('chatWhatsapp')}
          />
        </div>
      </div>
    </header>
  )
}
