import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  // At an unprefixed URL, use a remembered choice first, then Arabic. The proxy (src/proxy.ts)
  // drops the browser's Accept-Language, so a first visit always opens in Arabic.
  localeDetection: true,
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
