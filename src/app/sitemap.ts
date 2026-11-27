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
  // Include an entry for every localized URL. Each entry also declares its
  // complete hreflang cluster, as recommended for multilingual sitemaps.
  const entries = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap =>
    (['ar', 'en'] as const).map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: 'weekly',
      priority,
      alternates: { languages: { ar: `${base}/ar${path}`, en: `${base}/en${path}`, 'x-default': `${base}/ar${path}` } },
    }))
  return [
    ...entries('', undefined, 1),
    ...entries('/services', undefined, 0.9),
    ...categories.docs.flatMap((c) => entries(`/services/${c.slug}`, c.updatedAt, 0.8)),
    ...services.docs.flatMap((s) => entries(`/services/${s.slug}`, s.updatedAt, 0.8)),
    ...entries('/trips', undefined, 0.85),
    ...trips.docs.flatMap((t) => entries(`/trips/${t.slug}`, t.updatedAt, 0.7)),
    ...entries('/offers', undefined, 0.7),
    ...offers.docs.flatMap((o) => entries(`/offers/${o.slug}`, o.updatedAt, 0.5)),
    ...entries('/track', undefined, 0.6),
    ...entries('/about'),
    ...entries('/contact'),
    ...entries('/faq'),
    ...entries('/privacy', undefined, 0.2),
    ...entries('/terms', undefined, 0.2),
  ]
}
