import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { siteUrl } from '@/lib/misc'

// Generated per request (cheap) so the build never needs the database.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const payload = await getPayloadClient()
  const [services, categories, offers, trips] = await Promise.all([
    payload.find({ collection: 'services', where: { status: { equals: 'published' } }, limit: 200, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'service-categories', limit: 50, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'offers', where: { status: { equals: 'published' } }, limit: 200, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({
      collection: 'trips',
      where: { status: { equals: 'published' }, departureAt: { greater_than: new Date().toISOString() } },
      limit: 300,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
  ])
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: `${base}/ar${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    alternates: { languages: { ar: `${base}/ar${path}`, en: `${base}/en${path}` } },
  })
  return [
    entry('', undefined, 1),
    entry('/services', undefined, 0.9),
    ...categories.docs.map((c) => entry(`/services/${c.slug}`, c.updatedAt, 0.8)),
    ...services.docs.map((s) => entry(`/services/${s.slug}`, s.updatedAt, 0.8)),
    entry('/trips', undefined, 0.85),
    ...trips.docs.map((t) => entry(`/trips/${t.slug}`, t.updatedAt, 0.7)),
    entry('/offers', undefined, 0.7),
    ...offers.docs.map((o) => entry(`/offers/${o.slug}`, o.updatedAt, 0.5)),
    entry('/track', undefined, 0.6),
    entry('/about'),
    entry('/contact'),
    entry('/faq'),
    entry('/privacy', undefined, 0.2),
    entry('/terms', undefined, 0.2),
  ]
}
