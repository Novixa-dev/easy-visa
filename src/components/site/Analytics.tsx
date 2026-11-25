'use client'
import { useLocale } from 'next-intl'
import { useEffect, useRef } from 'react'
import { usePathname } from '@/i18n/routing'

/** Cookieless page-view ping. Respects Do Not Track / Global Privacy Control. */
export function Analytics() {
  const pathname = usePathname()
  const locale = useLocale()
  const last = useRef<string>('')

  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
    if (nav.doNotTrack === '1' || nav.globalPrivacyControl) return
    const path = `/${locale}${pathname === '/' ? '' : pathname}`
    if (last.current === path) return
    const referrer = last.current ? '' : document.referrer
    last.current = path
    const body = JSON.stringify({ path, locale, referrer })
    try {
      if (!navigator.sendBeacon?.('/api/page-views/hit', new Blob([body], { type: 'application/json' })))
        fetch('/api/page-views/hit', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
    } catch {}
  }, [pathname, locale])

  return null
}
