import { createHash } from 'node:crypto'
import type { CollectionConfig, Endpoint } from 'payload'
import { isOwner, nobody } from '@/access'
import { L } from '@/fields/common'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|curl|wget/i

function device(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/mobi|iphone|android/i.test(ua)) return 'mobile'
  return 'desktop'
}

let lastPrune = 0

/**
 * POST /api/page-views/hit — cookieless visit counter.
 * The visitor id is a salted hash of IP + browser + day, so it cannot be
 * reversed and does not follow anyone across days.
 */
const hit: Endpoint = {
  path: '/hit',
  method: 'post',
  handler: async (req) => {
    const ua = req.headers.get('user-agent') ?? ''
    if (!ua || BOT.test(ua)) return new Response(null, { status: 204 })
    const ip = clientIp(req.headers)
    if (!rateLimit(`pv:${ip}`, 120, 10 * 60_000).ok) return new Response(null, { status: 204 })
    let b: { path?: string; locale?: string; referrer?: string } = {}
    try {
      b = await (req as unknown as Request).json()
    } catch {
      return new Response(null, { status: 204 })
    }
    const path = String(b.path ?? '/').split('?')[0].slice(0, 200)
    if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new Response(null, { status: 204 })
    const day = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10) // Asia/Aden
    const visitor = createHash('sha256').update(`${ip}|${ua}|${day}|${process.env.PAYLOAD_SECRET}`).digest('hex').slice(0, 20)
    let refHost: string | undefined
    try {
      const h = b.referrer ? new URL(b.referrer).hostname : ''
      const own = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost').hostname
      refHost = h && h !== own ? h.replace(/^www\./, '').slice(0, 100) : undefined
    } catch {}
    await req.payload.create({
      collection: 'page-views',
      data: {
        path,
        locale: b.locale === 'en' ? 'en' : 'ar',
        day,
        visitor,
        device: device(ua),
        referrer: refHost,
        country: (req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || '').slice(0, 2) || undefined,
      },
      overrideAccess: true,
    })
    // Keep about 13 months of raw visits.
    if (Date.now() - lastPrune > 6 * 3600_000) {
      lastPrune = Date.now()
      const cutoff = new Date(Date.now() - 400 * 86400_000).toISOString().slice(0, 10)
      req.payload.delete({ collection: 'page-views', where: { day: { less_than: cutoff } }, overrideAccess: true }).catch(() => {})
    }
    return new Response(null, { status: 204 })
  },
}

export const PageViews: CollectionConfig = {
  slug: 'page-views',
  labels: { singular: L('زيارة', 'Visit'), plural: L('الزيارات', 'Visits') },
  admin: { hidden: true, useAsTitle: 'path' },
  access: { read: ({ req }) => isOwner(req), create: nobody, update: nobody, delete: ({ req }) => isOwner(req) },
  endpoints: [hit],
  timestamps: true,
  fields: [
    { name: 'path', type: 'text', required: true, index: true },
    { name: 'locale', type: 'text' },
    { name: 'day', type: 'text', required: true, index: true },
    { name: 'visitor', type: 'text', index: true },
    { name: 'device', type: 'text', index: true },
    { name: 'referrer', type: 'text', index: true },
    { name: 'country', type: 'text' },
  ],
}
