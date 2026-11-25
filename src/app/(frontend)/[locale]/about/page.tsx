import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { PageHeader } from '@/components/site/PageHeader'
import { getAbout } from '@/lib/queries'
import { pageMeta } from '@/lib/seo'
import type { Locale } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const a = await getAbout(locale)
  return pageMeta(locale, '/about', a.title, a.intro ?? undefined)
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const about = await getAbout(locale)
  const tn = await getTranslations('nav')
  const th = await getTranslations('home')
  return (
    <>
      <PageHeader title={about.title} intro={about.intro} crumbs={[{ href: '/', label: tn('home') }, { label: tn('about') }]} />
      <div className="container-page py-12 sm:py-16">
        <div className="max-w-3xl space-y-12">
          {(about.sections ?? []).map((s) => (
            <section key={s.id} className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:gap-8">
              <h2 className="text-xl font-semibold text-gold-700 sm:text-2xl">{s.heading}</h2>
              <p className="text-lg leading-9 whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/services" className="btn-primary">
            {th('primaryCta')}
          </Link>
          <Link href="/contact" className="btn-outline">
            {tn('contact')}
          </Link>
        </div>
      </div>
    </>
  )
}
