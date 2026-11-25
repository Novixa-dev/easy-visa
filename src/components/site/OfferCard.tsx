import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Media, Offer } from '@/payload-types'
import { formatDate, formatPrice } from '@/lib/format'
import type { Locale } from '@/lib/constants'
import { cn } from '@/lib/misc'

export async function OfferCard({ offer, past = false }: { offer: Offer; past?: boolean }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('offers')
  const price = offer.price?.mode && offer.price.mode !== 'quote' ? formatPrice(offer.price, locale) : null
  const img = typeof offer.image === 'object' ? (offer.image as Media | null) : null
  return (
    <article className={cn('group relative flex flex-col overflow-hidden rounded-[var(--radius-ticket)] border border-line bg-white', past && 'opacity-70')}>
      {img?.url && (
        <div className="relative aspect-[16/9] bg-navy-50">
          <Image src={img.sizes?.card?.url || img.url} alt={img.alt ?? ''} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-medium text-gold-700">
          {past
            ? t('ended', { date: formatDate(offer.endDate!, locale) })
            : offer.endDate
              ? t('validUntil', { date: formatDate(offer.endDate, locale) })
              : null}
        </p>
        <h3 className="mt-1 text-xl font-semibold">
          <Link href={`/offers/${offer.slug}`} className="after:absolute after:inset-0">
            {offer.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[0.95rem] leading-7 text-muted">{offer.summary}</p>
        {price && <p className="mt-auto pt-4 font-display text-lg font-semibold text-navy-800">{price}</p>}
      </div>
    </article>
  )
}
