import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { waLink } from '@/lib/misc'
import { BusIcon, ChecklistIcon, PassportIcon, WhatsAppIcon } from '../icons'

/** Thumb-reach actions on phones: services, trips, my requests, WhatsApp. */
export async function MobileActionBar({ whatsapp }: { whatsapp: string }) {
  const t = await getTranslations('nav')
  const tc = await getTranslations('common')
  const item = 'flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.75rem] font-medium text-navy-900 active:bg-navy-50'
  return (
    <nav aria-label={t('menu')} className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="flex h-[64px] items-stretch">
        <Link href="/services" className={item}>
          <PassportIcon size={22} />
          {tc('allServices')}
        </Link>
        <Link href="/trips" className={item}>
          <BusIcon size={22} />
          {t('trips')}
        </Link>
        <Link href="/my-requests" className={item}>
          <ChecklistIcon size={22} />
          {t('myRequests')}
        </Link>
        <a href={waLink(whatsapp)} target="_blank" rel="noopener noreferrer" className={`${item} text-wa`}>
          <WhatsAppIcon size={22} />
          {tc('whatsapp')}
        </a>
      </div>
    </nav>
  )
}
