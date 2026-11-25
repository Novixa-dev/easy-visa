import type { Payload } from 'payload'
import Link from 'next/link'
import { STATUS_LABELS, type RequestStatus } from '@/lib/constants'
import { getStats, getWorkload } from '@/lib/stats'
import { Card, Kpis, OverviewGrid, TONE, type Lang } from './Overview'

type Props = { payload: Payload; i18n?: { language?: string }; user?: { name?: string; role?: string } | null }

/** Home of the dashboard: what needs action now, then the last 30 days. */
export async function Dashboard({ payload, i18n, user }: Props) {
  const lang: Lang = i18n?.language === 'en' ? 'en' : 'ar'
  const tr = (ar: string, en: string) => (lang === 'ar' ? ar : en)
  const isOwner = user?.role === 'owner'

  const [work, recent, stats] = await Promise.all([
    getWorkload(payload),
    payload.find({ collection: 'requests', sort: '-createdAt', limit: 7, depth: 1, locale: lang, overrideAccess: true }),
    isOwner ? getStats(payload, 30, lang) : Promise.resolve(null),
  ])

  const hour = Number(new Intl.DateTimeFormat('en', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Aden' }).format(new Date()))
  const greet = hour < 12 ? tr('صباح الخير', 'Good morning') : tr('مساء الخير', 'Good evening')
  const fmt = (d?: string | null) =>
    d ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Aden' }).format(new Date(d)) : '—'

  const actions = [
    { n: work.stale, label: tr('طلبات جديدة تنتظر أكثر من 24 ساعة', 'New requests waiting 24h+'), href: '/admin/collections/requests?where[status][equals]=new', tone: '#b45309' },
    { n: work.pendingPayments, label: tr('دفعات تنتظر التحقق', 'Payments to verify'), href: '/admin/collections/payments?where[status][equals]=pending_review', tone: '#1d4ed8' },
    { n: work.newMessages, label: tr('رسائل تواصل جديدة', 'New contact messages'), href: '/admin/collections/contact-messages?where[status][equals]=new', tone: '#7c3aed' },
    { n: work.unassigned, label: tr('طلبات مفتوحة بلا موظف مسؤول', 'Open requests with no owner'), href: '/admin/collections/requests?where[assignedTo][exists]=false', tone: '#0e7490' },
  ]

  return (
    <div className="ev-dash" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="ev-hero">
        <div>
          <p className="ev-hero__eyebrow">{new Intl.DateTimeFormat(lang === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Aden' }).format(new Date())}</p>
          <h2 className="ev-hero__title">
            {greet}
            {lang === 'ar' ? '، ' : ', '}
            {user?.name ?? ''}
          </h2>
          <p className="ev-hero__sub">{tr(`${work.open} طلب مفتوح حالياً`, `${work.open} open requests right now`)}</p>
        </div>
        <div className="ev-hero__actions">
          <Link className="ev-btn ev-btn--gold" href="/admin/collections/requests/create">
            + {tr('طلب يدوي', 'Manual request')}
          </Link>
          <Link className="ev-btn" href="/admin/collections/trips/create">
            + {tr('رحلة', 'Trip')}
          </Link>
          {isOwner && (
            <Link className="ev-btn" href="/admin/reports">
              {tr('التقارير', 'Reports')}
            </Link>
          )}
          <a className="ev-btn" href={`/${lang}`} target="_blank" rel="noopener noreferrer">
            {tr('عرض الموقع', 'View site')} ↗
          </a>
        </div>
      </div>

      <div className="ev-actions-grid">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className={`ev-action${a.n ? '' : ' ev-action--zero'}`} style={{ ['--tone' as string]: a.tone }}>
            <strong>{a.n}</strong>
            <span>{a.label}</span>
          </Link>
        ))}
      </div>

      {stats && (
        <>
          <div className="ev-section-head">
            <h3>{tr('آخر 30 يوماً', 'Last 30 days')}</h3>
            <Link href="/admin/reports">{tr('تقارير مفصّلة', 'Detailed reports')}</Link>
          </div>
          <Kpis stats={stats} lang={lang} />
        </>
      )}

      <div className="ev-grid" style={{ marginTop: 16 }}>
        <Card
          title={tr('أحدث الطلبات', 'Latest requests')}
          span={!stats}
          action={
            <Link href="/admin/collections/requests" className="ev-link">
              {tr('كل الطلبات', 'All requests')}
            </Link>
          }
        >
          {recent.docs.length === 0 && <p style={{ opacity: 0.7 }}>{tr('لا توجد طلبات بعد.', 'No requests yet.')}</p>}
          <ul className="ev-rows">
            {recent.docs.map((r) => {
              const s = r.status as RequestStatus
              const title = typeof r.trip === 'object' && r.trip ? r.trip.title : typeof r.service === 'object' && r.service ? r.service.title : ''
              return (
                <li key={r.id}>
                  <Link href={`/admin/collections/requests/${r.id}`}>
                    <span className="ev-rows__main">
                      <strong dir="ltr">{r.reference}</strong>
                      <span>
                        {r.contactName} · <small>{title}</small>
                      </span>
                    </span>
                    <span className="ev-rows__side">
                      <span className="ev-pill" style={{ ['--tone' as string]: TONE[s] }}>
                        {STATUS_LABELS[s][lang]}
                      </span>
                      <small>{fmt(r.createdAt)}</small>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {stats && (
        <div style={{ marginTop: 16 }}>
          <OverviewGrid stats={stats} lang={lang} />
        </div>
      )}

      <div className="ev-section-head" style={{ marginTop: 32 }}>
        <h3>{tr('كل الأقسام', 'All sections')}</h3>
      </div>
    </div>
  )
}
