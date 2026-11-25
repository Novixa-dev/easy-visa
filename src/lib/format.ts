import type { Currency, Locale } from './constants'

const CURRENCY_LABEL: Record<Currency, { ar: string; en: string }> = {
  SAR: { ar: 'ريال سعودي', en: 'SAR' },
  YER: { ar: 'ريال يمني', en: 'YER' },
  USD: { ar: 'دولار', en: 'USD' },
}

export function formatMoney(amount: number, currency: Currency, locale: Locale): string {
  const n = new Intl.NumberFormat(locale === 'ar' ? 'ar-YE-u-nu-latn' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(amount)
  return locale === 'ar' ? `${n} ${CURRENCY_LABEL[currency].ar}` : `${CURRENCY_LABEL[currency].en} ${n}`
}

export function formatDate(value: string | Date, locale: Locale, withTime = false): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Asia/Aden',
  }).format(d)
}

/** Hijri (Umm al-Qura) date, shown next to Gregorian dates for Umrah travel. */
export function formatHijri(value: string | Date, locale: Locale): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-SA-u-ca-islamic-umalqura-nu-latn' : 'en-u-ca-islamic-umalqura',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Aden' },
  ).format(d)
}

export type PriceInfo = {
  mode?: 'hidden' | 'fixed' | 'from' | 'range' | 'quote' | null
  amount?: number | null
  amountMax?: number | null
  currency?: Currency | null
  indicative?: boolean | null
}

/** Returns null when no price should be shown. */
export function formatPrice(p: PriceInfo | undefined | null, locale: Locale): string | null {
  if (!p || !p.mode || p.mode === 'hidden') return null
  const c = (p.currency ?? 'SAR') as Currency
  if (p.mode === 'quote' || p.amount == null) return locale === 'ar' ? 'السعر عند الطلب' : 'Price on request'
  if (p.mode === 'fixed') return formatMoney(p.amount, c, locale)
  if (p.mode === 'from') return (locale === 'ar' ? 'ابتداءً من ' : 'From ') + formatMoney(p.amount, c, locale)
  if (p.mode === 'range' && p.amountMax != null)
    return `${formatMoney(p.amount, c, locale)} – ${formatMoney(p.amountMax, c, locale)}`
  return formatMoney(p.amount, c, locale)
}
