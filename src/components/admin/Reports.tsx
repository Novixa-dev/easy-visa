import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getStats, type Range } from '@/lib/stats'
import { Kpis, OverviewGrid, type Lang } from './Overview'

const RANGES: Range[] = [7, 30, 90, 365]

/** /admin/reports — owner-only analytics with range selector and CSV export. */
export async function Reports({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, visibleEntities, locale } = initPageResult
  const user = req.user as { role?: string } | null
  if (!user) redirect('/admin/login?redirect=%2Fadmin%2Freports')
  const lang: Lang = req.i18n.language === 'en' ? 'en' : 'ar'
  const tr = (ar: string, en: string) => (lang === 'ar' ? ar : en)
  const sp = (await searchParams) ?? {}
  const days = (RANGES.includes(Number(sp.days) as Range) ? Number(sp.days) : 30) as Range

  const content =
    user.role !== 'owner' ? (
      <p>{tr('التقارير متاحة للمالك فقط.', 'Reports are available to the owner only.')}</p>
    ) : (
      await (async () => {
        const stats = await getStats(req.payload, days, lang)
        const from = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)
        return (
          <div className="ev-dash" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="ev-hero">
              <div>
                <h1 className="ev-hero__title">{tr('التقارير والإحصاءات', 'Reports & analytics')}</h1>
                <p className="ev-hero__sub">
                  {tr(
                    'الزيارات تُحسب بدون ملفات تعريف (كوكيز) ودون تتبع شخصي.',
                    'Visits are counted without cookies or personal tracking.',
                  )}
                </p>
              </div>
              <div className="ev-hero__actions">
                <nav className="ev-seg" aria-label={tr('الفترة', 'Period')}>
                  {RANGES.map((r) => (
                    <Link key={r} href={`/admin/reports?days=${r}`} aria-current={r === days ? 'page' : undefined}>
                      {r === 365 ? tr('سنة', '1 year') : tr(`${r} يوماً`, `${r} days`)}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <Kpis stats={stats} lang={lang} />
            <div style={{ marginTop: 16 }}>
              <OverviewGrid stats={stats} lang={lang} full />
            </div>
            <section className="ev-card" style={{ marginTop: 16 }}>
              <header className="ev-card__head">
                <h3>{tr('تصدير البيانات (CSV / Excel)', 'Export data (CSV / Excel)')}</h3>
              </header>
              <p style={{ marginTop: 0, opacity: 0.75 }}>
                {tr('ملفات تفتح في Excel بالعربية. لا تحتوي على المستندات.', 'Files open in Excel with Arabic text. Documents are never included.')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <a className="ev-btn ev-btn--navy" href={`/api/requests/export?type=requests&from=${from}`}>
                  {tr('الطلبات', 'Requests')}
                </a>
                <a className="ev-btn ev-btn--navy" href={`/api/requests/export?type=payments&from=${from}`}>
                  {tr('المدفوعات', 'Payments')}
                </a>
                <a className="ev-btn ev-btn--navy" href={`/api/requests/export?type=customers`}>
                  {tr('العملاء', 'Customers')}
                </a>
              </div>
            </section>
          </div>
        )
      })()
    )

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user || undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div style={{ paddingBlock: 24 }}>{content}</div>
      </Gutter>
    </DefaultTemplate>
  )
}
