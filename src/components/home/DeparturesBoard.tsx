import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Service, ServiceCategory } from '@/payload-types'
import { formatPrice } from '@/lib/format'
import type { Locale } from '@/lib/constants'
import { ChevronIcon, ServiceIcon } from '../icons'

type Row = Pick<Service, 'id' | 'title' | 'summary' | 'slug' | 'icon' | 'price' | 'available' | 'category'>

/**
 * Services presented like an airport departures board: one scannable row per
 * service, grouped by category, instead of a grid of identical cards.
 */
export async function DeparturesBoard({ services, categories, heading = true }: { services: Row[]; categories: ServiceCategory[]; heading?: boolean }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('home')
  const tc = await getTranslations('common')

  const groups = categories
    .map((c) => ({ c, items: services.filter((s) => (typeof s.category === 'object' ? s.category?.id : s.category) === c.id) }))
    .filter((g) => g.items.length)

  return (
    <div>
      {heading && (
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{t('boardTitle')}</h2>
          <p className="mt-3 text-lg text-muted">{t('boardIntro')}</p>
        </div>
      )}
      <div className="space-y-10">
        {groups.map(({ c, items }) => (
          <section key={c.id} aria-labelledby={`cat-${c.slug}`}>
            <div className="mb-3 flex items-baseline justify-between gap-4 border-b-2 border-navy-900 pb-2">
              <h3 id={`cat-${c.slug}`} className="text-xl font-semibold">
                <Link href={`/services/${c.slug}`} className="hover:text-navy-700">
                  {c.title}
                </Link>
              </h3>
              {items.some((s) => s.price?.mode && ['fixed', 'from', 'range'].includes(s.price.mode)) && <span className="hidden text-sm text-muted sm:inline">{t('colPrice')}</span>}
            </div>
            <ul className="divide-y divide-line">
              {items.map((s) => {
                // Only real figures on the board; "price on request" lives on the service page.
                const price = s.price?.mode && ['fixed', 'from', 'range'].includes(s.price.mode) ? formatPrice(s.price, locale) : null
                return (
                  <li key={s.id}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-navy-50/70 sm:grid-cols-[auto_minmax(0,14rem)_1fr_auto_auto] sm:px-2"
                    >
                      <span className="row-span-2 inline-flex size-12 items-center justify-center rounded-xl bg-navy-50 text-navy-800 ring-1 ring-navy-800/8 transition-colors group-hover:bg-white sm:row-span-1">
                        <ServiceIcon name={s.icon} size={26} />
                      </span>
                      <span className="font-display text-[1.08rem] font-semibold text-navy-900">
                        {s.title}
                        {s.available === false && <span className="ms-2 rounded bg-line px-1.5 py-0.5 align-middle text-xs font-medium text-muted">{tc('unavailable')}</span>}
                      </span>
                      <span className="col-start-2 line-clamp-2 text-[0.95rem] leading-6 text-muted sm:col-start-auto sm:line-clamp-1">{s.summary}</span>
                      <span className="col-start-3 row-start-1 text-end text-sm font-semibold whitespace-nowrap text-gold-700 sm:col-start-auto sm:row-start-auto">{price ?? ''}</span>
                      <ChevronIcon size={20} className="col-start-3 row-start-2 justify-self-end text-navy-800/40 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-800 sm:col-start-auto sm:row-start-auto rtl:group-hover:-translate-x-0.5" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
