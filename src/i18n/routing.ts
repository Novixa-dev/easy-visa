import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  // At an unprefixed URL, use a remembered choice first, then the browser's
  // Accept-Language header. Arabic remains the safe fallback.
  localeDetection: true,
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
