import { Link } from '@/i18n/routing'
import { getLocale } from 'next-intl/server'
import { absoluteUrl, jsonLd } from '@/lib/seo'
import { ChevronIcon } from '../icons'

type Crumb = { href?: string; label: string }

export async function PageHeader({ title, intro, crumbs, children }: { title: string; intro?: string | null; crumbs?: Crumb[]; children?: React.ReactNode }) {
  const locale = await getLocale()
  const breadcrumbLd = crumbs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.label,
          ...(crumb.href ? { item: absoluteUrl(`/${locale}${crumb.href === '/' ? '' : crumb.href}`) } : {}),
        })),
      }
    : null
  return (
    <>
      {breadcrumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />}
      <section className="border-b border-line bg-navy-50">
        <div className="container-page py-10 sm:py-14">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-navy-800 hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-navy-900">
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <ChevronIcon size={14} className="opacity-50" />}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-3xl font-bold sm:text-[2.75rem]">{title}</h1>
        {intro && <p className="mt-3 max-w-[60ch] text-lg leading-8 text-muted">{intro}</p>}
        {children}
        </div>
      </section>
    </>
  )
}
