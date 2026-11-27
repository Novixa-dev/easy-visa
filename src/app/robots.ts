import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/misc'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/ar/request/success', '/en/request/success'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  }
}
