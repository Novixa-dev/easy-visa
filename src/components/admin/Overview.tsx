import Link from 'next/link'
import { REQUEST_STATUSES, STATUS_LABELS, type RequestStatus } from '@/lib/constants'
import type { Stats } from '@/lib/stats'
import { AreaChart, BarList, ShareBar, Sparkline } from './Charts'

export type Lang = 'ar' | 'en'

const DICT = {
  ar: {
    visitors: 'الزوار',
    views: 'مشاهدات الصفحات',
    requests: 'الطلبات',
    conversion: 'معدل التحويل',
    conversionHint: 'طلبات الموقع ÷ الزوار',
    vsPrev: 'مقارنة بالفترة السابقة',
    trend: 'الزيارات والطلبات يومياً',
    byStatus: 'الطلبات حسب الحالة',
    byService: 'الطلبات حسب الخدمة / الرحلة',
    bySource: 'مصدر الطلبات',
    topPages: 'أكثر الصفحات زيارة',
    referrers: 'من أين يأتي الزوار',
    devices: 'الأجهزة',
    languages: 'لغة التصفح',
    countries: 'الدول',
    payments: 'المدفوعات في الفترة',
    payMethods: 'طرق الدفع',
    trips: 'إشغال الرحلات القادمة',
    none: 'لا توجد بيانات بعد.',
    direct: 'مباشر / تطبيقات',
    mobile: 'جوال',
    tablet: 'تابلت',
    desktop: 'كمبيوتر',
    website: 'الموقع',
    whatsapp: 'واتساب',
    phone: 'هاتف',
    walk_in: 'حضوري',
    pending_review: 'بانتظار التحقق',
    paid: 'مؤكدة',
    rejected: 'مرفوضة',
    refunded: 'مستردة',
    bank_transfer: 'تحويل بنكي',
    card: 'بطاقة',
    remittance: 'حوالة',
    cash: 'نقداً',
    full: 'مكتملة',
    seats: 'مقعد',
  },
  en: {
    visitors: 'Visitors',
    views: 'Page views',
    requests: 'Requests',
    conversion: 'Conversion',
    conversionHint: 'website requests ÷ visitors',
    vsPrev: 'vs previous period',
    trend: 'Daily visits and requests',
    byStatus: 'Requests by status',
    byService: 'Requests by service / trip',
    bySource: 'Request sources',
    topPages: 'Top pages',
    referrers: 'Where visitors come from',
    devices: 'Devices',
    languages: 'Language',
    countries: 'Countries',
    payments: 'Payments in period',
    payMethods: 'Payment methods',
    trips: 'Upcoming trip occupancy',
    none: 'No data yet.',
    direct: 'Direct / apps',
    mobile: 'Mobile',
    tablet: 'Tablet',
    desktop: 'Desktop',
    website: 'Website',
    whatsapp: 'WhatsApp',
    phone: 'Phone',
    walk_in: 'Walk-in',
    pending_review: 'Awaiting check',
    paid: 'Confirmed',
    rejected: 'Rejected',
    refunded: 'Refunded',
    bank_transfer: 'Bank transfer',
    card: 'Card',
    remittance: 'Remittance',
    cash: 'Cash',
    full: 'Full',
    seats: 'seats',
  },
}

export const dict = (lang: Lang) => DICT[lang]

export const TONE: Record<RequestStatus, string> = {
  new: '#1d4ed8',
  under_review: '#7c3aed',
  awaiting_customer: '#c2410c',
  in_progress: '#0e7490',
  completed: '#15803d',
  rejected: '#b91c1c',
  cancelled: '#6b7280',
}

