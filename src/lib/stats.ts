import 'server-only'
import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

type Row = Record<string, unknown>

async function q<T extends Row>(payload: Payload, query: ReturnType<typeof sql>): Promise<T[]> {
  // Aggregates run as single SQL statements so the dashboard stays fast with many visits.
  const db = (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: T[] }> } }).drizzle
  const res = await db.execute(query)
  return res.rows
}

const n = (v: unknown) => Number(v ?? 0)
const isoDay = (d: Date) => new Date(d.getTime() + 3 * 3600_000).toISOString().slice(0, 10) // Asia/Aden

export type Range = 7 | 30 | 90 | 365

export async function getStats(payload: Payload, days: Range = 30, locale: 'ar' | 'en' = 'ar') {
  const now = new Date()
  const from = new Date(now.getTime() - days * 86400_000)
  const prevFrom = new Date(from.getTime() - days * 86400_000)
  const fromDay = isoDay(from)
  const prevDay = isoDay(prevFrom)
  const todayDay = isoDay(now)

  const [visitsDaily, requestsDaily, visitTotals, prevVisitTotals, reqTotals, prevReqTotals, byStatus, bySource, byService, topPages, refs, devices, langs, payments, messages, trips, countries, payMethods] =
    await Promise.all([
      q<{ day: string; visitors: string; views: string }>(
        payload,
        sql`select day, count(distinct visitor) as visitors, count(*) as views from page_views where day > ${fromDay} group by day order by day`,
      ),
      q<{ day: string; c: string }>(
        payload,
        sql`select to_char(created_at at time zone 'Asia/Aden', 'YYYY-MM-DD') as day, count(*) as c from requests where created_at > ${from.toISOString()} group by 1 order by 1`,
      ),
      q<{ visitors: string; views: string }>(payload, sql`select count(distinct visitor || day) as visitors, count(*) as views from page_views where day > ${fromDay}`),
      q<{ visitors: string }>(payload, sql`select count(distinct visitor || day) as visitors from page_views where day > ${prevDay} and day <= ${fromDay}`),
      q<{ c: string; web: string }>(payload, sql`select count(*) as c, count(*) filter (where source = 'website') as web from requests where created_at > ${from.toISOString()}`),
      q<{ c: string }>(payload, sql`select count(*) as c from requests where created_at > ${prevFrom.toISOString()} and created_at <= ${from.toISOString()}`),
      q<{ status: string; c: string }>(payload, sql`select status, count(*) as c from requests where created_at > ${from.toISOString()} group by status`),
      q<{ source: string; c: string }>(payload, sql`select source, count(*) as c from requests where created_at > ${from.toISOString()} group by source order by c desc`),
      q<{ title: string | null; c: string }>(
        payload,
        sql`select coalesce(sl.title, tl.title, '—') as title, count(*) as c
            from requests r
            left join services_locales sl on sl._parent_id = r.service_id and sl._locale = ${locale}
            left join trips_locales tl on tl._parent_id = r.trip_id and tl._locale = ${locale}
            where r.created_at > ${from.toISOString()}
            group by 1 order by c desc limit 10`,
      ),
      q<{ path: string; c: string; u: string }>(payload, sql`select path, count(*) as c, count(distinct visitor) as u from page_views where day > ${fromDay} group by path order by c desc limit 10`),
      q<{ ref: string; c: string }>(
        payload,
        sql`select coalesce(nullif(referrer, ''), 'direct') as ref, count(distinct visitor || day) as c from page_views where day > ${fromDay} group by 1 order by c desc limit 8`,
      ),
      q<{ device: string; c: string }>(payload, sql`select coalesce(device, 'desktop') as device, count(distinct visitor || day) as c from page_views where day > ${fromDay} group by 1 order by c desc`),
      q<{ locale: string; c: string }>(payload, sql`select coalesce(locale, 'ar') as locale, count(*) as c from page_views where day > ${fromDay} group by 1`),
      q<{ status: string; currency: string; c: string; total: string }>(
        payload,
        sql`select status, currency, count(*) as c, sum(amount) as total from payments where created_at > ${from.toISOString()} group by status, currency`,
      ),
      q<{ status: string; c: string }>(payload, sql`select status, count(*) as c from contact_messages group by status`),
      q<{ id: number; slug: string; title: string; departure_at: string; seats_total: number | null; seats_booked: number | null; seats_held_offline: number | null; manual_full: boolean }>(
        payload,
        sql`select t.id, t.slug, tl.title, t.departure_at, t.seats_total, t.seats_booked, t.seats_held_offline, t.manual_full
            from trips t left join trips_locales tl on tl._parent_id = t.id and tl._locale = ${locale}
            where t.status = 'published' and t.departure_at > now() order by t.departure_at limit 8`,
      ),
      q<{ country: string; c: string }>(payload, sql`select coalesce(country, '—') as country, count(distinct visitor || day) as c from page_views where day > ${fromDay} group by 1 order by c desc limit 6`),
      q<{ method: string; c: string }>(payload, sql`select method, count(*) as c from payments where created_at > ${from.toISOString()} group by method order by c desc`),
    ])

  // Continuous series (fill empty days with zero).
  const series: { day: string; visitors: number; views: number; requests: number }[] = []
  const vMap = new Map(visitsDaily.map((r) => [r.day, r]))
  const rMap = new Map(requestsDaily.map((r) => [r.day, n(r.c)]))
  for (let i = days - 1; i >= 0; i--) {
    const day = isoDay(new Date(now.getTime() - i * 86400_000))
    series.push({ day, visitors: n(vMap.get(day)?.visitors), views: n(vMap.get(day)?.views), requests: rMap.get(day) ?? 0 })
  }

  const visitors = n(visitTotals[0]?.visitors)
  const prevVisitors = n(prevVisitTotals[0]?.visitors)
  const requests = n(reqTotals[0]?.c)
  const webRequests = n(reqTotals[0]?.web)
  const prevRequests = n(prevReqTotals[0]?.c)
  const delta = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100))

  return {
    days,
    today: todayDay,
    series,
    kpi: {
      visitors,
      visitorsDelta: delta(visitors, prevVisitors),
      views: n(visitTotals[0]?.views),
      requests,
      requestsDelta: delta(requests, prevRequests),
      conversion: visitors ? Math.round((webRequests / visitors) * 1000) / 10 : 0,
    },
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, n(r.c)])),
    bySource: bySource.map((r) => ({ key: r.source, value: n(r.c) })),
    byService: byService.map((r) => ({ key: r.title ?? '—', value: n(r.c) })),
    topPages: topPages.map((r) => ({ key: r.path, value: n(r.c), unique: n(r.u) })),
    referrers: refs.map((r) => ({ key: r.ref, value: n(r.c) })),
    devices: devices.map((r) => ({ key: r.device, value: n(r.c) })),
    languages: langs.map((r) => ({ key: r.locale, value: n(r.c) })),
    countries: countries.map((r) => ({ key: r.country, value: n(r.c) })),
    payMethods: payMethods.map((r) => ({ key: r.method, value: n(r.c) })),
    payments: payments.map((r) => ({ status: r.status, currency: r.currency, count: n(r.c), total: n(r.total) })),
    messages: Object.fromEntries(messages.map((r) => [r.status, n(r.c)])),
    trips: trips.map((t) => {
      // Postgres numeric columns arrive as strings: convert before adding.
      const total = n(t.seats_total)
      const used = n(t.seats_booked) + n(t.seats_held_offline)
      return { id: t.id, slug: t.slug, title: t.title, departureAt: t.departure_at, total, used, full: t.manual_full || (total > 0 && used >= total) }
    }),
  }
}

export type Stats = Awaited<ReturnType<typeof getStats>>

/** Open workload, independent of the date range. */
export async function getWorkload(payload: Payload) {
  const [open, stale, pendingPay, newMsgs, unassigned] = await Promise.all([
    q<{ c: string }>(payload, sql`select count(*) as c from requests where status not in ('completed','rejected','cancelled')`),
    q<{ c: string }>(payload, sql`select count(*) as c from requests where status = 'new' and created_at < now() - interval '24 hours'`),
    q<{ c: string }>(payload, sql`select count(*) as c from payments where status = 'pending_review'`),
    q<{ c: string }>(payload, sql`select count(*) as c from contact_messages where status = 'new'`),
    q<{ c: string }>(payload, sql`select count(*) as c from requests where assigned_to_id is null and status not in ('completed','rejected','cancelled')`),
  ])
  return { open: n(open[0]?.c), stale: n(stale[0]?.c), pendingPayments: n(pendingPay[0]?.c), newMessages: n(newMsgs[0]?.c), unassigned: n(unassigned[0]?.c) }
}
