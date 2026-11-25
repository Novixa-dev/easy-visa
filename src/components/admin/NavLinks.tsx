'use client'
import { useAuth, useTranslation } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Extra links at the top of the admin sidebar. */
export function NavLinks() {
  const { user } = useAuth<{ role?: string }>()
  const { i18n } = useTranslation()
  const pathname = usePathname()
  const ar = i18n.language !== 'en'
  if (!user) return null
  const links = [
    { href: '/admin', label: ar ? 'لوحة المتابعة' : 'Overview' },
    ...(user.role === 'owner' ? [{ href: '/admin/reports', label: ar ? 'التقارير' : 'Reports' }] : []),
    { href: '/admin/collections/requests?where[status][equals]=new', label: ar ? 'الطلبات الجديدة' : 'New requests' },
  ]
  return (
    <div className="ev-navlinks">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`ev-navlink${pathname === l.href.split('?')[0] && !l.href.includes('?') ? ' is-active' : ''}`}>
          {l.label}
        </Link>
      ))}
    </div>
  )
}