export function Card({ title, children, action, span }: { title?: string; children: React.ReactNode; action?: React.ReactNode; span?: boolean }) {
  return (
    <section className={`ev-card${span ? ' ev-card--span' : ''}`}>
      {(title || action) && (
        <header className="ev-card__head">
          {title && <h3>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

function Delta({ v, label }: { v: number; label: string }) {
  const up = v >= 0
  return (
    <span className={`ev-delta ${up ? 'ev-delta--up' : 'ev-delta--down'}`} title={label}>
      {up ? '▲' : '▼'} {Math.abs(v)}%
    </span>
  )
}

export function Kpis({ stats, lang }: { stats: Stats; lang: Lang }) {
  const d = dict(lang)
  const k = stats.kpi
  return (
    <div className="ev-kpis">
      <div className="ev-kpi">
        <span className="ev-kpi__label">{d.visitors}</span>
        <strong className="ev-kpi__value">{k.visitors.toLocaleString('en')}</strong>
        <div className="ev-kpi__foot">
          <Delta v={k.visitorsDelta} label={d.vsPrev} />
          <Sparkline values={stats.series.map((s) => s.visitors)} />
        </div>
      </div>
      <div className="ev-kpi">
        <span className="ev-kpi__label">{d.requests}</span>
        <strong className="ev-kpi__value">{k.requests.toLocaleString('en')}</strong>
        <div className="ev-kpi__foot">
          <Delta v={k.requestsDelta} label={d.vsPrev} />
          <Sparkline values={stats.series.map((s) => s.requests)} color="#cf9a2c" />
        </div>
      </div>
      <div className="ev-kpi">
        <span className="ev-kpi__label">{d.conversion}</span>
        <strong className="ev-kpi__value">{k.conversion}%</strong>
        <span className="ev-kpi__hint">{d.conversionHint}</span>
      </div>
      <div className="ev-kpi">
        <span className="ev-kpi__label">{d.views}</span>
        <strong className="ev-kpi__value">{k.views.toLocaleString('en')}</strong>
        <span className="ev-kpi__hint">{k.visitors ? `${(k.views / k.visitors).toFixed(1)} / ${d.visitors}` : '—'}</span>
      </div>
    </div>
  )
}

export function OverviewGrid({ stats, lang, full = false }: { stats: Stats; lang: Lang; full?: boolean }) {
  const d = dict(lang)
  const label = (k: string) => (d as Record<string, string>)[k] ?? k
  const statusItems = REQUEST_STATUSES.map((s) => ({ key: s, value: stats.byStatus[s] ?? 0, label: STATUS_LABELS[s][lang], href: `/admin/collections/requests?where[status][equals]=${s}` })).filter((x) => x.value > 0)
  const fmtDay = (iso: string) => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Aden' }).format(new Date(iso))
  return (
    <div className="ev-grid">
      <Card title={d.trend} span>
        <AreaChart data={stats.series} keys={['visitors', 'requests']} labels={[d.visitors, d.requests]} lang={lang} />
      </Card>
      <Card title={d.byStatus}>
        <BarList items={statusItems} empty={d.none} color="#16357a" />
      </Card>
      <Card title={d.byService}>
        <BarList items={stats.byService} empty={d.none} />
      </Card>
      <Card title={d.trips}>
        {stats.trips.length === 0 ? (
          <p style={{ opacity: 0.6, margin: 0 }}>{d.none}</p>
        ) : (
          <ul className="ev-list">
            {stats.trips.map((t) => {
              const pct = t.total ? Math.min(100, Math.round((t.used / t.total) * 100)) : 0
              return (
                <li key={t.id}>
                  <Link href={`/admin/collections/trips/${t.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13.5 }}>
                      <span>
                        {t.title} <small style={{ opacity: 0.6 }}>· {fmtDay(t.departureAt)}</small>
                      </span>
                      <strong>{t.full ? d.full : t.total ? `${t.used}/${t.total}` : '—'}</strong>
                    </div>
                    {t.total > 0 && (
                      <div style={{ height: 6, borderRadius: 4, background: 'var(--theme-elevation-100)', marginTop: 5 }}>
                        <div style={{ height: 6, borderRadius: 4, width: `${pct}%`, background: pct >= 90 ? '#b91c1c' : pct >= 70 ? '#cf9a2c' : '#15803d' }} />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
      <Card title={d.referrers}>
        <BarList items={stats.referrers} format={(k) => (k === 'direct' ? d.direct : k)} empty={d.none} color="#16357a" />
      </Card>
      <Card title={d.devices}>
        {stats.devices.length ? <ShareBar items={stats.devices} colors={['#16357a', '#cf9a2c', '#8aa1cf']} format={label} /> : <p style={{ opacity: 0.6, margin: 0 }}>{d.none}</p>}
        {full && stats.languages.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4 className="ev-sub">{d.languages}</h4>
            <ShareBar items={stats.languages} colors={['#0c2454', '#cf9a2c']} format={(k) => (k === 'ar' ? 'العربية' : 'English')} />
          </div>
        )}
      </Card>
      <Card title={d.topPages} span={full}>
        <BarList items={stats.topPages.map((p) => ({ ...p, label: decodeURI(p.key) }))} empty={d.none} color="#8aa1cf" />
      </Card>
      {full && (
        <>
          <Card title={d.bySource}>
            <BarList items={stats.bySource} format={label} empty={d.none} color="#16357a" />
          </Card>
          <Card title={d.countries}>
            <BarList items={stats.countries} empty={d.none} color="#8aa1cf" />
          </Card>
          <Card title={d.payments}>
            {stats.payments.length === 0 ? (
              <p style={{ opacity: 0.6, margin: 0 }}>{d.none}</p>
            ) : (
              <table className="ev-table">
                <tbody>
                  {stats.payments.map((p) => (
                    <tr key={p.status + p.currency}>
                      <td>{label(p.status)}</td>
                      <td>{p.count}</td>
                      <td style={{ textAlign: 'end', fontWeight: 600 }}>
                        {p.total.toLocaleString('en')} {p.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {stats.payMethods.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 className="ev-sub">{d.payMethods}</h4>
                <ShareBar items={stats.payMethods} colors={['#16357a', '#cf9a2c', '#15803d', '#8aa1cf']} format={label} />
              </div>
            )}
          </Card>
        </>
      )}
      <style>{`
        .ev-list{list-style:none;margin:0;padding:0;display:grid;gap:12px}
        .ev-list a{color:inherit;text-decoration:none;display:block}
        .ev-table{width:100%;border-collapse:collapse;font-size:14px}
        .ev-table td{padding:8px 4px;border-bottom:1px solid var(--theme-elevation-100)}
        .ev-sub{font-size:13px;margin:0 0 8px;opacity:.75;font-weight:600}
      `}</style>
    </div>
  )
}
