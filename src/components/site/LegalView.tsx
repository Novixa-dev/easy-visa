import { getTranslations } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { PageHeader } from './PageHeader'
import { getLegal } from '@/lib/queries'
import { formatDate } from '@/lib/format'
import type { Locale } from '@/lib/constants'

export async function LegalView({ locale, which }: { locale: Locale; which: 'privacy' | 'terms' }) {
  const legal = await getLegal(locale)
  const t = await getTranslations('footer')
  const tn = await getTranslations('nav')
  const tt = await getTranslations('track')
  const content = legal[which]
  return (
    <>
      <PageHeader title={t(which)} crumbs={[{ href: '/', label: tn('home') }, { label: t(which) }]}>
        {legal.updatedOn && (
          <p className="mt-3 text-sm text-muted">
            {tt('updated')}: {formatDate(legal.updatedOn, locale)}
          </p>
        )}
      </PageHeader>
      <div className="container-page py-12 sm:py-16">
        <div className="prose-ev">{content && <RichText data={content} />}</div>
      </div>
    </>
  )
}
