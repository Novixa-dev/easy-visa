import type { Metadata } from 'next'
import type { Locale } from './constants'

/** Canonical + hreflang alternates for a path that exists in both languages. */
export function alternates(locale: Locale, path: string) {
  const p = path === '/' ? '' : path
  return {
    canonical: `/${locale}${p}`,
    languages: { ar: `/ar${p}`, en: `/en${p}`, 'x-default': `/ar${p}` },
  }
}

/** Full page metadata: title, description, canonical/hreflang, Open Graph and Twitter card. */
export function pageMeta(locale: Locale, path: string, title: string, description?: string | null, image?: string | null): Metadata {
  const desc = description ?? undefined
  const images = [{ url: image || '/brand/og.jpg', width: image ? undefined : 1200, height: image ? undefined : 630, alt: title }]
  return {
    title,
    description: desc,
    alternates: alternates(locale, path),
    openGraph: {
      type: 'website',
      siteName: 'Easy Visa',
      title,
      description: desc,
      url: `/${locale}${path === '/' ? '' : path}`,
      locale: locale === 'ar' ? 'ar_YE' : 'en_US',
      alternateLocale: locale === 'ar' ? 'en_US' : 'ar_YE',
      images,
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: images.map((i) => i.url) },
  }
}
