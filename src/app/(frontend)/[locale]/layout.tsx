import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Arabic, Readex_Pro } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SiteHeader } from '@/components/site/Header'
import { SiteFooter } from '@/components/site/Footer'
import { MobileActionBar } from '@/components/site/MobileActionBar'
import { Analytics } from '@/components/site/Analytics'
import { getSettings } from '@/lib/queries'
import { siteUrl } from '@/lib/misc'
import type { Locale } from '@/lib/constants'
import '../styles.css'

const readex = Readex_Pro({ subsets: ['arabic', 'latin'], weight: ['500', '600', '700'], variable: '--font-readex', display: 'swap' })
const plex = IBM_Plex_Sans_Arabic({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600'], variable: '--font-plex', display: 'swap' })

// Pages render on first request and are then cached; content edits in the
// dashboard refresh them immediately (see hooks/revalidate.ts). No database
// access happens at build time, so the Docker image builds without one.
export const revalidate = 300

export const viewport: Viewport = { themeColor: '#0c2454', width: 'device-width', initialScale: 1 }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t('title'), template: `%s | Easy Visa` },
    description: t('description'),
    applicationName: 'Easy Visa',
    icons: { icon: '/favicon.ico', apple: '/brand/apple-icon.png' },
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'website',
      siteName: 'Easy Visa',
      locale: locale === 'ar' ? 'ar_YE' : 'en_US',
      images: [{ url: '/brand/og.jpg', width: 1200, height: 630 }],
    },
    alternates: { languages: { ar: '/ar', en: '/en', 'x-default': '/ar' } },
  }
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const settings = await getSettings(locale as Locale)
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${readex.variable} ${plex.variable}`}>
      <body className="flex min-h-dvh flex-col pb-[72px] md:pb-0">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
          {t('skip')}
        </a>
        <NextIntlClientProvider>
          <SiteHeader settings={settings} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter settings={settings} />
          <MobileActionBar whatsapp={settings.primaryWhatsapp} />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
